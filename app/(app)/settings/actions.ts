"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
};

export async function startCheckout(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const priceId = PLAN_PRICE_IDS[planId];
  if (!priceId) throw new Error(`Unknown plan: ${planId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const existingCustomerId = profile?.stripe_customer_id as string | null | undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(existingCustomerId
      ? { customer: existingCustomerId }
      : { customer_email: user.email ?? undefined }),
    metadata: { userId: user.id, planId },
    success_url: `${SITE_URL}/dashboard?checkout=success`,
    cancel_url:  `${SITE_URL}/settings`,
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customerId = profile?.stripe_customer_id as string | null | undefined;
  if (!customerId) throw new Error("Stripe カスタマーが見つかりません");

  const session = await stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: `${SITE_URL}/settings`,
  });

  redirect(session.url);
}

export async function deletePreset(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };
  const { error } = await supabase
    .from("recipient_presets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // ユーザーデータを先に削除（外部キー制約がない場合の安全策）
  await Promise.all([
    supabaseAdmin.from("palette_generations").delete().eq("user_id", user.id),
    supabaseAdmin.from("recipient_presets").delete().eq("user_id", user.id),
  ]);
  await supabaseAdmin.from("profiles").delete().eq("id", user.id);

  // Auth ユーザーを削除（Service Role 必須）
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  redirect("/");
}
