import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistoryList, type Generation } from "./HistoryList";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data }, { data: profile }] = await Promise.all([
    supabase
      .from("palette_generations")
      .select("id, input_text, output_text, tone_label, situation, formality, intimacy, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single(),
  ]);

  const isPro = (profile?.plan ?? "free") !== "free";

  const generations: Generation[] = (data ?? []).map(row => ({
    id:          row.id,
    input_text:  row.input_text,
    output_text: row.output_text,
    tone_label:  row.tone_label,
    situation:   row.situation,
    formality:   row.formality,
    intimacy:    row.intimacy ?? 0.4,
    created_at:  row.created_at,
  }));

  return <HistoryList initialGenerations={generations} isPro={isPro} />;
}
