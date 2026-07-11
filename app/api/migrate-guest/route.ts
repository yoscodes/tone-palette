import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  let guestId: string;
  try {
    const body = await req.json();
    guestId = body.guestId;
  } catch {
    return Response.json({ error: "リクエスト形式が不正です" }, { status: 400 });
  }

  if (!guestId || typeof guestId !== "string" || guestId.trim().length < 8) {
    return Response.json({ error: "無効なゲストIDです" }, { status: 400 });
  }

  // ゲスト履歴をユーザー履歴に移行（RLS バイパスは不要 — security definer 関数が処理）
  const { data, error } = await supabase.rpc("migrate_guest_to_user", {
    p_guest_id: guestId.trim(),
    p_user_id:  user.id,
  });

  if (error) {
    console.error("migrate_guest_to_user error:", error);
    return Response.json({ error: "履歴の引き継ぎに失敗しました" }, { status: 500 });
  }

  const items = Array.isArray(data) ? data : [];

  return Response.json({ items });
}
