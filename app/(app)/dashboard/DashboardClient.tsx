"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";

// ─── 定数 ─────────────────────────────────────────────────────
const GRADIENT     = "linear-gradient(135deg,#ff8a5b 0%,#f76b8a 38%,#b06ab3 66%,#6a82fb 100%)";
const GRADIENT_BTN = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";
const SITUATIONS   = ["承諾する", "謝罪する", "依頼する", "日程調整する", "お断りする"];

// ─── 安全性バッジ ─────────────────────────────────────────────
function safetyBadge(formality: number): { label: string; color: string; bg: string } {
  if (formality >= 0.6) return { label: "全業界で安全",   color: "#16a34a", bg: "#dcfce7" };
  if (formality >= 0.3) return { label: "標準的",         color: "#2563eb", bg: "#dbeafe" };
  return                       { label: "ややカジュアル", color: "#ea580c", bg: "#ffedd5" };
}

// ─── 型 ──────────────────────────────────────────────────────
export interface HistoryItem {
  id: string;
  input_text: string;
  output_text: string;
  tone_label: string | null;
  formality: number;
}

// ─── パレット選択 UI ─────────────────────────────────────────
function PaletteSelector({
  formality, intimacy, onChange,
}: {
  formality: number; intimacy: number;
  onChange: (f: number, i: number) => void;
}) {
  const sqRef = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.max(0.03, Math.min(0.97, v));

  const updateFromPointer = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!sqRef.current) return;
    const r = sqRef.current.getBoundingClientRect();
    onChange(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height));
  }, [onChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    updateFromPointer(e);
    const move = (ev: PointerEvent) => updateFromPointer(ev);
    const up   = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div style={{ position: "relative", padding: "32px 56px 40px", touchAction: "none" }}>
      {[
        { text: "フランク（親密）",          style: { position: "absolute" as const, top: 4,  left: "50%", transform: "translateX(-50%)", textAlign: "center" as const } },
        { text: "カジュアル\n（くだけた）",   style: { position: "absolute" as const, left: 0, top: "50%",  transform: "translateY(-50%)", textAlign: "center" as const, width: 48, lineHeight: 1.3 } },
        { text: "フォーマル\n（かしこまった）", style: { position: "absolute" as const, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center" as const, width: 48, lineHeight: 1.3 } },
        { text: "丁寧（標準的）",             style: { position: "absolute" as const, bottom: 6, left: "50%", transform: "translateX(-50%)" } },
      ].map(({ text, style }) => (
        <span key={text} style={{ ...style, fontSize: 9.5, fontWeight: 700, color: "#a3a6b8", whiteSpace: "pre-line" }}>
          {text}
        </span>
      ))}
      <div
        ref={sqRef}
        onPointerDown={onPointerDown}
        style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: 16, background: GRADIENT, cursor: "grab", touchAction: "none", userSelect: "none" }}
      >
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1.5, background: "rgba(255,255,255,.45)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1.5, background: "rgba(255,255,255,.45)" }} />
        <div style={{
          position: "absolute",
          left: `${(formality * 100).toFixed(1)}%`,
          top:  `${((1 - intimacy) * 100).toFixed(1)}%`,
          transform: "translate(-50%,-50%)",
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,.92)", boxShadow: "0 4px 14px rgba(0,0,0,.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a78c8" strokeWidth="2">
            <path d="M7 7l-3 3 3 3M17 7l3 3-3 3M7 10h10" />
          </svg>
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: 10.5, color: "#a3a6b8", fontWeight: 500, marginTop: 8 }}>
        ドラッグしてトーンを調整
      </p>
    </div>
  );
}

