"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "./actions";

const CONFIRM_WORD = "削除する";

export function AccountDeleteButton() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [pending, startTransition] = useTransition();

  const confirmed = input === CONFIRM_WORD;

  const handleDelete = () => {
    if (!confirmed) return;
    startTransition(async () => {
      await deleteAccount();
    });
  };

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={() => setOpen(true)}
        style={{
          border: "1.5px solid rgba(220,38,38,.35)",
          borderRadius: 10, padding: "10px 20px",
          background: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: 13.5, fontWeight: 700, color: "#dc2626",
          transition: "background .15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,.06)")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        アカウントを削除する
      </button>

      {/* 確認モーダル */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px 16px",
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "36px 32px",
            maxWidth: 420, width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,.2)",
            position: "relative",
          }}>
            {/* 閉じるボタン */}
            <button
              onClick={() => { setOpen(false); setInput(""); }}
              disabled={pending}
              style={{
                position: "absolute", top: 16, right: 16,
                border: "none", background: "none", cursor: "pointer",
                color: "#b0b3c5", padding: 4, borderRadius: 6,
                display: "flex", alignItems: "center",
              }}
              aria-label="閉じる"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* アイコン + タイトル */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(220,38,38,.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1f2b", margin: "0 0 10px" }}>
                アカウントを削除しますか？
              </h2>
              <p style={{ fontSize: 13.5, color: "#6b6f82", fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
                この操作は<strong style={{ color: "#dc2626" }}>取り消せません。</strong><br />
                生成履歴・プリセット・プロフィールのすべてのデータが完全に削除されます。
              </p>
            </div>

            {/* テキスト確認入力 */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12.5, color: "#6b6f82", fontWeight: 600, marginBottom: 8 }}>
                確認のため <strong style={{ color: "#1c1f2b" }}>「{CONFIRM_WORD}」</strong> と入力してください
              </p>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={CONFIRM_WORD}
                autoFocus
                disabled={pending}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: `1.5px solid ${confirmed ? "#dc2626" : "#e4e6f0"}`,
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 14, fontFamily: "inherit", color: "#1c1f2b", outline: "none",
                  transition: "border-color .15s",
                }}
                onFocus={e => { if (!confirmed) e.target.style.borderColor = "#b06ab3"; }}
                onBlur={e  => { if (!confirmed) e.target.style.borderColor = "#e4e6f0"; }}
              />
            </div>

            {/* アクションボタン */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setOpen(false); setInput(""); }}
                disabled={pending}
                style={{
                  flex: 1, border: "1.5px solid #e4e6f0", borderRadius: 12,
                  background: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 13.5, fontWeight: 600, color: "#6b6f82", padding: "12px",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={!confirmed || pending}
                style={{
                  flex: 1, border: "none", borderRadius: 12,
                  background: confirmed ? "#dc2626" : "#f0f0f6",
                  cursor: confirmed && !pending ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  fontSize: 13.5, fontWeight: 700,
                  color: confirmed ? "#fff" : "#b0b3c5",
                  padding: "12px",
                  transition: "background .2s, color .2s",
                  boxShadow: confirmed ? "0 4px 14px rgba(220,38,38,.3)" : "none",
                }}
              >
                {pending ? "削除中…" : "完全に削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
