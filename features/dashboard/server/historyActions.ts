"use server";

import { revalidatePath } from "next/cache";

import { getAuthAccess } from "@/features/auth/server/access";
import { createClient } from "@/lib/supabase/server";

export async function deleteActivityAction(formData: FormData) {
  const activityId = formData.get("activityId");
  if (typeof activityId !== "string" || !/^[0-9a-f-]{36}$/i.test(activityId)) return;

  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) return;

  const supabase = await createClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("user_activity")
    .delete()
    .eq("id", activityId)
    .eq("user_id", access.userId);

  if (error) {
    console.warn("[Historial] No se pudo retirar la actividad:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/historial");
}
