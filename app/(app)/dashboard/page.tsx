import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient, { type HistoryItem, type Preset } from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("palette_generations")
    .select("id, input_text, output_text, tone_label, formality")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const initialHistory: HistoryItem[] = (data ?? []).map(row => ({
    id:          row.id,
    input_text:  row.input_text,
    output_text: row.output_text,
    tone_label:  row.tone_label,
    formality:   row.formality,
  }));

  const { data: presetsData } = await supabase
    .from("recipient_presets")
    .select("id, name, formality, intimacy")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const initialPresets: Preset[] = presetsData ?? [];

  const { checkout } = await searchParams;

  return (
    <DashboardClient
      initialHistory={initialHistory}
      initialPresets={initialPresets}
      checkoutSuccess={checkout === "success"}
    />
  );
}
