"use client";

import Link from "next/link";
import { Suspense, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "../actions";

const GRADIENT = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "center" }}>
    <div style={{ position: "relative", width: 28, height: 24 }}>
      <div style={{ position: "absolute", left: 0, top: 3, width: 16, height: 16, borderRadius: "50%", background: "#ff8a5b", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 10, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#7b8cf0", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 5, top: 8, width: 13, height: 13, borderRadius: "50%", background: "#f76b8a", mixBlendMode: "multiply" }} />
    </div>
    <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "#1c1f2b" }}>tone palette</span>
  </div>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function LoginContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo />
          <p style={{ marginTop: 10, fontSize: 14, color: "#6b6f82", fontWeight: 500 }}>
            言葉の迷いをゼロにする、ビジネス表現のカラーパレット
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 22, padding: "36px 32px", boxShadow: "0 12px 40px rgba(70,60,120,.1)" }}>

          {urlError && (
            <div style={{ background: "rgba(248,90,90,.08)", border: "1px solid rgba(248,90,90,.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#c0392b", fontWeight: 500, marginBottom: 20 }}>
              {urlError}
            </div>
          )}

          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1c1f2b", margin: "0 0 6px", textAlign: "center" }}>
            アカウントでログイン / 登録
          </h2>
          <p style={{ fontSize: 13, color: "#9295a8", textAlign: "center", margin: "0 0 24px", fontWeight: 500 }}>
            初めての方は自動で無料アカウントが作成されます
          </p>

          <form
            action={() => startTransition(async () => { await signInWithGoogle(); })}
          >
            <button
              type="submit"
              disabled={pending}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "14px 20px",
                border: "1.5px solid #e4e6f0",
                borderRadius: 12,
                background: pending ? "#f7f7fb" : "#fff",
                cursor: pending ? "not-allowed" : "pointer",
                fontSize: 15,
                fontWeight: 700,
                color: "#1c1f2b",
                fontFamily: "inherit",
                transition: "border-color .15s, box-shadow .15s",
                boxShadow: "0 2px 8px rgba(0,0,0,.06)",
              }}
              onMouseEnter={e => {
                if (!pending) {
                  e.currentTarget.style.borderColor = "#b06ab3";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(176,106,179,.15)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e4e6f0";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";
              }}
            >
              <GoogleIcon />
              {pending ? "リダイレクト中…" : "Googleで続ける"}
            </button>
          </form>

          <div style={{ position: "relative", margin: "24px 0", textAlign: "center" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#e4e6f0" }} />
            <span style={{ position: "relative", background: "#fff", padding: "0 12px", fontSize: 12, color: "#b0b3c5", fontWeight: 600 }}>または</span>
          </div>

          <Link
            href="/dashboard"
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 12,
              border: "1.5px dashed #d4c9f0",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#7b6ad0",
              textDecoration: "none",
              transition: "border-color .15s, background .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#b06ab3";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(176,106,179,.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d4c9f0";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            ゲストとして試す（3回まで無料）
          </Link>
        </div>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 12.5, color: "#9295a8", textDecoration: "none" }}>
            ← トップページに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
