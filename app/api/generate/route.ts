import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SYSTEM_PROMPT = `あなたはビジネス文章のトーン変換の専門家です。
ユーザーが送る入力文を、指定されたフォーマリティ・親密さのトーンで日本語ビジネス文章として書き換えてください。

出力形式（厳守）:
1行目: 書き換えた文章のみ（1〜2文・余計な記号や引用符不要）
2行目: {"tone_label":"トーンを表す4〜8文字のラベル","reason":"主な言い換え根拠を1文（例: 「了解です」→「承知いたしました」は社外・目上向けの定番表現）"}

余計な説明文・コードブロック・空行は一切出力しないでください。`;

const GUEST_LIMIT = 3;

export async function POST(req: NextRequest) {
  // ── リクエストパース ──────────────────────────────────────
  let body: { text?: string; formality?: number; intimacy?: number; situation?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "リクエスト形式が不正です" }, { status: 400 });
  }

  const { text, formality = 0.5, intimacy = 0.5, situation } = body;
  if (!text?.trim()) {
    return Response.json({ error: "テキストを入力してください" }, { status: 400 });
  }
  if (text.trim().length > 500) {
    return Response.json({ error: "テキストは500文字以内で入力してください" }, { status: 400 });
  }

  // ── 認証チェック ──────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── ゲストモード ──────────────────────────────────────────
  const guestId = req.headers.get("x-guest-id");

  if (!user) {
    if (!guestId || guestId.trim().length < 8) {
      return Response.json({ error: "ログインが必要です" }, { status: 401 });
    }

    // ゲストの生成回数チェック（service role でRLSバイパス）
    const { count } = await supabaseAdmin
      .from("guest_generations")
      .select("id", { count: "exact", head: true })
      .eq("guest_id", guestId);

    if ((count ?? 0) >= GUEST_LIMIT) {
      return Response.json(
        { error: "ゲスト利用の上限に達しました", code: "guest_limit" },
        { status: 429 }
      );
    }

    return streamGenerate({ text, formality, intimacy, situation, guestId });
  }

  // ── 認証済みユーザー：クォータ消費 ───────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: consume, error: consumeError } = await supabase
    .rpc("try_consume_generation", { p_user_id: user.id, p_month: currentMonth });

  if (consumeError) {
    return Response.json({ error: "プロファイルが見つかりません" }, { status: 404 });
  }
  if (!consume?.ok) {
    if (consume?.reason === "limit_exceeded") {
      return Response.json(
        { error: `今月の生成上限（${consume.limit}回）に達しました。プランをアップグレードしてください。` },
        { status: 429 }
      );
    }
    return Response.json({ error: "プロファイルが見つかりません" }, { status: 404 });
  }

  return streamGenerate({ text, formality, intimacy, situation, user, supabase, consume });
}

// ── 共通ストリーミング生成 ──────────────────────────────────
type GenerateOptions =
  | { text: string; formality: number; intimacy: number; situation?: string; guestId: string }
  | { text: string; formality: number; intimacy: number; situation?: string; user: { id: string }; supabase: Awaited<ReturnType<typeof createClient>>; consume: { remaining: number } };

function streamGenerate(opts: GenerateOptions) {
  const { text, formality, intimacy, situation } = opts;
  const isGuest = "guestId" in opts;

  const formalityLabel = formality < 0.33 ? "カジュアル（くだけた）" : formality < 0.67 ? "標準的（丁寧）" : "フォーマル（かしこまった）";
  const intimacyLabel  = intimacy  < 0.33 ? "丁寧（距離感あり）"    : intimacy  < 0.67 ? "標準的"         : "フランク（親密）";
  const situationText  = situation ? `\nシチュエーション: ${situation}` : "";

  const userMessage = `入力文: ${text.trim()}
フォーマリティ: ${formalityLabel}
親密さ: ${intimacyLabel}${situationText}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder   = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = "";

      try {
        const stream = anthropic.messages.stream({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system:     SYSTEM_PROMPT,
          messages:   [{ role: "user", content: userMessage }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`)
            );
          }
        }

        const newlineIdx = fullText.indexOf("\n");
        const outputText = (newlineIdx !== -1 ? fullText.slice(0, newlineIdx) : fullText).trim();
        const metaLine   = newlineIdx !== -1 ? fullText.slice(newlineIdx + 1).trim() : "";

        let toneLabel = `${formalityLabel}×${intimacyLabel}`;
        let reason    = "";
        if (metaLine) {
          try {
            const cleaned = metaLine.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            const meta    = JSON.parse(cleaned);
            toneLabel = meta.tone_label ?? toneLabel;
            reason    = meta.reason    ?? "";
          } catch {}
        }

        // DB 保存
        let insertedId = crypto.randomUUID();
        let remaining: number | null = null;

        if (isGuest) {
          const { data: ins } = await supabaseAdmin
            .from("guest_generations")
            .insert({
              guest_id:    opts.guestId,
              input_text:  text.trim(),
              formality,
              intimacy,
              situation:   situation ?? null,
              output_text: outputText,
              tone_label:  toneLabel,
            })
            .select("id")
            .single();
          if (ins?.id) insertedId = ins.id;
        } else {
          const { supabase, user, consume } = opts as Extract<GenerateOptions, { user: unknown }>;
          const { data: ins } = await supabase
            .from("palette_generations")
            .insert({
              user_id:     user.id,
              input_text:  text.trim(),
              formality,
              intimacy,
              situation:   situation ?? null,
              output_text: outputText,
              tone_label:  toneLabel,
            })
            .select("id")
            .single();
          if (ins?.id) insertedId = ins.id;
          remaining = consume.remaining;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            done: true,
            toneLabel,
            reason,
            remaining,
            historyItem: {
              id:          insertedId,
              input_text:  text.trim(),
              output_text: outputText,
              tone_label:  toneLabel,
              formality,
            },
          })}\n\n`)
        );
      } catch (err) {
        console.error("Stream error:", err);
        if (!isGuest) {
          const { supabase, user } = opts as Extract<GenerateOptions, { user: unknown }>;
          await supabase.rpc("refund_generation", { p_user_id: user.id });
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "AI生成中にエラーが発生しました" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
