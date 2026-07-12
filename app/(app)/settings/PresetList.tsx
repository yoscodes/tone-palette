"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deletePreset } from "./actions";

export interface Preset {
  id: string;
  name: string;
  formality: number;
  intimacy: number;
}

const PALETTE_GRADIENT =
  "linear-gradient(135deg, #f7c9e6 0%, #e8d8f8 25%, #c9d8f7 50%, #c9ecd8 75%, #f7edc9 100%)";

// ミニパレットサムネイル + ピン
function MiniPalette({ formality, intimacy }: { formality: number; intimacy: number }) {
  const x = formality * 100;
  const y = (1 - intimacy) * 100;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: PALETTE_GRADIENT,
      position: "relative", overflow: "hidden",
      border: "1px solid rgba(0,0,0,.06)",
    }}>
      <div style={{
        position: "absolute",
        left: `${x}%`, top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: "#6a7bf0",
        boxShadow: "0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.3)",
      }} />
    </div>
  );
}

function formalityLabel(v: number) {
  if (v >= 0.67) return "丁寧";
  if (v >= 0.33) return "標準";
  return "カジュアル";
}
function intimacyLabel(v: number) {
  if (v >= 0.67) return "親密";
  if (v >= 0.33) return "中程度";
  return "距離あり";
}

function PresetCard({ preset, onDelete }: { preset: Preset; onDelete: (id: string) => void }) {
  const [confirm, setConfirm]      = useState(false);
  const [pending, startTransition] = useTransition();

  const href =
    `/dashboard?f=${preset.formality.toFixed(3)}&i=${preset.intimacy.toFixed(3)}`;

  const handleDelete = () => {
    startTransition(async () => {
      onDelete(preset.id);
      const result = await deletePreset(preset.id);
      if (result.error) toast.error("削除に失敗しました");
    });
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", borderRadius: 12,
      border: "1px solid #f0f0f6", background: "#faf9ff",
    }}>
      <MiniPalette formality={preset.formality} intimacy={preset.intimacy} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1c1f2b", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {preset.name}
        </p>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#7b6ad0", background: "rgba(123,106,208,.1)", padding: "1px 7px", borderRadius: 999 }}>
            {formalityLabel(preset.formality)}
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#2563eb", background: "#dbeafe", padding: "1px 7px", borderRadius: 999 }}>
            {intimacyLabel(preset.intimacy)}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {confirm ? (
          <>
            <span style={{ fontSize: 11, color: "#e05", fontWeight: 600 }}>削除しますか？</span>
            <button
              onClick={handleDelete}
              disabled={pending}
              style={{
                border: "none", borderRadius: 6, padding: "3px 10px",
                background: "#ee0055", color: "#fff",
                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {pending ? "…" : "削除"}
            </button>
            <button
              onClick={() => setConfirm(false)}
              style={{ border: "none", background: "none", color: "#a3a6b8", fontSize: 15, cursor: "pointer", lineHeight: 1 }}
              aria-label="キャンセル"
            >×</button>
          </>
        ) : (
          <>
            <Link
              href={href}
              title="このトーンで作成"
              style={{
                display: "flex", alignItems: "center",
                color: "#7b6ad0", padding: "5px",
                border: "1.5px solid rgba(123,106,208,.25)", borderRadius: 8,
                background: "rgba(123,106,208,.05)", textDecoration: "none",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(123,106,208,.12)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(123,106,208,.05)";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
            </Link>
            <button
              onClick={() => setConfirm(true)}
              style={{ border: "none", background: "none", cursor: "pointer", color: "#d0d3e0", padding: "5px", display: "flex", alignItems: "center" }}
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
  );
}

export function PresetList({ initialPresets }: { initialPresets: Preset[] }) {
  const [presets, setPresets] = useState<Preset[]>(initialPresets);

  const handleDelete = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      {presets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontSize: 13, color: "#9295a8", fontWeight: 500, margin: "0 0 10px" }}>
            保存済みのトーンがありません
          </p>
          <Link
            href="/dashboard"
            style={{
              fontSize: 12.5, fontWeight: 700, color: "#7b6ad0",
              textDecoration: "none",
            }}
          >
            ダッシュボードで保存する →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {presets.map(p => (
            <PresetCard key={p.id} preset={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </>
  );
}
