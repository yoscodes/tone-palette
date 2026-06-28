"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { registerEarlyAccess } from "@/app/(marketing)/actions";

const GRADIENT_BTN = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";

interface Props {
  buttonLabel?: string;
  style?: React.CSSProperties;
}

export function EarlyAccessForm({ buttonLabel = "登録する →", style }: Props) {
  const [registered, setRegistered] = useState(false);
  const [state, formAction, isPending] = useActionState(registerEarlyAccess, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      setRegistered(true);
      toast.success("登録が完了しました！リリース時にお知らせします。");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (registered) {
    return (
      <div style={{
        background: "#fff", borderRadius: 999, padding: "14px 24px",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 8px 32px rgba(80,70,130,.14)",
        ...style,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#22c55e" />
          <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#22a06b" }}>
          登録完了！リリース時にご連絡します。
        </span>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      style={{
        display: "flex", background: "#fff", borderRadius: 999, padding: 6,
        boxShadow: "0 8px 32px rgba(80,70,130,.14)",
        ...style,
      }}
    >
      <input
        name="email"
        type="email"
        required
        placeholder="メールアドレスを入力"
        disabled={isPending}
        style={{
          flex: 1, border: "none", outline: "none", background: "transparent",
          fontSize: 14, padding: "0 18px", fontFamily: "inherit", color: "#333",
        }}
      />
      <button
        type="submit"
        disabled={isPending}
        style={{
          border: "none",
          cursor: isPending ? "not-allowed" : "pointer",
          fontFamily: "inherit", whiteSpace: "nowrap",
          fontSize: 14, fontWeight: 700, color: "#fff",
          padding: "13px 22px", borderRadius: 999,
          background: isPending ? "#c5c8d8" : GRADIENT_BTN,
          transition: "background .15s",
        }}
      >
        {isPending ? "登録中…" : buttonLabel}
      </button>
    </form>
  );
}
