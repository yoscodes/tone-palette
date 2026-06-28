import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// ─── 安全性バッジ ─────────────────────────────────────────────
function safetyBadge(formality: number) {
  if (formality >= 0.6) return { label: "全業界で安全",   color: "#16a34a", bg: "#dcfce7" };
  if (formality >= 0.3) return { label: "標準的",         color: "#2563eb", bg: "#dbeafe" };
  return                       { label: "ややカジュアル", color: "#ea580c", bg: "#ffedd5" };
}

// ─── 日付グルーピング ─────────────────────────────────────────
function formatGroupDate(isoStr: string): string {
  const d = new Date(isoStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(d, today))     return "今日";
  if (sameDay(d, yesterday)) return "昨日";
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

// ─── 型 ──────────────────────────────────────────────────────
interface Generation {
  id: string;
  input_text: string;
  output_text: string;
  tone_label: string | null;
  situation: string | null;
  formality: number;
  created_at: string;
}

// ─── HistoryCard（Server Component で OK） ───────────────────
function HistoryCard({ item }: { item: Generation }) {
  const badge = safetyBadge(item.formality);
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 4px 16px rgba(70,60,120,.06)",
      border: "1px solid rgba(20,20,40,.05)",
    }}>
      {/* ヘッダー行 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {item.tone_label && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#7b6ad0", background: "rgba(123,106,208,.1)", padding: "3px 10px", borderRadius: 999 }}>
            {item.tone_label}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg, padding: "3px 10px", borderRadius: 999 }}>
          {badge.label}
        </span>
        {item.situation && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8a8ea0", background: "#f0f0f6", padding: "3px 10px", borderRadius: 999 }}>
            {item.situation}
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#b0b3c5", fontWeight: 500 }}>
          {formatTime(item.created_at)}
        </span>
      </div>

      {/* 出力テキスト */}
      <p style={{ fontSize: 15, fontWeight: 500, color: "#1c1f2b", lineHeight: 1.75, margin: "0 0 10px" }}>
        {item.output_text}
      </p>

      {/* 入力テキスト */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#a3a6b8", marginTop: 2, flexShrink: 0 }}>入力</span>
        <p style={{ fontSize: 12.5, color: "#7a7e90", fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
          {item.input_text}
        </p>
      </div>
    </div>
  );
}

// ─── メイン（RSC） ────────────────────────────────────────────
export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("palette_generations")
    .select("id, input_text, output_text, tone_label, situation, formality, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const generations: Generation[] = data ?? [];

  // 日付でグルーピング
  const groups = new Map<string, Generation[]>();
  for (const g of generations) {
    const key = formatGroupDate(g.created_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }

  return (
    <div style={{ minHeight: "100%", padding: "28px 28px 48px", fontFamily: "inherit" }}>
      {/* ページタイトル */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>生成履歴</h1>
          <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, marginTop: 4 }}>
            {generations.length === 0
              ? "まだ生成履歴がありません"
              : `${generations.length} 件の生成履歴`}
          </p>
        </div>
        <Link
          href="/dashboard"
          style={{
            marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#fff",
            background: "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)",
            padding: "10px 18px", borderRadius: 999, textDecoration: "none",
          }}
        >
          + 新規作成
        </Link>
      </div>

      {/* 空状態 */}
      {generations.length === 0 && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: "60px 24px",
          textAlign: "center", boxShadow: "0 6px 24px rgba(70,60,120,.07)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
          <p style={{ fontSize: 15, color: "#7a7e90", fontWeight: 500, lineHeight: 1.7 }}>
            まだ生成履歴がありません。<br />
            ダッシュボードから最初の変換を試してみましょう。
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-block", marginTop: 20, fontSize: 14, fontWeight: 700, color: "#fff",
              background: "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)",
              padding: "13px 28px", borderRadius: 999, textDecoration: "none",
            }}
          >
            トーンを変換してみる →
          </Link>
        </div>
      )}

      {/* 日付グループ別リスト */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {[...groups.entries()].map(([dateLabel, items]) => (
          <section key={dateLabel}>
            <h2 style={{
              fontSize: 12, fontWeight: 700, color: "#a3a6b8",
              letterSpacing: "0.07em", textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {dateLabel} — {items.length}件
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
