import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // code がない or 交換失敗 → ログイン画面にエラー付きでリダイレクト
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "確認リンクが無効か期限切れです。もう一度お試しください。");
  return NextResponse.redirect(loginUrl);
}
