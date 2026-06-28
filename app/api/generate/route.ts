import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // ── 認証チェック ──────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // ── リクエストパース ──────────────────────────────────────
  let body: { text?: string; formality?: number; intimacy?: number; situation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエスト形式が不正です" }, { status: 400 });
  }

  const { text, formality = 0.5, intimacy = 0.5, situation } = body;
  if (!text?.trim()) {
    return NextResponse.json({ error: "テキストを入力してください" }, { status: 400 });
  }
  if (text.trim().length > 500) {
    return NextResponse.json({ error: "テキストは500文字以内で入力してください" }, { status: 400 });
  }

  // ── 生成消費（原子的チェック＋インクリメント）────────────
  // FOR UPDATE ロックにより同時リクエストの二重消費を防ぐ
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: consume, error: consumeError } = await supabase
    .rpc("try_consume_generation", { p_user_id: user.id, p_month: currentMonth });

  if (consumeError) {
    return NextResponse.json({ error: "プロファイルが見つかりません" }, { status: 404 });
  }
  if (!consume?.ok) {
    if (consume?.reason === "limit_exceeded") {
      return NextResponse.json(
        { error: `今月の生成上限（${consume.limit}回）に達しました。プランをアップグレードしてください。` },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "プロファイルが見つかりません" }, { status: 404 });
  }

  // ── Claude API 呼び出し ───────────────────────────────────
  const formalityLabel = formality < 0.33 ? "カジュアル（くだけた）" : formality < 0.67 ? "標準的（丁寧）" : "フォーマル（かしこまった）";
  const intimacyLabel  = intimacy  < 0.33 ? "丁寧（距離感あり）"    : intimacy  < 0.67 ? "標準的"          : "フランク（親密）";
  const situationText  = situation ? `\nシチュエーション: ${situation}` : "";

  const prompt = `あなたはビジネス文章の言い換えの専門家です。
以下の入力文を、指定されたトーンに書き換えてください。

入力文: 「${text.trim()}」
フォーマリティ（敬語の度合い）: ${formalityLabel}（スコア: ${formality.toFixed(2)} / 0=カジュアル, 1=フォーマル）
親密さ: ${intimacyLabel}（スコア: ${intimacy.toFixed(2)} / 0=距離感あり, 1=親密）${situationText}

以下のJSONのみを返してください（説明文・コードブロック不要）:
{
  "output": "書き換えた文章（1〜2文）",
  "tone_label": "トーンを表す短いラベル（例: フォーマル×丁寧）"
}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let output: string;
  let toneLabel: string;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw);
    output    = parsed.output    ?? "";
    toneLabel = parsed.tone_label ?? `${formalityLabel}×${intimacyLabel}`;
  } catch (err) {
    console.error("Claude API error:", err);
    // API失敗時はカウントを返金して消費をなかったことにする
    await supabase.rpc("refund_generation", { p_user_id: user.id });
    return NextResponse.json({ error: "AI生成中にエラーが発生しました" }, { status: 500 });
  }

  // ── DB 保存 ────────────────────────────────────────────────
  await supabase.from("palette_generations").insert({
    user_id:     user.id,
    input_text:  text.trim(),
    formality,
    intimacy,
    situation:   situation ?? null,
    output_text: output,
    tone_label:  toneLabel,
  });

  return NextResponse.json({
    output,
    toneLabel,
    remaining: consume.remaining,
  });
}
