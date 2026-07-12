import { createClient } from "@/lib/supabase/server";
import DashboardClient, { type HistoryItem, type Preset } from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; f?: string; i?: string; s?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialHistory: HistoryItem[] = [];
  let initialPresets: Preset[] = [];

  if (user) {
    const [{ data }, { data: presetsData }] = await Promise.all([
      supabase
        .from("palette_generations")
        .select("id, input_text, output_text, tone_label, formality")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("recipient_presets")
        .select("id, name, formality, intimacy")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    initialHistory = (data ?? []).map(row => ({
      id:          row.id,
      input_text:  row.input_text,
      output_text: row.output_text,
      tone_label:  row.tone_label,
      formality:   row.formality,
    }));

    initialPresets = presetsData ?? [];
  }

  const { checkout, f, i, s } = await searchParams;

  const initialFormality = f ? parseFloat(f) : undefined;
  const initialIntimacy  = i ? parseFloat(i) : undefined;

  return (
    <DashboardClient
      initialHistory={initialHistory}
      initialPresets={initialPresets}
      checkoutSuccess={checkout === "success"}
      initialFormality={!isNaN(initialFormality ?? NaN) ? initialFormality : undefined}
      initialIntimacy={!isNaN(initialIntimacy ?? NaN) ? initialIntimacy : undefined}
      initialSituation={s || undefined}
    />
  );
}
