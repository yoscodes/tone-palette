import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLAN_MAP } from "@/config/plans";
import { startCheckout, createPortalSession } from "./actions";
import { AccountDeleteButton } from "./AccountDeleteButton";

const GRADIENT = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="#22c55e" />
      <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, generation_count, generation_month, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const planId   = (profile?.plan ?? "free") as keyof typeof PLAN_MAP;
  const plan     = PLAN_MAP[planId] ?? PLAN_MAP["free"];
  const limit    = plan.limits.palettesPerMonth;
  const stripeId = profile?.stripe_customer_id as string | null | undefined;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const count = profile?.generation_month === currentMonth
    ? (profile?.generation_count ?? 0)
    : 0;

  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - count);
  const pct       = limit === Infinity ? 0 : Math.min(100, (count / limit) * 100);

  const avatarUrl: string | undefined =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? undefined;


  return (
    <div style={{ height: "100%", overflowY: "auto", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 48px" }}>

      {/* ページタイトル */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>設定</h1>
        <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, marginTop: 4 }}>
          アカウント情報とプランを確認できます
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── アカウント情報 ── */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 20px" }}>
            アカウント情報
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="アバター"
                width={48}
                height={48}
                style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: GRADIENT,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "#fff",
              }}>
                {user.email?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: "#1c1f2b", margin: 0 }}>
                {user.email}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" aria-label="Google">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span style={{ fontSize: 11.5, color: "#9295a8", fontWeight: 500 }}>
                  Google でログイン中
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── プラン・請求 ── */}
        <div id="billing" style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 20px" }}>
            プラン・請求
          </h2>

          {/* 現在のプラン */}
          <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid #f0f0f6" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#9295a8", margin: "0 0 4px" }}>現在のプラン</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>{plan.name}</p>
            <p style={{ fontSize: 12.5, color: "#7a7e90", fontWeight: 500, marginTop: 3 }}>
              {plan.price === 0 ? "¥0 / 月 (無料)" : `¥${plan.price.toLocaleString()} / 月`}
            </p>
          </div>

          {/* 今月の利用状況 */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f0f0f6" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#9295a8", margin: 0 }}>今月の生成回数</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1f2b", margin: 0 }}>
                {count} / {limit === Infinity ? "∞" : limit} 回
              </p>
            </div>
            <div style={{ background: "#f0f0f6", borderRadius: 999, height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: `${pct}%`,
                background: pct > 80 ? "#f97316" : GRADIENT,
                transition: "width .4s",
              }} />
            </div>
            <p style={{ fontSize: 11.5, color: "#9295a8", fontWeight: 500, marginTop: 6 }}>
              {limit === Infinity ? "無制限プランのため上限なし" : `残り ${remaining} 回`}
            </p>
          </div>

          {/* Freeユーザー: アップグレードCTA / Proユーザー: ポータル */}
          {!stripeId ? (
            <div style={{
              border: "1.5px solid #e8e6f4", borderRadius: 14, padding: "20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>Pro</p>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#7b6ad0" }}>¥980 / 月</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {PLAN_MAP["pro"].features.slice(0, 3).map((f) => (
                    <span key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#4a4d60", fontWeight: 500 }}>
                      <CheckIcon />{f}
                    </span>
                  ))}
                </div>
              </div>
              <form action={startCheckout.bind(null, "pro")} style={{ flexShrink: 0 }}>
                <button
                  type="submit"
                  style={{
                    border: "none", fontFamily: "inherit", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
                    padding: "11px 20px", borderRadius: 10, background: GRADIENT,
                  }}
                >
                  アップグレード →
                </button>
              </form>
            </div>
          ) : (
            <div style={{
              background: "#f7f7fb", borderRadius: 14, padding: "18px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1c1f2b", margin: "0 0 3px" }}>
                  プランの変更・解約
                </p>
                <p style={{ fontSize: 12, color: "#9295a8", fontWeight: 500, margin: 0 }}>
                  カード情報の更新やダウングレード・解約はこちら
                </p>
              </div>
              <form action={createPortalSession} style={{ flexShrink: 0 }}>
                <button
                  type="submit"
                  style={{
                    border: "none", fontFamily: "inherit", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
                    padding: "11px 20px", borderRadius: 10, background: GRADIENT,
                  }}
                >
                  カスタマーポータル →
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Danger Zone ── */}
        <div style={{
          border: "1.5px solid rgba(220,38,38,.25)",
          background: "rgba(220,38,38,.03)",
          borderRadius: 20, padding: "28px",
        }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Danger Zone
          </h2>
          <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, margin: "0 0 20px", lineHeight: 1.6 }}>
            アカウントを削除すると、すべての生成履歴・プリセット・プロフィールが完全に失われます。この操作は取り消せません。
          </p>
          <AccountDeleteButton />
        </div>

      </div>
      </div>
    </div>
  );
}
