import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PLAN_MAP } from "@/config/plans";
import { startCheckout, createPortalSession } from "./actions";

const GRADIENT = "linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)";

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="#22c55e" />
      <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, generation_count, generation_month, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const planId   = (profile?.plan ?? "free") as keyof typeof PLAN_MAP;
  const plan     = PLAN_MAP[planId] ?? PLAN_MAP["free"];
  const limit    = plan.limits.palettesPerMonth;
  const stripeId = profile?.stripe_customer_id as string | null | undefined;

  // 月が変わっていればカウントは 0 とみなす
  const currentMonth = new Date().toISOString().slice(0, 7);
  const count = profile?.generation_month === currentMonth
    ? (profile?.generation_count ?? 0)
    : 0;

  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - count);
  const pct       = limit === Infinity ? 0 : Math.min(100, (count / limit) * 100);

  // 現在のプランより上位のプランのみ表示
  const tierOrder = ["free", "tier1", "tier2", "tier3"];
  const currentIndex = tierOrder.indexOf(plan.id);
  const upgradePlans = PLANS.filter((p) => tierOrder.indexOf(p.id) > currentIndex);

  return (
    <div style={{ minHeight: "100%", padding: "28px 28px 48px", fontFamily: "inherit" }}>

      {/* ページタイトル */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>設定</h1>
        <p style={{ fontSize: 13, color: "#7a7e90", fontWeight: 500, marginTop: 4 }}>
          アカウント情報とプランを確認できます
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>

        {/* ── アカウント情報 ── */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 20px" }}>
            アカウント情報
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
              background: GRADIENT,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
            }}>
              {user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: "#1c1f2b", margin: 0 }}>
                {user.email}
              </p>
              <p style={{ fontSize: 12, color: "#9295a8", fontWeight: 500, marginTop: 3 }}>
                ログイン中
              </p>
            </div>
          </div>
        </div>

        {/* ── プラン・請求 ── */}
        <div id="billing" style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 20px" }}>
            プラン・請求
          </h2>

          {/* 現在のプラン */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid #f0f0f6",
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#9295a8", margin: "0 0 4px" }}>現在のプラン</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>{plan.name}</p>
              <p style={{ fontSize: 12.5, color: "#7a7e90", fontWeight: 500, marginTop: 3 }}>
                {plan.price === 0 ? "無料" : `¥${plan.price.toLocaleString()} / 月`}
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 999,
              color:      plan.id === "free" ? "#7b6ad0" : "#22a06b",
              background: plan.id === "free" ? "rgba(123,106,208,.1)" : "#dcfce7",
            }}>
              {plan.id === "free" ? "無料プラン" : "有料プラン"}
            </span>
          </div>

          {/* 今月の利用状況 */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f0f0f6" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#9295a8", margin: 0 }}>今月の生成回数</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1f2b", margin: 0 }}>
                {count} / {limit === Infinity ? "∞" : limit} 回
              </p>
            </div>
            <div style={{ background: "#f0f0f6", borderRadius: 999, height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: `${pct}%`,
                background: pct > 80 ? "#f97316" : GRADIENT,
                transition: "width .4s",
              }} />
            </div>
            <p style={{ fontSize: 11.5, color: "#9295a8", fontWeight: 500, marginTop: 6 }}>
              {limit === Infinity ? "無制限プランのため上限なし" : `残り ${remaining} 回`}
            </p>
          </div>

          {/* カスタマーポータル */}
          <div style={{
            background: "#f7f7fb", borderRadius: 14, padding: "18px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1c1f2b", margin: "0 0 3px" }}>
                プランの変更・解約
              </p>
              <p style={{ fontSize: 12, color: "#9295a8", fontWeight: 500, margin: 0 }}>
                カード情報の更新やダウングレード・解約はこちら
              </p>
            </div>
            {stripeId ? (
              <form action={createPortalSession} style={{ flexShrink: 0 }}>
                <button
                  type="submit"
                  style={{
                    border: "none", fontFamily: "inherit", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
                    padding: "11px 20px", borderRadius: 10, background: GRADIENT,
                  }}
                >
                  カスタマーポータル →
                </button>
              </form>
            ) : (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button
                  disabled
                  style={{
                    border: "none", fontFamily: "inherit", cursor: "not-allowed",
                    fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
                    padding: "11px 20px", borderRadius: 10, background: "#c5c8d8",
                  }}
                >
                  カスタマーポータル →
                </button>
                <span style={{
                  position: "absolute", top: -8, right: -8,
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  background: "#f97316", padding: "2px 7px", borderRadius: 999,
                }}>
                  有料プランのみ
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── アップグレード ── */}
        {upgradePlans.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 6px 24px rgba(70,60,120,.07)" }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a3a6b8", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 20px" }}>
              利用可能なプラン
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upgradePlans.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1.5px solid #e8e6f4",
                    borderRadius: 16, padding: "20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: "#1c1f2b", margin: 0 }}>{p.name}</p>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#7b6ad0" }}>
                        ¥{p.price.toLocaleString()} / 月
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {p.features.slice(0, 3).map((f) => (
                        <span key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#4a4d60", fontWeight: 500 }}>
                          <CheckIcon />{f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <form action={startCheckout.bind(null, p.id)} style={{ flexShrink: 0 }}>
                    <button
                      type="submit"
                      style={{
                        border: "none", fontFamily: "inherit", cursor: "pointer",
                        fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
                        padding: "11px 20px", borderRadius: 10, background: GRADIENT,
                      }}
                    >
                      このプランにする →
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
