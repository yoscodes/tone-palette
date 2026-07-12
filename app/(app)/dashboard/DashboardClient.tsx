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

const SITUATION_PLACEHOLDER: Record<string, string> = {
  "承諾する":    "例：了解です。",
  "謝罪する":    "例：すみません、遅くなりました。",
  "依頼する":    "例：これをやっておいてもらえますか？",
  "日程調整する": "例：来週の月曜はどうですか？",
  "お断りする":  "例：ちょっと難しいです。",
};

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
              <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/>
              <circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
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
              padding: "14px 20px", border: "none", borderRadius: 12,
              background: pending ? "#c5c8d8" : GRADIENT_BTN,
              cursor: pending ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "inherit",
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
const QUADRANT_LABELS = [
  {
    id: "tl",
    main: "親密",
    sub: "フランク",
    pos: { top: "25%", left: "25%" },
    isActive: (f: number, i: number) => f < 0.5 && i >= 0.5,
  },
  {
    id: "tr",
    main: "丁寧",
    sub: "標準的",
    pos: { top: "25%", left: "75%" },
    isActive: (f: number, i: number) => f >= 0.5 && i >= 0.5,
  },
  {
    id: "bl",
    main: "事務的",
    sub: "簡潔",
    pos: { top: "75%", left: "25%" },
    isActive: (f: number, i: number) => f < 0.5 && i < 0.5,
  },
  {
    id: "br",
    main: "厳格",
    sub: "かしこまった",
    pos: { top: "75%", left: "75%" },
    isActive: (f: number, i: number) => f >= 0.5 && i < 0.5,
  },
] as const;

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
    <div style={{
      position: "absolute", inset: 0,
      padding: "4px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      touchAction: "none",
    }}>
      {/* 正方形 */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>

        {/* ドラッグ可能エリア */}
        <div
          ref={sqRef}
          onPointerDown={onPointerDown}
          style={{
            position: "absolute", inset: 0,
            borderRadius: 16, background: GRADIENT,
            cursor: "grab", userSelect: "none", touchAction: "none",
          }}
        >
          {/* グリッドライン（溝効果：ダーク下地 + ホワイト上線）*/}
          {/* 縦線 */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "calc(50% - 1px)", width: 3, background: "rgba(0,0,0,.12)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "calc(50% - 0.5px)", width: 1, background: "rgba(255,255,255,.45)" }} />
          {/* 横線 */}
          <div style={{ position: "absolute", left: 0, right: 0, top: "calc(50% - 1px)", height: 3, background: "rgba(0,0,0,.12)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "calc(50% - 0.5px)", height: 1, background: "rgba(255,255,255,.45)" }} />

          {/* 象限ウォーターマークラベル */}
          {QUADRANT_LABELS.map(q => {
            const active = q.isActive(formality, intimacy);
            return (
              <div
                key={q.id}
                style={{
                  position: "absolute",
                  top: q.pos.top,
                  left: q.pos.left,
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                  opacity: active ? 0.72 : 0.28,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  textShadow: "0 1px 4px rgba(0,0,0,.3), 0 2px 10px rgba(0,0,0,.18)",
                }}>
                  {q.main}
                </div>
                <div style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "#fff",
                  marginTop: 3,
                  letterSpacing: "0.02em",
                  textShadow: "0 1px 3px rgba(0,0,0,.25)",
                }}>
                  {q.sub}
                </div>
              </div>
            );
          })}

          {/* カーソルドット */}
          <div style={{
            position: "absolute",
            left: `${(formality * 100).toFixed(1)}%`,
            top:  `${((1 - intimacy) * 100).toFixed(1)}%`,
            transform: "translate(-50%,-50%)",
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,.96)",
            boxShadow: "0 6px 20px rgba(0,0,0,.28), 0 2px 6px rgba(0,0,0,.18), 0 0 0 2px rgba(255,255,255,.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            zIndex: 1,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a78c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5,9 2,12 5,15"/><polyline points="9,5 12,2 15,5"/>
              <polyline points="15,19 12,22 9,19"/><polyline points="19,9 22,12 19,15"/>
              <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
            </svg>
          </div>
        </div>
      </div>
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
        background: "#f7f7fb", borderRadius: 10, padding: "9px 12px",
        cursor: "pointer", border: "1.5px solid transparent", transition: "border-color .15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#d4c9f0")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#7b6ad0" }}>{item.tone_label ?? "—"}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: badge.color, background: badge.bg, padding: "1px 6px", borderRadius: 999 }}>
          {badge.label}
        </span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: "#2c2f40", lineHeight: 1.5, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>
        {item.output_text}
      </p>
    </div>
  );
}

