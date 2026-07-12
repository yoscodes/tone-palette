"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteGeneration(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase
    .from("palette_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // RLS の二重保証

  if (error) return { error: error.message };
  return {};
}