// ─── 直近履歴カード ───────────────────────────────────────────
function MiniHistoryCard({ item, onRestore }: { item: HistoryItem; onRestore: (text: string) => void }) {
  const badge = safetyBadge(item.formality);
  return (
    <div
      onClick={() => onRestore(item.output_text)}
      style={{
        background: "#f7f7fb", borderRadius: 12, padding: "11px 13px",
        cursor: "pointer", border: "1.5px solid transparent", transition: "border-color .15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#d4c9f0")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#7b6ad0" }}>{item.tone_label ?? "—"}</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: badge.color, background: badge.bg, padding: "2px 7px", borderRadius: 999 }}>
          {badge.label}
        </span>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 500, color: "#2c2f40", lineHeight: 1.55, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
        {item.output_text}
      </p>
      <p style={{ fontSize: 10.5, color: "#b0b3c5", marginTop: 4 }}>入力: {item.input_text}</p>
    </div>
  );
}

// ─── メイン ──────────────────────────────────────────────────
export default function DashboardClient({ initialHistory }: { initialHistory: HistoryItem[] }) {
  // 入力
  const [inputText, setInputText] = useState("");
  const [situation, setSituation] = useState(SITUATIONS[0]);
  const [formality, setFormality] = useState(0.66);
  const [intimacy,  setIntimacy]  = useState(0.40);

  // 出力
  const [output,       setOutput]       = useState<string | null>(null);
  const [editedOutput, setEditedOutput] = useState<string>("");
  const [toneLabel,    setToneLabel]    = useState<string | null>(null);
  const [remaining,    setRemaining]    = useState<number | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // DBから復元した履歴を初期値とし、セッションで生成したものを先頭に追加
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);

  const badge = output ? safetyBadge(formality) : null;

  const handleGenerate = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    setEditedOutput("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, formality, intimacy: 1 - intimacy, situation }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }

      setOutput(data.output);
      setEditedOutput(data.output);
      setToneLabel(data.toneLabel);
      setRemaining(data.remaining);

      setHistory(prev => [{
        id: crypto.randomUUID(),
        input_text:  inputText,
        output_text: data.output,
        tone_label:  data.toneLabel,
        formality,
      }, ...prev].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = editedOutput || output;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success("コピーしました！");
  };

  return (
    <div style={{ minHeight: "100%", padding: "28px 28px 48px", fontFamily: "inherit" }}>
      {/* ページタイトル */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>新規作成</h1>
        <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, marginTop: 4 }}>
          文章を入力してトーンを選び、最適な表現に変換します
        </p>
      </div>

      {/* 2カラムグリッド */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── 左：入力パネル ── */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#1c1f2b", marginBottom: 14 }}>
            変換したい文章を入力
          </h2>

          {/* シチュエーション選択 */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {SITUATIONS.map(s => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                style={{
                  border: `1.5px solid ${situation === s ? "#b06ab3" : "#e4e6f0"}`,
                  background: situation === s ? "rgba(176,106,179,.08)" : "#fff",
                  borderRadius: 999, padding: "5px 13px", fontSize: 12, fontWeight: 700,
                  color: situation === s ? "#7b6ad0" : "#6b6f82", cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* テキスト入力 */}
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="例：了解です。"
            maxLength={500}
            rows={3}
            style={{
              width: "100%", border: "1.5px solid #e4e6f0", borderRadius: 12,
              padding: "12px 14px", fontSize: 14.5, fontFamily: "inherit",
              resize: "none", outline: "none", color: "#1c1f2b", lineHeight: 1.65,
              boxSizing: "border-box",
            }}
            onFocus={e => (e.target.style.borderColor = "#b06ab3")}
            onBlur={e  => (e.target.style.borderColor = "#e4e6f0")}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: "#a3a6b8", marginTop: 5 }}>
            {inputText.length} / 500
          </div>

          {/* パレット */}
          <div style={{ marginTop: 14, border: "1.5px solid #eee", borderRadius: 16, overflow: "hidden", touchAction: "none" }}>
            <PaletteSelector
              formality={formality}
              intimacy={intimacy}
              onChange={(f, i) => { setFormality(f); setIntimacy(i); }}
            />
          </div>

          {/* エラー */}
          {error && (
            <div style={{ marginTop: 12, background: "rgba(248,90,90,.08)", border: "1px solid rgba(248,90,90,.22)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#c0392b", fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || loading}
            style={{
              marginTop: 14, width: "100%", border: "none",
              cursor: (!inputText.trim() || loading) ? "not-allowed" : "pointer",
              fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#fff",
              padding: "15px", borderRadius: 12,
              background: (!inputText.trim() || loading) ? "#c5c8d8" : GRADIENT_BTN,
              transition: "opacity .15s",
            }}
          >
            {loading ? "生成中…" : "トーンを変換する →"}
          </button>

          {remaining !== null && (
            <p style={{ textAlign: "center", fontSize: 11.5, color: "#9295a8", marginTop: 10 }}>
              今月の残り生成回数: <strong>{remaining}</strong> 回
            </p>
          )}
        </div>

        {/* ── 右：出力パネル ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 出力カード */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 6px 24px rgba(70,60,120,.07)", minHeight: 220 }}>
            {output ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#1c1f2b", margin: 0 }}>生成結果</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {toneLabel && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#7b6ad0", background: "rgba(123,106,208,.1)", padding: "3px 10px", borderRadius: 999 }}>
                        {toneLabel}
                      </span>
                    )}
                    {badge && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg, padding: "3px 10px", borderRadius: 999 }}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* 編集可能テキストエリア */}
                <textarea
                  value={editedOutput}
                  onChange={e => setEditedOutput(e.target.value)}
                  rows={5}
                  style={{
                    width: "100%", border: "1.5px solid #e4e6f0", borderRadius: 12,
                    padding: "14px 16px", fontSize: 15.5, fontFamily: "inherit",
                    resize: "vertical", outline: "none", color: "#1c1f2b",
                    lineHeight: 1.75, background: "#fafafa", boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#b06ab3")}
                  onBlur={e  => (e.target.style.borderColor = "#e4e6f0")}
                />
                <p style={{ fontSize: 10.5, color: "#b0b3c5", marginTop: 5, fontWeight: 500 }}>
                  送信前に自由に編集できます
                </p>

                <button
                  onClick={handleCopy}
                  style={{
                    marginTop: 12, width: "100%", border: "none", cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    fontSize: 14, fontWeight: 700, color: "#fff", padding: "14px",
                    borderRadius: 12, background: "#1c1f2b",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
                  </svg>
                  コピーする
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 180, textAlign: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <p style={{ fontSize: 13.5, color: "#9295a8", fontWeight: 500, lineHeight: 1.65 }}>
                  左で文章を入力して<br />「トーンを変換する」を押してください
                </p>
              </div>
            )}
          </div>

          {/* 直近の履歴（最大5件） */}
          {history.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px 16px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ fontSize: 12.5, fontWeight: 700, color: "#7a7e90", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  直近の履歴
                </h2>
                <Link
                  href="/history"
                  style={{ fontSize: 12, fontWeight: 700, color: "#7b6ad0", textDecoration: "none" }}
                >
                  すべて見る →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.slice(0, 5).map(item => (
                  <MiniHistoryCard
                    key={item.id}
                    item={item}
                    onRestore={text => { setEditedOutput(text); setOutput(text); }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
