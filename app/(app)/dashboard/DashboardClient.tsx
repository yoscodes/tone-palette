"use client";

import { useState, useRef, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { savePreset, deletePreset } from "./presetActions";
import { useUser } from "@/hooks/use-user";
import { signInWithGoogle } from "@/app/(auth)/actions";

// ─── 定数 ─────────────────────────────────────────────────────
const GRADIENT     = "linear-gradient(135deg,#ff8a5b 0%,#f76b8a 38%,#b06ab3 66%,#6a82fb 100%)";
const GRADIENT_BTN = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";
const SITUATIONS   = ["承諾する", "謝罪する", "依頼する", "日程調整する", "お断りする"];

const GUEST_ID_KEY    = "tp_guest_id";
const GUEST_HIST_KEY  = "tp_guest_history";
const GUEST_COUNT_KEY = "tp_guest_count";
const GUEST_LIMIT     = 3;

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

export interface Preset {
  id: string;
  name: string;
  formality: number;
  intimacy: number;
}

// ─── Google アイコン ──────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── ゲスト上限モーダル ───────────────────────────────────────
function GuestLimitModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "36px 32px",
        maxWidth: 400, width: "100%",
        boxShadow: "0 24px 64px rgba(70,60,120,.22)",
        position: "relative",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            border: "none", background: "none", cursor: "pointer",
            color: "#b0b3c5", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="閉じる"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg,rgba(255,138,91,.15),rgba(176,106,179,.15))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b06ab3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5"/>
              <circle cx="17.5" cy="10.5" r="2.5"/>
              <circle cx="8.5" cy="7.5" r="2.5"/>
              <circle cx="6.5" cy="12.5" r="2.5"/>
              <path d="M22 20c-3-3-6.5-5-10-5S5 17 2 20"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1f2b", margin: "0 0 8px" }}>
            ゲスト利用の上限（{GUEST_LIMIT}回）に達しました
          </h2>
          <p style={{ fontSize: 13.5, color: "#6b6f82", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
            無料アカウントを作成すると、<strong style={{ color: "#1c1f2b" }}>毎月10回まで</strong>ご利用いただけます。
            ゲスト時の履歴もそのまま引き継がれます。
          </p>
        </div>

        <form action={() => startTransition(async () => { await signInWithGoogle(); })}>
          <button
            type="submit"
            disabled={pending}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 20px",
              border: "none",
              borderRadius: 12,
              background: pending ? "#c5c8d8" : GRADIENT_BTN,
              cursor: pending ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, color: "#fff",
              fontFamily: "inherit",
            }}
          >
            <GoogleIcon />
            {pending ? "リダイレクト中…" : "Googleで無料登録する"}
          </button>
        </form>

        <button
          onClick={onClose}
          style={{
            marginTop: 12, width: "100%", border: "1.5px solid #e4e6f0",
            borderRadius: 12, background: "none", cursor: "pointer",
            fontSize: 13.5, fontWeight: 600, color: "#9295a8",
            padding: "12px", fontFamily: "inherit",
          }}
        >
          後で登録する
        </button>
      </div>
    </div>
  );
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
    onChange(
      clamp((e.clientX - r.left) / r.width),
      clamp(1 - (e.clientY - r.top) / r.height),
    );
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
        { text: "近い",               style: { position: "absolute" as const, top: 4,  left: "50%", transform: "translateX(-50%)", textAlign: "center" as const } },
        { text: "カジュアル",          style: { position: "absolute" as const, left: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center" as const, width: 48, lineHeight: 1.3 } },
        { text: "フォーマル\n（敬意）", style: { position: "absolute" as const, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center" as const, width: 48, lineHeight: 1.3 } },
        { text: "距離を置く",          style: { position: "absolute" as const, bottom: 6, left: "50%", transform: "translateX(-50%)" } },
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
        {[
          { label: "友人・同期",   s: { top: "7%",  left: "7%" } },
          { label: "親しい先輩",   s: { top: "7%",  right: "7%" } },
          { label: "初対面の方",   s: { bottom: "7%", left: "7%" } },
          { label: "社外の役員",   s: { bottom: "7%", right: "7%" } },
        ].map(({ label, s }) => (
          <span key={label} style={{ position: "absolute", ...s, fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,.55)", pointerEvents: "none" }}>
            {label}
          </span>
        ))}
        <div style={{
          position: "absolute",
          left: `${(formality * 100).toFixed(1)}%`,
          top:  `${((1 - intimacy) * 100).toFixed(1)}%`,
          transform: "translate(-50%,-50%)",
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,.92)", boxShadow: "0 4px 14px rgba(0,0,0,.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a78c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,9 2,12 5,15"/>
            <polyline points="9,5 12,2 15,5"/>
            <polyline points="15,19 12,22 9,19"/>
            <polyline points="19,9 22,12 19,15"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="12" y1="2" x2="12" y2="22"/>
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
export default function DashboardClient({
  initialHistory,
  initialPresets,
  checkoutSuccess,
}: {
  initialHistory: HistoryItem[];
  initialPresets: Preset[];
  checkoutSuccess?: boolean;
}) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const migrationRan = useRef(false);

  // 入力
  const [inputText, setInputText] = useState("");
  const [situation, setSituation] = useState(SITUATIONS[0]);
  const [formality, setFormality] = useState(0.66);
  const [intimacy,  setIntimacy]  = useState(0.40);

  // 出力
  const [output,       setOutput]       = useState<string | null>(null);
  const [editedOutput, setEditedOutput] = useState<string>("");
  const [toneLabel,    setToneLabel]    = useState<string | null>(null);
  const [reason,       setReason]       = useState<string | null>(null);
  const [remaining,    setRemaining]    = useState<number | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // 履歴
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);

  // ゲストモード
  const [guestCount,      setGuestCount]      = useState(0);
  const [showGuestModal,  setShowGuestModal]  = useState(false);

  // 相手プリセット
  const [presets,      setPresets]      = useState<Preset[]>(initialPresets);
  const [savingMode,   setSavingMode]   = useState(false);
  const [presetName,   setPresetName]   = useState("");
  const [presetSaving, setPresetSaving] = useState(false);

  // ── ゲスト状態の初期化 ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(GUEST_ID_KEY, id);
    }

    const count = parseInt(localStorage.getItem(GUEST_COUNT_KEY) ?? "0", 10);
    setGuestCount(count);
  }, []);

  // ── ゲスト履歴の復元（未ログイン確定後）─────────────────────
  useEffect(() => {
    if (userLoading || user) return;

    const raw = localStorage.getItem(GUEST_HIST_KEY);
    if (!raw) return;
    try {
      const items = JSON.parse(raw) as HistoryItem[];
      if (items.length > 0) setHistory(items);
    } catch {}
  }, [userLoading, user]);

  // ── ログイン後：ゲスト履歴をマイグレーション ─────────────────
  useEffect(() => {
    if (userLoading || !user || migrationRan.current) return;

    const storedGuestId = localStorage.getItem(GUEST_ID_KEY);
    const storedCount   = parseInt(localStorage.getItem(GUEST_COUNT_KEY) ?? "0", 10);

    if (!storedGuestId || storedCount === 0) {
      localStorage.removeItem(GUEST_ID_KEY);
      return;
    }

    migrationRan.current = true;

    fetch("/api/migrate-guest", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ guestId: storedGuestId }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const items: HistoryItem[] = data?.items ?? [];
        if (items.length > 0) {
          setHistory(prev => [...items.reverse(), ...prev].slice(0, 20));
          toast.success(`${items.length}件のゲスト履歴を引き継ぎました！`);
        }
        localStorage.removeItem(GUEST_ID_KEY);
        localStorage.removeItem(GUEST_HIST_KEY);
        localStorage.removeItem(GUEST_COUNT_KEY);
        setGuestCount(0);
      })
      .catch(() => {});
  }, [userLoading, user]);

  useEffect(() => {
    if (!checkoutSuccess) return;
    toast.success("Proプランへのアップグレードが完了しました！", {
      description: "月30回の生成をご利用いただけます。",
    });
    router.replace("/dashboard");
  }, [checkoutSuccess, router]);

  const badge = output ? safetyBadge(formality) : null;

  const handleSavePreset = async () => {
    const name = presetName.trim();
    if (!name || presetSaving) return;
    setPresetSaving(true);
    const result = await savePreset(name, formality, intimacy);
    setPresetSaving(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    if ("preset" in result && result.preset) {
      setPresets(prev => [...prev, result.preset!]);
    }
    setPresetName("");
    setSavingMode(false);
  };

  const handleDeletePreset = async (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    await deletePreset(id);
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || loading) return;

    const isGuest = !user;

    // ゲスト上限チェック（クライアントサイド）
    if (isGuest && guestCount >= GUEST_LIMIT) {
      setShowGuestModal(true);
      return;
    }

    const guestId = isGuest ? (localStorage.getItem(GUEST_ID_KEY) ?? "") : "";

    setLoading(true);
    setError(null);
    setOutput(null);
    setEditedOutput("");
    setReason(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isGuest && guestId) headers["X-Guest-Id"] = guestId;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: inputText, formality, intimacy, situation }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === "guest_limit") {
          setShowGuestModal(true);
        } else {
          setError(data.error ?? "エラーが発生しました");
        }
        return;
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer      = "";
      let accumulated = "";
      let newGuestCount = guestCount;

      const processMessage = (dataStr: string) => {
        try {
          const data = JSON.parse(dataStr);

          if (data.error) {
            setError(data.error);
            return;
          }

          if (data.chunk) {
            accumulated += data.chunk;
            const splitIdx = accumulated.indexOf("\n");
            const display  = splitIdx !== -1 ? accumulated.slice(0, splitIdx) : accumulated;
            if (display) { setOutput(display); setEditedOutput(display); }
          }

          if (data.done) {
            setToneLabel(data.toneLabel ?? null);
            setReason(data.reason ?? null);
            setRemaining(data.remaining ?? null);
            if (data.historyItem) {
              setHistory(prev => {
                const updated = [data.historyItem, ...prev].slice(0, 20);
                if (isGuest) {
                  // ゲスト履歴を localStorage に保存
                  localStorage.setItem(GUEST_HIST_KEY, JSON.stringify(updated));
                }
                return updated;
              });
              setOutput(data.historyItem.output_text);
              setEditedOutput(data.historyItem.output_text);
            }
            if (isGuest) {
              newGuestCount = guestCount + 1;
              setGuestCount(newGuestCount);
              localStorage.setItem(GUEST_COUNT_KEY, String(newGuestCount));
            }
          }
        } catch {}
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          if (part.startsWith("data: ")) processMessage(part.slice(6).trim());
        }
      }
    } catch {
      setError("通信エラーが発生しました");
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

  const isGuest    = !userLoading && !user;
  const guestLeft  = Math.max(0, GUEST_LIMIT - guestCount);

  return (
    <div style={{ minHeight: "100%", padding: "28px 28px 48px", fontFamily: "inherit" }}>
      {showGuestModal && <GuestLimitModal onClose={() => setShowGuestModal(false)} />}

      {/* ゲストバナー */}
      {isGuest && (
        <div style={{
          marginBottom: 20,
          background: "linear-gradient(135deg,rgba(255,138,91,.08),rgba(176,106,179,.10))",
          border: "1.5px solid rgba(176,106,179,.25)",
          borderRadius: 14, padding: "12px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#5a5270", margin: 0, lineHeight: 1.5 }}>
            ゲストモード — あと <strong style={{ color: "#b06ab3" }}>{guestLeft}回</strong> 無料で試せます
          </p>
          <Link
            href="/login"
            style={{
              fontSize: 12.5, fontWeight: 700, color: "#fff",
              background: GRADIENT_BTN, borderRadius: 8,
              padding: "6px 14px", textDecoration: "none", flexShrink: 0,
            }}
          >
            登録して無制限に使う
          </Link>
        </div>
      )}

      {/* ページタイトル */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>新規作成</h1>
        <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, marginTop: 4 }}>
          文章を入力してトーンを選び、最適な表現に変換します
        </p>
      </div>

      {/* 2カラムグリッド */}
      <style>{`
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        @media (max-width: 768px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="dash-grid">

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

          {/* 相手プリセット（ログイン時のみ）*/}
          {!isGuest && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}>
                  相手
                </span>
                {presets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setFormality(p.formality); setIntimacy(p.intimacy); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      border: "1.5px solid #e4e6f0", borderRadius: 999,
                      background: "#f7f7fb", padding: "4px 10px 4px 12px",
                      fontSize: 12, fontWeight: 600, color: "#3a3d50",
                      cursor: "pointer", transition: "border-color .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#b06ab3")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#e4e6f0")}
                  >
                    {p.name}
                    <span
                      onClick={e => { e.stopPropagation(); handleDeletePreset(p.id); }}
                      style={{ fontSize: 11, color: "#b0b3c5", lineHeight: 1, padding: "0 2px", cursor: "pointer" }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = "#f05")}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = "#b0b3c5")}
                    >
                      ×
                    </span>
                  </button>
                ))}

                {savingMode ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      autoFocus
                      value={presetName}
                      onChange={e => setPresetName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSavePreset(); if (e.key === "Escape") { setSavingMode(false); setPresetName(""); } }}
                      placeholder="例: 田中部長"
                      maxLength={20}
                      style={{
                        border: "1.5px solid #b06ab3", borderRadius: 999,
                        padding: "4px 12px", fontSize: 12, fontFamily: "inherit",
                        outline: "none", color: "#1c1f2b", width: 110,
                      }}
                    />
                    <button
                      onClick={handleSavePreset}
                      disabled={!presetName.trim() || presetSaving}
                      style={{
                        border: "none", borderRadius: 999, padding: "5px 12px",
                        fontSize: 12, fontWeight: 700, color: "#fff",
                        background: (!presetName.trim() || presetSaving) ? "#c5c8d8" : "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)",
                        cursor: (!presetName.trim() || presetSaving) ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {presetSaving ? "…" : "保存"}
                    </button>
                    <button
                      onClick={() => { setSavingMode(false); setPresetName(""); }}
                      style={{ border: "none", background: "none", fontSize: 14, color: "#a3a6b8", cursor: "pointer", padding: "4px" }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSavingMode(true)}
                    style={{
                      border: "1.5px dashed #d4c9f0", borderRadius: 999,
                      background: "none", padding: "4px 12px",
                      fontSize: 12, fontWeight: 600, color: "#9a78c8",
                      cursor: "pointer", transition: "border-color .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#b06ab3")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#d4c9f0")}
                  >
                    ＋ 保存
                  </button>
                )}
              </div>
            </div>
          )}

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

          {/* 残り回数表示 */}
          {isGuest ? (
            <p style={{ textAlign: "center", fontSize: 11.5, color: "#9295a8", marginTop: 10 }}>
              ゲスト残り: <strong>{guestLeft}</strong> / {GUEST_LIMIT} 回
            </p>
          ) : remaining !== null && (
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

                {reason && (
                  <div style={{
                    marginTop: 12, background: "#f7f4ff", borderRadius: 10,
                    padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b6ad0" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <p style={{ fontSize: 12, color: "#5a5270", fontWeight: 500, margin: 0, lineHeight: 1.65 }}>
                      {reason}
                    </p>
                  </div>
                )}

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
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(176,106,179,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b06ab3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r="2.5"/>
                    <circle cx="17.5" cy="10.5" r="2.5"/>
                    <circle cx="8.5" cy="7.5" r="2.5"/>
                    <circle cx="6.5" cy="12.5" r="2.5"/>
                    <path d="M22 20c-3-3-6.5-5-10-5S5 17 2 20"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13.5, color: "#9295a8", fontWeight: 500, lineHeight: 1.65 }}>
                  文章を入力してトーンを変換すると、<br />ここに結果が表示されます
                </p>
              </div>
            )}
          </div>

          {/* 直近の履歴（最大5件）*/}
          {history.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px 16px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ fontSize: 12.5, fontWeight: 700, color: "#7a7e90", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  直近の履歴
                </h2>
                {!isGuest && (
                  <Link
                    href="/history"
                    style={{ fontSize: 12, fontWeight: 700, color: "#7b6ad0", textDecoration: "none" }}
                  >
                    すべて見る →
                  </Link>
                )}
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
              {isGuest && (
                <p style={{ fontSize: 11.5, color: "#b0b3c5", marginTop: 10, textAlign: "center", fontWeight: 500 }}>
                  履歴は登録後に保存・閲覧できます
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
