"use server";

import { createClient } from "@/lib/supabase/server";

const PRESET_LIMITS: Record<string, number> = { free: 5, pro: 20 };

export async function savePreset(name: string, formality: number, intimacy: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan  = profile?.plan ?? "free";
  const limit = PRESET_LIMITS[plan] ?? 5;

  const { count } = await supabase
    .from("recipient_presets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= limit) {
    return {
      error: plan === "free"
        ? `無料プランはプリセット${limit}件まで。Proにアップグレードすると20件保存できます。`
        : `プリセットは${limit}件まで保存できます。`,
    };
  }

  const { data, error } = await supabase
    .from("recipient_presets")
    .insert({ user_id: user.id, name: name.trim(), formality, intimacy })
    .select("id, name, formality, intimacy")
    .single();

  if (error) return { error: error.message };
  return { preset: data as { id: string; name: string; formality: number; intimacy: number } };
}

export async function deletePreset(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase
    .from("recipient_presets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { ok: true };
}
