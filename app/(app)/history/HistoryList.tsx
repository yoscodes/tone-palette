"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteGeneration } from "./actions";

// ─── 型 ──────────────────────────────────────────────────────
export interface Generation {
  id: string;
  input_text: string;
  output_text: string;
  tone_label: string | null;
  situation: string | null;
  formality: number;
  intimacy: number;
  created_at: string;
}

// ─── ユーティリティ ───────────────────────────────────────────
function safetyBadge(formality: number) {
  if (formality >= 0.6) return { label: "全業界で安全", color: "#16a34a", bg: "#dcfce7" };
  if (formality >= 0.3) return { label: "標準的",       color: "#2563eb", bg: "#dbeafe" };
  return                       { label: "ややカジュアル", color: "#ea580c", bg: "#ffedd5" };
}

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

function formatTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

const GRADIENT_BTN = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";

// ─── 1件カード ───────────────────────────────────────────────
function HistoryCard({
  item, onDelete,
}: {
  item: Generation;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered]             = useState(false);
  const [isPending, startTransition]      = useTransition();
  const badge = safetyBadge(item.formality);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.output_text);
    toast.success("コピーしました！");
  };

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      onDelete(item.id);
      const result = await deleteGeneration(item.id);
      if (result.error) toast.error("削除に失敗しました");
    });
  };

  const dashboardHref =
    `/dashboard?f=${item.formality.toFixed(3)}&i=${item.intimacy.toFixed(3)}` +
    `&s=${encodeURIComponent(item.situation ?? "承諾する")}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#faf9ff" : "#fff",
        borderRadius: 16, padding: "16px 20px",
        boxShadow: hovered
          ? "0 8px 28px rgba(70,60,120,.11)"
          : "0 4px 16px rgba(70,60,120,.06)",
        border: `1px solid ${hovered ? "rgba(123,106,208,.15)" : "rgba(20,20,40,.05)"}`,
        display: "flex", flexDirection: "column", gap: 0,
        transition: "box-shadow .18s, border-color .18s, background .18s",
      }}
    >
      {/* ── バッジ行 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: badge.color, background: badge.bg, padding: "2px 8px", borderRadius: 999 }}>
          {badge.label}
        </span>
        {item.situation && (
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#8a8ea0", background: "#f0f0f6", padding: "2px 8px", borderRadius: 999 }}>
            {item.situation}
          </span>
        )}
        {item.tone_label && (
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#7b6ad0", background: "rgba(123,106,208,.1)", padding: "2px 8px", borderRadius: 999 }}>
            {item.tone_label}
          </span>
        )}

        {/* 時刻 ＋ 削除 */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {confirmDelete ? (
            <>
              <span style={{ fontSize: 11, color: "#e05", fontWeight: 600 }}>削除しますか？</span>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                style={{
                  border: "none", borderRadius: 6, padding: "2px 9px",
                  background: "#ee0055", color: "#fff",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {isPending ? "…" : "削除"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ border: "none", background: "none", color: "#a3a6b8", fontSize: 15, cursor: "pointer", lineHeight: 1 }}
                aria-label="キャンセル"
              >×</button>
            </>
          ) : (
            <>
              <span style={{ fontSize: 10.5, color: "#b0b3c5", fontWeight: 500 }}>
                {formatTime(item.created_at)}
              </span>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#d0d3e0", padding: "2px", display: "flex", alignItems: "center" }}
                aria-label="削除"
                onMouseEnter={e => (e.currentTarget.style.color = "#ee0055")}
                onMouseLeave={e => (e.currentTarget.style.color = "#d0d3e0")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 出力テキスト（主役） ── */}
      <p style={{ fontSize: 15, fontWeight: 600, color: "#1c1f2b", lineHeight: 1.85, margin: "0 0 12px" }}>
        {item.output_text}
      </p>

      {/* ── 区切り線 ── */}
      <div style={{ height: 1, background: "#f0f0f6", marginBottom: 10 }} />

      {/* ── 入力テキスト ── */}
      <p style={{ fontSize: 12, color: "#9295a8", fontWeight: 500, margin: "0 0 12px", lineHeight: 1.65 }}>
        <span style={{ fontWeight: 700, color: "#b0b3c5", marginRight: 5 }}>元のテキスト:</span>
        {item.input_text}
      </p>

      {/* ── アクション行（右寄せ） ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        <Link
          href={dashboardHref}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 700, color: "#7b6ad0",
            textDecoration: "none", padding: "6px 13px",
            border: "1.5px solid rgba(123,106,208,.25)",
            borderRadius: 9, background: "rgba(123,106,208,.05)",
            transition: "background .15s, border-color .15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(123,106,208,.1)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(123,106,208,.5)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(123,106,208,.05)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(123,106,208,.25)";
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
          </svg>
          このトーンで作成
        </Link>

        <button
          onClick={handleCopy}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 700, color: "#fff",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            padding: "6px 14px", borderRadius: 9,
            background: "#1c1f2b",
            boxShadow: "0 2px 8px rgba(28,31,43,.12)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h8"/>
          </svg>
          コピー
        </button>
      </div>
    </div>
  );
}

// ─── フィルターバー ───────────────────────────────────────────
function FilterBar({
  isPro,
  query, onQueryChange,
  situations, selected, onSelect,
}: {
  isPro: boolean;
  query: string; onQueryChange: (v: string) => void;
  situations: string[]; selected: string | null; onSelect: (v: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
      {/* 検索バー */}
      <div style={{ position: "relative" }}>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b3c5" strokeWidth="2.2" strokeLinecap="round"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={isPro ? "テキストで検索…" : "🔒 Pro プランで検索できます"}
          disabled={!isPro}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px 10px 36px",
            border: "1.5px solid #e4e6f0", borderRadius: 12,
            fontSize: 13, fontFamily: "inherit", color: "#1c1f2b",
            background: isPro ? "#fff" : "#f7f7fb",
            outline: "none",
            cursor: isPro ? "text" : "not-allowed",
          }}
        />
        {!isPro && (
          <Link
            href="/settings#billing"
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 11, fontWeight: 700, color: "#7b6ad0",
              textDecoration: "none", padding: "3px 8px",
              background: "rgba(123,106,208,.1)", borderRadius: 6,
            }}
          >
            アップグレード →
          </Link>
        )}
      </div>

      {/* シチュエーションタブ */}
      {situations.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => isPro && onSelect(null)}
            disabled={!isPro}
            style={{
              border: `1.5px solid ${selected === null ? "#7b6ad0" : "#e4e6f0"}`,
              borderRadius: 999, padding: "4px 14px",
              background: selected === null ? "rgba(123,106,208,.1)" : "transparent",
              fontSize: 12, fontWeight: 700,
              color: selected === null ? "#7b6ad0" : "#9295a8",
              cursor: isPro ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all .15s",
            }}
          >
            すべて
          </button>
          {situations.map(s => (
            <button
              key={s}
              onClick={() => isPro && onSelect(selected === s ? null : s)}
              disabled={!isPro}
              style={{
                border: `1.5px solid ${selected === s ? "#7b6ad0" : "#e4e6f0"}`,
                borderRadius: 999, padding: "4px 14px",
                background: selected === s ? "rgba(123,106,208,.1)" : "transparent",
                fontSize: 12, fontWeight: 600,
                color: selected === s ? "#7b6ad0" : "#9295a8",
                cursor: isPro ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all .15s",
                opacity: isPro ? 1 : 0.5,
              }}
            >
              {isPro ? s : `🔒 ${s}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── リスト ───────────────────────────────────────────────────
