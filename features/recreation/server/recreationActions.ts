"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { RecreationActivityDraft, RecreationActivityRecord } from "../types";

interface RecreationActionResult<T> {
  success: boolean;
  message: string;
  data: T;
  fieldErrors?: Record<string, string[] | undefined>;
}

const recreationActivitySchema = z.object({
  title: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(160),
  type: z.enum(["juego", "yincana", "escape-room", "reto", "integracion", "tradicional"]),
  objective: z.string().trim().min(2, "El objetivo es obligatorio.").max(1000),
  level: z.string().trim().max(120),
  duration: z.string().trim().max(40),
  participants: z.string().trim().max(120),
  space: z.string().trim().max(240),
  materials: z.string().trim().max(1000),
  instructions: z.string().trim().min(2, "Las instrucciones son obligatorias.").max(5000),
  adaptations: z.string().trim().max(3000),
  safety: z.string().trim().min(2, "Las normas de seguridad son obligatorias.").max(3000),
});

async function getAuthenticatedContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, userId: null };
  }

  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (error || !userId) {
    return { supabase: null, userId: null };
  }

  return { supabase, userId };
}

function mapActivity(row: Record<string, unknown>): RecreationActivityRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    type: row.activity_type as RecreationActivityRecord["type"],
    objective: String(row.objective ?? ""),
    level: String(row.level ?? ""),
    duration: row.duration_minutes === null || row.duration_minutes === undefined ? "" : `${row.duration_minutes} minutos`,
    participants: String(row.participants ?? ""),
    space: String(row.space ?? ""),
    materials: String(row.materials ?? ""),
    instructions: String(row.instructions ?? ""),
    adaptations: String(row.adaptations ?? ""),
    safety: String(row.safety ?? ""),
    status: row.status as RecreationActivityRecord["status"],
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function parseDuration(value: string): number | null {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export async function listRecreationActivitiesAction(): Promise<RecreationActionResult<RecreationActivityRecord[]>> {
  const { supabase, userId } = await getAuthenticatedContext();
  if (!supabase || !userId) return { success: false, message: "Debes iniciar sesion.", data: [] };

  const { data, error } = await supabase
    .from("physical_education_recreation_activities")
    .select("id, owner_id, title, activity_type, objective, level, duration_minutes, participants, space, materials, instructions, adaptations, safety, evaluation, status, created_at, updated_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("No se pudieron consultar las actividades recreativas:", error);
    return { success: false, message: "No pudimos cargar las actividades.", data: [] };
  }

  return { success: true, message: "Actividades cargadas correctamente.", data: (data ?? []).map((row) => mapActivity(row as Record<string, unknown>)) };
}

export async function createRecreationActivityAction(input: RecreationActivityDraft): Promise<RecreationActionResult<{ id: string } | null>> {
  const parsed = recreationActivitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Revisa los campos de la actividad.", data: null, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, userId } = await getAuthenticatedContext();
  if (!supabase || !userId) return { success: false, message: "Debes iniciar sesion.", data: null };

  const { data, error } = await supabase
    .from("physical_education_recreation_activities")
    .insert({
      owner_id: userId,
      title: parsed.data.title,
      activity_type: parsed.data.type,
      objective: parsed.data.objective,
      level: parsed.data.level || null,
      duration_minutes: parseDuration(parsed.data.duration),
      participants: parsed.data.participants || null,
      space: parsed.data.space || null,
      materials: parsed.data.materials || null,
      instructions: parsed.data.instructions,
      adaptations: parsed.data.adaptations || null,
      safety: parsed.data.safety,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("No se pudo guardar la actividad recreativa:", error);
    return { success: false, message: "No pudimos guardar la actividad.", data: null };
  }

  revalidatePath("/recreacion");
  return { success: true, message: "Actividad guardada correctamente.", data: { id: data.id } };
}
export async function updateRecreationActivityAction(
  id: string,
  input: RecreationActivityDraft,
): Promise<RecreationActionResult<{ id: string } | null>> {
  const parsedId = z.string().uuid().safeParse(id);
  const parsed = recreationActivitySchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { success: false, message: "Revisa los campos de la actividad.", data: null };
  }

  const { supabase, userId } = await getAuthenticatedContext();
  if (!supabase || !userId) return { success: false, message: "Debes iniciar sesion.", data: null };

  const { data, error } = await supabase
    .from("physical_education_recreation_activities")
    .update({
      title: parsed.data.title,
      activity_type: parsed.data.type,
      objective: parsed.data.objective,
      level: parsed.data.level || null,
      duration_minutes: parseDuration(parsed.data.duration),
      participants: parsed.data.participants || null,
      space: parsed.data.space || null,
      materials: parsed.data.materials || null,
      instructions: parsed.data.instructions,
      adaptations: parsed.data.adaptations || null,
      safety: parsed.data.safety,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsedId.data)
    .eq("owner_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("No se pudo actualizar la actividad recreativa:", error);
    return { success: false, message: "No pudimos actualizar la actividad.", data: null };
  }

  revalidatePath("/recreacion");
  return { success: true, message: "Actividad actualizada correctamente.", data: { id: data.id } };
}

export async function publishRecreationActivityAction(
  id: string,
): Promise<RecreationActionResult<{ id: string } | null>> {
  return changeRecreationActivityStatus(id, "published");
}

export async function archiveRecreationActivityAction(
  id: string,
): Promise<RecreationActionResult<{ id: string } | null>> {
  return changeRecreationActivityStatus(id, "archived");
}

async function changeRecreationActivityStatus(
  id: string,
  status: "draft" | "published" | "archived",
): Promise<RecreationActionResult<{ id: string } | null>> {
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return { success: false, message: "La actividad no es valida.", data: null };

  const { supabase, userId } = await getAuthenticatedContext();
  if (!supabase || !userId) return { success: false, message: "Debes iniciar sesion.", data: null };

  const { data, error } = await supabase
    .from("physical_education_recreation_activities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", parsedId.data)
    .eq("owner_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("No se pudo cambiar el estado de la actividad recreativa:", error);
    return { success: false, message: "No pudimos actualizar el estado.", data: null };
  }

  revalidatePath("/recreacion");
  return { success: true, message: status === "published" ? "Actividad publicada correctamente." : status === "draft" ? "Actividad restaurada correctamente." : "Actividad archivada correctamente.", data: { id: data.id } };
}
export async function restoreRecreationActivityAction(
  id: string,
): Promise<RecreationActionResult<{ id: string } | null>> {
  return changeRecreationActivityStatus(id, "draft");
}