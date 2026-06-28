"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerEarlyAccess(_: unknown, formData: FormData) {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "有効なメールアドレスを入力してください" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("early_access_leads").insert({ email });

  if (error) {
    // 23505 = unique_violation（すでに登録済み）→ 成功扱いにする
    if (error.code === "23505") return { success: true };
    return { error: "登録に失敗しました。しばらく経ってからお試しください。" };
  }

  return { success: true };
}
