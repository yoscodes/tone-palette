import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

function priceToPlan(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  return "free";
}

function customerId(customer: Stripe.Checkout.Session["customer"]): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  switch (event.type) {
    // ── 決済完了 ─────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId    = session.metadata?.userId;
      const planId    = session.metadata?.planId;
      const custId    = customerId(session.customer);

      if (userId && planId && custId) {
        await supabaseAdmin
          .from("profiles")
          .update({ plan: planId, stripe_customer_id: custId })
          .eq("id", userId);
      }
      break;
    }

    // ── プラン変更（アップグレード・ダウングレード・更新）────────
    case "customer.subscription.updated": {
      const sub    = event.data.object as Stripe.Subscription;
      const custId = typeof sub.customer === "string" ? sub.customer : (sub.customer as Stripe.Customer).id;
      const priceId = sub.items.data[0]?.price.id;
      const planId  = priceId ? priceToPlan(priceId) : "free";

      if (sub.status === "active" || sub.status === "trialing") {
        await supabaseAdmin
          .from("profiles")
          .update({ plan: planId })
          .eq("stripe_customer_id", custId);
      }
      break;
    }

    // ── サブスクリプション解約 → Free へダウングレード ─────────
    case "customer.subscription.deleted": {
      const sub    = event.data.object as Stripe.Subscription;
      const custId = typeof sub.customer === "string" ? sub.customer : (sub.customer as Stripe.Customer).id;

      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free" })
        .eq("stripe_customer_id", custId);
      break;
    }
  }

  return new Response(null, { status: 200 });
}