// ─── メイン ──────────────────────────────────────────────────
export default function DashboardClient({
  initialHistory,
  initialPresets,
  checkoutSuccess,
  initialFormality,
  initialIntimacy,
  initialSituation,
}: {
  initialHistory: HistoryItem[];
  initialPresets: Preset[];
  checkoutSuccess?: boolean;
  initialFormality?: number;
  initialIntimacy?: number;
  initialSituation?: string;
}) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const migrationRan = useRef(false);

  // 入力（history からの引き継ぎ値を優先）
  const clampParam = (v: number | undefined, fallback: number) =>
    v !== undefined ? Math.max(0.03, Math.min(0.97, v)) : fallback;

  const [inputText, setInputText] = useState("");
  const [situation, setSituation] = useState(
    initialSituation && SITUATIONS.includes(initialSituation) ? initialSituation : SITUATIONS[0]
  );
  const [formality, setFormality] = useState(() => clampParam(initialFormality, 0.66));
  const [intimacy,  setIntimacy]  = useState(() => clampParam(initialIntimacy, 0.40));

  // 出力
  const [output,       setOutput]       = useState<string | null>(null);
  const [editedOutput, setEditedOutput] = useState<string>("");
  const [toneLabel,    setToneLabel]    = useState<string | null>(null);
  const [reason,       setReason]       = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // 履歴
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);

  // ゲストモード
  const [guestCount,     setGuestCount]     = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // 相手プリセット
  const [presets,      setPresets]      = useState<Preset[]>(initialPresets);
  const [savingMode,   setSavingMode]   = useState(false);
  const [presetName,   setPresetName]   = useState("");
  const [presetSaving, setPresetSaving] = useState(false);

  // ── ゲスト状態の初期化 ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(GUEST_ID_KEY, id); }
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
    if (!storedGuestId || storedCount === 0) { localStorage.removeItem(GUEST_ID_KEY); return; }
    migrationRan.current = true;
    fetch("/api/migrate-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: storedGuestId }),
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
    toast.success("Proプランへのアップグレードが完了しました！", { description: "月30回の生成をご利用いただけます。" });
    router.replace("/dashboard");
  }, [checkoutSuccess, router]);

  const badge = output ? safetyBadge(formality) : null;

  const handleSavePreset = async () => {
    const name = presetName.trim();
    if (!name || presetSaving) return;
    setPresetSaving(true);
    const result = await savePreset(name, formality, intimacy);
    setPresetSaving(false);
    if ("error" in result && result.error) { toast.error(result.error); return; }
    if ("preset" in result && result.preset) setPresets(prev => [...prev, result.preset!]);
    setPresetName(""); setSavingMode(false);
    toast.success(`「${name}」を保存しました`);
  };

  const handleDeletePreset = async (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    await deletePreset(id);
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || loading) return;
    const isGuest = !user;
    if (isGuest && guestCount >= GUEST_LIMIT) { setShowGuestModal(true); return; }
    const guestId = isGuest ? (localStorage.getItem(GUEST_ID_KEY) ?? "") : "";
    setLoading(true); setError(null); setOutput(null); setEditedOutput(""); setReason(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isGuest && guestId) headers["X-Guest-Id"] = guestId;
      const res = await fetch("/api/generate", {
        method: "POST", headers,
        body: JSON.stringify({ text: inputText, formality, intimacy, situation }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.code === "guest_limit") setShowGuestModal(true);
        else setError(data.error ?? "エラーが発生しました");
        return;
      }
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "", accumulated = "";

      const processMessage = (dataStr: string) => {
        try {
          const data = JSON.parse(dataStr);
          if (data.error) { setError(data.error); return; }
          if (data.chunk) {
            accumulated += data.chunk;
            const splitIdx = accumulated.indexOf("\n");
            const display  = splitIdx !== -1 ? accumulated.slice(0, splitIdx) : accumulated;
            if (display) { setOutput(display); setEditedOutput(display); }
          }
          if (data.done) {
            setToneLabel(data.toneLabel ?? null);
            setReason(data.reason ?? null);
            if (data.historyItem) {
              setHistory(prev => {
                const updated = [data.historyItem, ...prev].slice(0, 20);
                if (isGuest) localStorage.setItem(GUEST_HIST_KEY, JSON.stringify(updated));
                return updated;
              });
              setOutput(data.historyItem.output_text);
              setEditedOutput(data.historyItem.output_text);
            }
            if (isGuest) {
              const nc = guestCount + 1;
              setGuestCount(nc);
              localStorage.setItem(GUEST_COUNT_KEY, String(nc));
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

  const isGuest   = !userLoading && !user;
  const guestLeft = Math.max(0, GUEST_LIMIT - guestCount);
  const canGenerate = !!inputText.trim() && !loading;

  // ─── CSS ────────────────────────────────────────────────────
  const css = `
    .tp-outer {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 20px 24px;
      gap: 12px;
      box-sizing: border-box;
      font-family: inherit;
    }
    .tp-grid {
      flex: 1;
      min-height: 0;
      display: flex;
      gap: 20px;
      align-items: stretch;
    }
    .tp-left,
    .tp-right {
      flex: 1;
      min-width: 0;
    }
    .tp-card {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 24px;
      padding: 24px 28px;
      box-shadow: 0 4px 20px rgba(70,60,120,.06);
      box-sizing: border-box;
      gap: 16px;
    }
    .tp-palette-wrap {
      flex: 1;
      min-height: 0;
      position: relative;
      border-radius: 20px;
      overflow: hidden;
    }
    .tp-output-body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }
    .tp-output-textarea {
      flex: 1;
      min-height: 80px;
      resize: none;
    }
    .tp-history {
      flex-shrink: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 150px;
    }
    .tp-sit-tabs {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .tp-sit-tabs::-webkit-scrollbar { display: none; }
    .tp-btn-generate {
      transition: transform .15s ease, box-shadow .15s ease, background .2s;
    }
    .tp-btn-generate:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(150,90,200,.58) !important;
    }
    .tp-btn-generate:active:not(:disabled) {
      transform: translateY(0);
    }
    @media (max-width: 900px) {
      .tp-outer {
        overflow-y: auto; height: auto; min-height: 100%;
        padding: 12px 20px;
        padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
      }
      .tp-grid { flex-direction: column; gap: 14px; }
      .tp-card { height: auto; overflow: visible; padding: 18px 16px; }
      .tp-palette-wrap { height: 280px; flex: none; }
      .tp-output-body { min-height: 220px; }
      .tp-sit-tabs { overflow-x: auto; flex-wrap: nowrap; }
      .tp-btn-generate:not(:disabled) { font-size: 16px; padding: 17px 20px; }
    }
  `;

  return (
    <div className="tp-outer">
      <style>{css}</style>
      {showGuestModal && <GuestLimitModal onClose={() => setShowGuestModal(false)} />}

      {/* ゲストバナー */}
      {isGuest && (
        <div style={{
          flexShrink: 0,
          background: "linear-gradient(135deg,rgba(255,138,91,.08),rgba(176,106,179,.10))",
          border: "1.5px solid rgba(176,106,179,.25)",
          borderRadius: 12, padding: "8px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#5a5270", margin: 0 }}>
            ゲストモード — あと <strong style={{ color: "#b06ab3" }}>{guestLeft}回</strong> 無料
          </p>
          <Link href="/login" style={{
            fontSize: 12, fontWeight: 700, color: "#fff",
            background: GRADIENT_BTN, borderRadius: 7, padding: "5px 12px", textDecoration: "none",
          }}>
            無制限で使う
          </Link>
        </div>
      )}

      {/* メイングリッド */}
      <div className="tp-grid">

        {/* ── 左：入力カード ── */}
        <div className="tp-card tp-left">

          {/* シチュエーションタブ */}
          <div className="tp-sit-tabs" style={{ flexShrink: 0, display: "flex", gap: 6, flexWrap: "wrap" }}>
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

          {/* テキスト入力（コンパクト 3行）*/}
          <div style={{ flexShrink: 0 }}>
            <textarea
              rows={3}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={SITUATION_PLACEHOLDER[situation] ?? "例：了解です。"}
              maxLength={500}
              style={{
                display: "block", width: "100%", boxSizing: "border-box",
                border: "1.5px solid #e4e6f0", borderRadius: 14,
                padding: "12px 14px", fontSize: 14, fontFamily: "inherit",
                outline: "none", color: "#1c1f2b", lineHeight: 1.65,
                resize: "none", minHeight: 88,
              }}
              onFocus={e => (e.target.style.borderColor = "#b06ab3")}
              onBlur={e  => (e.target.style.borderColor = "#e4e6f0")}
            />
            <div style={{ textAlign: "right", fontSize: 10.5, color: "#b0b3c5", marginTop: 3 }}>
              {inputText.length} / 500
            </div>
          </div>

          {/* 相手プリセット適用チップ（ログイン時のみ）*/}
          {!isGuest && presets.length > 0 && (
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "#a3a6b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>相手</span>
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setFormality(p.formality); setIntimacy(p.intimacy); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 3,
                    border: "1.5px solid #e4e6f0", borderRadius: 999,
                    background: "#f7f7fb", padding: "3px 9px 3px 10px",
                    fontSize: 11.5, fontWeight: 600, color: "#3a3d50", cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#b06ab3")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#e4e6f0")}
                >
                  {p.name}
                  <span
                    onClick={ev => { ev.stopPropagation(); handleDeletePreset(p.id); }}
                    style={{ fontSize: 10, color: "#b0b3c5", cursor: "pointer", padding: "0 1px" }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = "#f05")}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = "#b0b3c5")}
                  >×</span>
                </button>
              ))}
            </div>
          )}

          {/* パレット（flex: 1 で正方形に広がる）*/}
          <div className="tp-palette-wrap">
            <PaletteSelector
              formality={formality}
              intimacy={intimacy}
              onChange={(f, i) => { setFormality(f); setIntimacy(i); }}
            />
          </div>

          {/* エラー */}
          {error && (
            <div style={{ flexShrink: 0, background: "rgba(248,90,90,.08)", border: "1px solid rgba(248,90,90,.22)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#c0392b", fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* 生成ボタン（目立つグラデーション）*/}
          <button
            className="tp-btn-generate"
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              flexShrink: 0, border: "none", marginTop: 4,
              cursor: canGenerate ? "pointer" : "not-allowed",
              fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff",
              padding: "15px 20px", borderRadius: 14,
              background: GRADIENT_BTN,
              boxShadow: canGenerate ? "0 8px 28px rgba(150,90,200,.48)" : "none",
              opacity: canGenerate ? 1 : 0.48,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "tp-spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                生成中…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                トーンを変換する
              </>
            )}
          </button>
          <style>{`@keyframes tp-spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* ── 右：出力カード ── */}
        <div className="tp-card tp-right">

          {/* 出力エリア（flex: 1）*/}
          <div className="tp-output-body">
            {output ? (
              <>
                {/* バッジ行（上部固定）*/}
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
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
                  <span style={{ fontSize: 10.5, color: "#b0b3c5", fontWeight: 500, marginLeft: "auto" }}>
                    送信前に編集できます
                  </span>
                </div>

                {/* 編集可能テキスト（大きく・中央）*/}
                <textarea
                  className="tp-output-textarea"
                  value={editedOutput}
                  onChange={e => setEditedOutput(e.target.value)}
                  style={{
                    border: "1.5px solid #e4e6f0", borderRadius: 12,
                    padding: "14px 16px", fontSize: 16, fontFamily: "inherit",
                    outline: "none", color: "#1c1f2b",
                    lineHeight: 1.8, background: "#fafafa",
                    boxSizing: "border-box", width: "100%",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#b06ab3")}
                  onBlur={e  => (e.target.style.borderColor = "#e4e6f0")}
                />

                {/* 理由 */}
                {reason && (
                  <div style={{
                    flexShrink: 0, background: "#f7f4ff", borderRadius: 10,
                    padding: "9px 12px", display: "flex", alignItems: "flex-start", gap: 7,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7b6ad0" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <p style={{ fontSize: 11.5, color: "#5a5270", fontWeight: 500, margin: 0, lineHeight: 1.6 }}>{reason}</p>
                  </div>
                )}
              </>
            ) : (
              /* プレースホルダー */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: "linear-gradient(135deg, rgba(255,138,91,.10), rgba(176,106,179,.14))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c090d0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/>
                    <circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
                    <path d="M22 20c-3-3-6.5-5-10-5S5 17 2 20"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: "#b8bbcc", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
                  文章を入力してトーンを変換すると<br />ここに結果が表示されます
                </p>
              </div>
            )}
          </div>

          {/* アクション行（出力がある場合）*/}
          {output && (
            <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
              {/* プリセット保存（ログイン時のみ）*/}
              {!isGuest && (
                savingMode ? (
                  <div style={{ flex: 1, display: "flex", gap: 5 }}>
                    <input
                      autoFocus
                      value={presetName}
                      onChange={e => setPresetName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleSavePreset();
                        if (e.key === "Escape") { setSavingMode(false); setPresetName(""); }
                      }}
                      placeholder="例: 田中部長" maxLength={20}
                      style={{
                        flex: 1, border: "1.5px solid #b06ab3", borderRadius: 10,
                        padding: "10px 12px", fontSize: 12.5, fontFamily: "inherit",
                        outline: "none", color: "#1c1f2b", minWidth: 0,
                      }}
                    />
                    <button
                      onClick={handleSavePreset}
                      disabled={!presetName.trim() || presetSaving}
                      style={{
                        border: "none", borderRadius: 10, padding: "10px 14px",
                        fontSize: 12.5, fontWeight: 700, color: "#fff",
                        background: (!presetName.trim() || presetSaving) ? "#c5c8d8" : GRADIENT_BTN,
                        cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                      }}
                    >{presetSaving ? "…" : "保存"}</button>
                    <button
                      onClick={() => { setSavingMode(false); setPresetName(""); }}
                      style={{ border: "none", background: "none", fontSize: 16, color: "#a3a6b8", cursor: "pointer", padding: "0 4px" }}
                    >×</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSavingMode(true)}
                    style={{
                      flex: 1, border: "1.5px dashed #d4c9f0", borderRadius: 10,
                      background: "none", padding: "11px 12px",
                      fontSize: 12.5, fontWeight: 600, color: "#9a78c8", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#b06ab3")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#d4c9f0")}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    このトーンを保存
                  </button>
                )
              )}

              {/* コピーボタン（主役）*/}
              <button
                onClick={handleCopy}
                style={{
                  flex: isGuest ? 1 : 2, border: "none", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 14, fontWeight: 800, color: "#fff", padding: "12px 20px",
                  borderRadius: 12, background: "#1c1f2b",
                  boxShadow: "0 4px 14px rgba(28,31,43,.2)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="11" height="11" rx="2"/>
                  <path d="M5 15V5a2 2 0 0 1 2-2h8"/>
                </svg>
                コピーする
              </button>
            </div>
          )}

          {/* 直近の履歴 */}
          {history.length > 0 && (
            <div style={{ flexShrink: 0, borderTop: "1px solid #f0f0f6", paddingTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#a3a6b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  直近の履歴
                </span>
                {!isGuest && (
                  <Link href="/history" style={{ fontSize: 11, fontWeight: 700, color: "#7b6ad0", textDecoration: "none" }}>
                    すべて見る →
                  </Link>
                )}
              </div>
              <div className="tp-history">
                {history.slice(0, 4).map(item => (
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