export function HistoryList({
  initialGenerations,
  isPro,
}: {
  initialGenerations: Generation[];
  isPro: boolean;
}) {
  const [items, setItems]       = useState<Generation[]>(initialGenerations);
  const [query, setQuery]       = useState("");
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // ユニークなシチュエーション一覧（出現順）
  const situations = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const g of items) {
      if (g.situation && !seen.has(g.situation)) {
        seen.add(g.situation);
        result.push(g.situation);
      }
    }
    return result;
  }, [items]);

  // フィルター適用（Pro のみ有効）
  const filtered = useMemo(() => {
    if (!isPro) return items;
    return items.filter(g => {
      const matchSituation = selectedSituation ? g.situation === selectedSituation : true;
      const lq = query.trim().toLowerCase();
      const matchQuery = lq
        ? g.output_text.toLowerCase().includes(lq) || g.input_text.toLowerCase().includes(lq)
        : true;
      return matchSituation && matchQuery;
    });
  }, [items, query, selectedSituation, isPro]);

  // 日付でグルーピング
  const groups = useMemo(() => {
    const m = new Map<string, Generation[]>();
    for (const g of filtered) {
      const key = formatGroupDate(g.created_at);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(g);
    }
    return m;
  }, [filtered]);

  return (
    <div style={{ height: "100%", overflowY: "auto", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 48px" }}>

        {/* ページヘッダー */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>生成履歴</h1>
            <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, marginTop: 4 }}>
              過去に生成した表現を確認できます
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{
              marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#fff",
              background: GRADIENT_BTN,
              padding: "10px 18px", borderRadius: 999, textDecoration: "none",
              flexShrink: 0,
            }}
          >
            ＋ 新規作成
          </Link>
        </div>

        {/* フィルターバー */}
        <FilterBar
          isPro={isPro}
          query={query}
          onQueryChange={setQuery}
          situations={situations}
          selected={selectedSituation}
          onSelect={setSelectedSituation}
        />

        {/* 空状態 */}
        {items.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 20, padding: "60px 24px",
            textAlign: "center", boxShadow: "0 6px 24px rgba(70,60,120,.07)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
            <p style={{ fontSize: 15, color: "#7a7e90", fontWeight: 500, lineHeight: 1.7 }}>
              まだ生成履歴がありません。<br />
              「新規作成」から最初の変換を試してみましょう。
            </p>
            <Link
              href="/dashboard"
              style={{
                display: "inline-block", marginTop: 20, fontSize: 14, fontWeight: 700, color: "#fff",
                background: GRADIENT_BTN, padding: "13px 28px", borderRadius: 999, textDecoration: "none",
              }}
            >
              トーンを変換してみる →
            </Link>
          </div>
        )}

        {/* フィルター結果が0件 */}
        {items.length > 0 && filtered.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "40px 24px",
            textAlign: "center", boxShadow: "0 4px 16px rgba(70,60,120,.06)",
          }}>
            <p style={{ fontSize: 14, color: "#9295a8", fontWeight: 500, margin: 0 }}>
              条件に一致する履歴が見つかりませんでした
            </p>
          </div>
        )}

        {/* 日付グループ別リスト */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {[...groups.entries()].map(([dateLabel, groupItems]) => (
            <section key={dateLabel}>
              <h2 style={{
                fontSize: 11.5, fontWeight: 700, color: "#a3a6b8",
                letterSpacing: "0.07em", textTransform: "uppercase",
                marginBottom: 12,
              }}>
                {dateLabel} — {groupItems.length}件
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groupItems.map(item => (
                  <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}
