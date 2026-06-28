"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "../actions";

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

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null);

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Noto Sans JP', sans-serif" }}>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo />
          <p style={{ marginTop: 10, fontSize: 14, color: "#6b6f82", fontWeight: 500 }}>
            無料アカウントを作成
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 22, padding: "36px 32px", boxShadow: "0 12px 40px rgba(70,60,120,.1)" }}>

          {state?.success ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1f2b", lineHeight: 1.6 }}>確認メールを送信しました</p>
              <p style={{ marginTop: 8, fontSize: 13, color: "#7a7e90", lineHeight: 1.7 }}>
                {state.success}
              </p>
              <Link
                href="/login"
                style={{ display: "inline-block", marginTop: 20, fontSize: 13.5, fontWeight: 700, color: "#7b6ad0", textDecoration: "none" }}
              >
                ログインページへ →
              </Link>
            </div>
          ) : (
            <form action={action} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {state?.error && (
                <div style={{ background: "rgba(248,90,90,.08)", border: "1px solid rgba(248,90,90,.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#c0392b", fontWeight: 500 }}>
                  {state.error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#3a3d50" }} htmlFor="email">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  style={{ border: "1.5px solid #e4e6f0", borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#1c1f2b", background: "#fafafa" }}
                  onFocus={e => (e.target.style.borderColor = "#b06ab3")}
                  onBlur={e => (e.target.style.borderColor = "#e4e6f0")}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#3a3d50" }} htmlFor="password">
                  パスワード <span style={{ fontWeight: 500, color: "#9295a8" }}>（8文字以上）</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  style={{ border: "1.5px solid #e4e6f0", borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#1c1f2b", background: "#fafafa" }}
                  onFocus={e => (e.target.style.borderColor = "#b06ab3")}
                  onBlur={e => (e.target.style.borderColor = "#e4e6f0")}
                />
              </div>

              <div style={{ background: "#f7f7fb", borderRadius: 12, padding: "12px 16px", fontSize: 12.5, color: "#7a7e90", fontWeight: 500, lineHeight: 1.6 }}>
                登録することで、<Link href="#" style={{ color: "#7b6ad0", textDecoration: "none" }}>利用規約</Link>および
                <Link href="#" style={{ color: "#7b6ad0", textDecoration: "none" }}>プライバシーポリシー</Link>に同意したものとみなされます。
              </div>

              <button
                type="submit"
                disabled={pending}
                style={{ marginTop: 4, border: "none", cursor: pending ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#fff", padding: "14px", borderRadius: 12, background: pending ? "#c5c8d8" : "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)" }}
              >
                {pending ? "作成中…" : "無料で登録する"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: "#6b6f82", fontWeight: 500 }}>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" style={{ color: "#7b6ad0", fontWeight: 700, textDecoration: "none" }}>
            ログイン
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          <Link href="/" style={{ fontSize: 12.5, color: "#9295a8", textDecoration: "none" }}>
            ← トップページに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
