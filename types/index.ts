export type PlanTier = "free" | "pro";

export interface User {
  id: string;
  email: string;
  plan: PlanTier;
  createdAt: string;
}

export interface PaletteItem {
  id: string;
  userId: string;
  situation: string;
  tone: ToneLevel;
  expressions: Expression[];
  createdAt: string;
}

export type ToneLevel = "polite" | "neutral" | "casual" | "firm" | "warm";

export interface Expression {
  id: string;
  text: string;
  label: string;
  color: string;
}

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  features: string[];
  limits: {
    palettesPerMonth: number;
    savedPalettes: number;
    tones: ToneLevel[];
  };
}
