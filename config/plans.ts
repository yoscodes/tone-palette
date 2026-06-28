import type { Plan } from "@/types";

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "月10回まで生成",
      "全5シチュエーション対応",
      "直近20件の履歴",
    ],
    limits: {
      palettesPerMonth: 10,
      savedPalettes: 0,
      tones: ["polite", "neutral", "casual", "firm", "warm"],
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 980,
    features: [
      "月30回まで生成",
      "全5シチュエーション対応",
      "生成履歴（全件保存）",
    ],
    limits: {
      palettesPerMonth: 30,
      savedPalettes: 100,
      tones: ["polite", "neutral", "casual", "firm", "warm"],
    },
  },
];

export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<
  Plan["id"],
  Plan
>;
