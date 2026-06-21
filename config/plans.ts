import type { Plan } from "@/types";

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "月3回まで生成",
      "基本トーン（丁寧・普通）",
      "履歴保存なし",
    ],
    limits: {
      palettesPerMonth: 3,
      savedPalettes: 0,
      tones: ["polite", "neutral"],
    },
  },
  {
    id: "tier1",
    name: "スタータ",
    price: 980,
    features: [
      "月30回まで生成",
      "全5トーン対応",
      "10件まで保存",
      "CSVエクスポート",
    ],
    limits: {
      palettesPerMonth: 30,
      savedPalettes: 10,
      tones: ["polite", "neutral", "casual", "firm", "warm"],
    },
  },
  {
    id: "tier2",
    name: "プロ",
    price: 2480,
    features: [
      "月200回まで生成",
      "全5トーン対応",
      "100件まで保存",
      "CSVエクスポート",
      "チームシェア（3名）",
    ],
    limits: {
      palettesPerMonth: 200,
      savedPalettes: 100,
      tones: ["polite", "neutral", "casual", "firm", "warm"],
    },
  },
  {
    id: "tier3",
    name: "エンタープライズ",
    price: 9800,
    features: [
      "無制限生成",
      "全5トーン対応",
      "無制限保存",
      "CSVエクスポート",
      "チームシェア（無制限）",
      "優先サポート",
      "カスタムトーン",
    ],
    limits: {
      palettesPerMonth: Infinity,
      savedPalettes: Infinity,
      tones: ["polite", "neutral", "casual", "firm", "warm"],
    },
  },
];

export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<
  Plan["id"],
  Plan
>;
