"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro:  "Pro",
};

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro:  30,
};

const GRADIENT = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ position: "relative", width: 26, height: 22, flexShrink: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 2, width: 14, height: 14, borderRadius: "50%", background: "#ff8a5b", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 9, top: 0, width: 14, height: 14, borderRadius: "50%", background: "#7b8cf0", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 5, top: 8, width: 12, height: 12, borderRadius: "50%", background: "#f76b8a", mixBlendMode: "multiply" }} />
    </div>
    <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em", color: "#1c1f2b" }}>tone palette</span>
  </div>
);

interface Profile {
  plan: string;
  generation_count: number;
  generation_month: string;
}

export function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("plan, generation_count, generation_month")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const plan  = profile?.plan ?? "free";
  const limit = PLAN_LIMITS[plan];
  const used  = profile?.generation_count ?? 0;
  const pct   = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
  const remaining = limit === Infinity ? "∞" : Math.max(0, limit - used);

  const navItems = [
    {
      href: "/dashboard",
      label: "新規作成",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      href: "/history",
      label: "履歴一覧",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9M3 4v4h4" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: "設定",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      height: "100vh",
      background: "#fff",
      borderRight: "1px solid rgba(20,20,40,.07)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      overflowY: "auto",
    }}>
      {/* ロゴ */}
      <div style={{ padding: "20px 20px 12px" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Logo />
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav style={{ padding: "8px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.07em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>
          メニュー
        </p>
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                color: active ? "#7b6ad0" : "#4a4d60",
                background: active ? "rgba(123,106,208,.09)" : "transparent",
                textDecoration: "none",
                transition: "background .15s, color .15s",
                marginBottom: 2,
              }}
            >
              <span style={{ color: active ? "#7b6ad0" : "#8a8ea0" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 利用状況 */}
      <div style={{ padding: "12px 16px 8px", borderTop: "1px solid rgba(20,20,40,.06)" }}>
        {/* プランバッジ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#6b6f82" }}>今月の利用状況</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#7b6ad0", background: "rgba(123,106,208,.1)", padding: "2px 8px", borderRadius: 999 }}>
            {PLAN_LABELS[plan]}
          </span>
        </div>

        {/* プログレスバー */}
        <div style={{ background: "#f0f0f6", borderRadius: 999, height: 6, marginBottom: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: pct > 80 ? "#f97316" : GRADIENT,
            transition: "width .4s",
          }} />
        </div>
        <p style={{ fontSize: 11, color: "#9295a8", fontWeight: 500, marginBottom: 12 }}>
          {limit === Infinity
            ? "無制限"
            : `残り ${remaining} 回 / ${limit} 回`}
        </p>

        {/* アップグレードボタン（Freeプランのみ）*/}
        {plan === "free" && (
          <Link
            href="/settings#billing"
            style={{
              display: "block", width: "100%", border: "none", cursor: "pointer",
              fontFamily: "inherit", textAlign: "center",
              fontSize: 12.5, fontWeight: 700, color: "#fff", padding: "10px",
              borderRadius: 10, background: GRADIENT, marginBottom: 10,
              textDecoration: "none",
            }}
          >
            ✦ アップグレード
          </Link>
        )}

        {/* ユーザー情報 & ログアウト */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#3a3d50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: "100%", border: "1px solid #e4e6f0", cursor: "pointer", fontFamily: "inherit",
            fontSize: 12, fontWeight: 600, color: "#6b6f82", padding: "8px",
            borderRadius: 8, background: "#fff", marginTop: 6, marginBottom: 8,
          }}
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
