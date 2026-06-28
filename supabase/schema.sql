-- ============================================================
-- tone palette — Supabase schema
-- Supabase Dashboard > SQL Editor にそのまま貼り付けて実行
-- ============================================================

-- ── 1. profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id                        uuid        primary key references auth.users(id) on delete cascade,
  email                     text        not null,
  plan                      text        not null default 'free'
                              check (plan in ('free', 'tier1', 'tier2', 'tier3')),
  generation_count          int         not null default 0,
  generation_month          text        not null default to_char(now(), 'YYYY-MM'),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- ── 2. palette_generations ───────────────────────────────────
create table if not exists public.palette_generations (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  input_text   text        not null,
  formality    float       not null check (formality between 0 and 1),
  intimacy     float       not null check (intimacy between 0 and 1),
  situation    text,
  output_text  text        not null,
  tone_label   text,
  created_at   timestamptz not null default now()
);

alter table public.palette_generations enable row level security;

create policy "own generations read"   on public.palette_generations for select using (auth.uid() = user_id);
create policy "own generations insert" on public.palette_generations for insert with check (auth.uid() = user_id);

-- ── 3. signup トリガー（profiles を自動作成）─────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 4. 生成消費の原子的操作 ─────────────────────────────────
-- チェックとインクリメントを1トランザクションで実行し二重消費を防ぐ
create or replace function public.try_consume_generation(
  p_user_id uuid,
  p_month   text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile  public.profiles%rowtype;
  v_limit    int;
begin
  select * into v_profile
  from   public.profiles
  where  id = p_user_id
  for update;

  if not found then
    return json_build_object('ok', false, 'reason', 'profile_not_found');
  end if;

  if v_profile.generation_month <> p_month then
    v_profile.generation_count := 0;
    v_profile.generation_month := p_month;
  end if;

  v_limit := case v_profile.plan
    when 'free'  then 10
    when 'tier1' then 30
    when 'tier2' then 200
    when 'tier3' then 2147483647
    else 10
  end;

  if v_profile.generation_count >= v_limit then
    return json_build_object('ok', false, 'reason', 'limit_exceeded', 'limit', v_limit);
  end if;

  update public.profiles
  set    generation_count = v_profile.generation_count + 1,
         generation_month = p_month
  where  id = p_user_id;

  return json_build_object(
    'ok',        true,
    'remaining', v_limit - v_profile.generation_count - 1
  );
end;
$$;

-- Claude API 失敗時のカウント返金
create or replace function public.refund_generation(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set generation_count = greatest(0, generation_count - 1)
  where id = p_user_id;
end;
$$;

-- ── 5. updated_at 自動更新 ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── 6. プランを Free / Pro の2プランに変更（マイグレーション）─
-- ※ テーブル作成後に実行（冪等）

-- 旧 tier1〜tier3 のデータを free に戻す（既存ユーザーがいる場合）
update public.profiles set plan = 'free' where plan in ('tier1', 'tier2', 'tier3');

-- check 制約を付け替え
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'pro'));

-- 生成消費関数を Free=10 / Pro=30 に更新
create or replace function public.try_consume_generation(
  p_user_id uuid,
  p_month   text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile  public.profiles%rowtype;
  v_limit    int;
begin
  select * into v_profile
  from   public.profiles
  where  id = p_user_id
  for update;

  if not found then
    return json_build_object('ok', false, 'reason', 'profile_not_found');
  end if;

  if v_profile.generation_month <> p_month then
    v_profile.generation_count := 0;
    v_profile.generation_month := p_month;
  end if;

  v_limit := case v_profile.plan
    when 'pro'  then 30
    else 10  -- free
  end;

  if v_profile.generation_count >= v_limit then
    return json_build_object('ok', false, 'reason', 'limit_exceeded', 'limit', v_limit);
  end if;

  update public.profiles
  set    generation_count = v_profile.generation_count + 1,
         generation_month = p_month
  where  id = p_user_id;

  return json_build_object(
    'ok',        true,
    'remaining', v_limit - v_profile.generation_count - 1
  );
end;
$$;

-- stripe_customer_id カラムを追加
alter table public.profiles add column if not exists stripe_customer_id text unique;

-- ── 7. early_access_leads ─────────────────────────────────────
create table if not exists public.early_access_leads (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  created_at timestamptz not null default now()
);

alter table public.early_access_leads enable row level security;

-- 未認証ユーザー（マーケティングページ訪問者）からのINSERTを許可
create policy "public early access insert"
  on public.early_access_leads for insert
  to anon, authenticated
  with check (true);
