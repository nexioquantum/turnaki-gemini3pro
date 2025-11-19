"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppointmentFormState } from "./state";
import { appointmentInitialState } from "./state";

type ProfileRoleRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role"
>;

const formSchema = z.object({
  patient_id: z.string().uuid("Selecciona un paciente válido."),
  sillon_id: z.string().uuid("Selecciona un sillón válido."),
  date: z.string().min(1, "Selecciona la fecha de la cita."),
  start_time: z.string().min(1, "Selecciona la hora de inicio."),
  duration: z.coerce
    .number()
    .min(15, "La duración mínima es 15 minutos.")
    .max(240, "La duración máxima es 240 minutos."),
  motivo_detalle: z
    .string()
    .max(500, "El motivo no debe superar 500 caracteres.")
    .optional()
    .transform((value) => (value ? value : null)),
  honorario_estimado: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine(
      (value) => value === null || !Number.isNaN(value),
      "Ingresa un honorario válido."
    ),
});

const BLOCKING_STATUSES: Database["public"]["Enums"]["appointment_status"][] = [
  "PENDIENTE",
  "CONFIRMADA",
];

const timeZone = "America/Guayaquil";

const formatLocalDateTime = (date: Date) =>
  new Intl.DateTimeFormat("es-EC", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export async function createAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ...appointmentInitialState,
      error:
        "Supabase no está configurado. Revisa las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const db = supabase as SupabaseClient<Database>;

  const { data: profileData } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as ProfileRoleRow | null;

  if (!profile || profile.role !== "ODONTOLOGO") {
    redirect("/");
  }

  const parsed = formSchema.safeParse({
    patient_id: formData.get("patient_id"),
    sillon_id: formData.get("sillon_id"),
    date: formData.get("date"),
    start_time: formData.get("start_time"),
    duration: formData.get("duration"),
    motivo_detalle: formData.get("motivo_detalle"),
    honorario_estimado: formData.get("honorario_estimado"),
  });

  if (!parsed.success) {
    return {
      ...appointmentInitialState,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const {
    patient_id: patientId,
    sillon_id: sillonId,
    date,
    start_time: startTime,
    duration,
    motivo_detalle: motivoDetalle,
    honorario_estimado: honorarioEstimado,
  } = parsed.data;

  const normalizedTime = startTime.length === 5 ? `${startTime}:00` : startTime;
  const startWithOffset = `${date}T${normalizedTime}-05:00`;
  const startDate = new Date(startWithOffset);

  if (Number.isNaN(startDate.getTime())) {
    return {
      ...appointmentInitialState,
      error: "La fecha u hora seleccionada no es válida.",
    };
  }

  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  const startUtc = startDate.toISOString();
  const endUtc = endDate.toISOString();

  const { data: sillonAssignment } = await db
    .from("odontologo_sillon")
    .select("id")
    .eq("odontologo_id", user.id)
    .eq("sillon_id", sillonId)
    .eq("active", true)
    .maybeSingle();

  if (!sillonAssignment) {
    return {
      ...appointmentInitialState,
      error: "El sillón seleccionado no está asociado a tu perfil.",
    };
  }

  const { data: odontologoOverlap } = await db
    .from("appointments")
    .select("id")
    .lt("start_at", endUtc)
    .gt("end_at", startUtc)
    .in("status", BLOCKING_STATUSES)
    .eq("odontologo_id", user.id);

  if (odontologoOverlap && odontologoOverlap.length > 0) {
    return {
      ...appointmentInitialState,
      error: "Ya tienes una cita asignada en ese horario.",
    };
  }

  const { data: sillonOverlap } = await db
    .from("appointments")
    .select("id")
    .lt("start_at", endUtc)
    .gt("end_at", startUtc)
    .in("status", BLOCKING_STATUSES)
    .eq("sillon_id", sillonId);

  if (sillonOverlap && sillonOverlap.length > 0) {
    return {
      ...appointmentInitialState,
      error: "El sillón seleccionado está reservado en ese horario.",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawDb = db as SupabaseClient<any>;
  const { error: insertError } = await rawDb.from("appointments").insert({
    odontologo_id: user.id,
    paciente_id: patientId,
    sillon_id: sillonId,
    start_at: startUtc,
    end_at: endUtc,
    status: "CONFIRMADA",
    origin: "ODONTOLOGO",
    motivo_detalle: motivoDetalle,
    honorario_estimado: honorarioEstimado,
  });

  if (insertError) {
    return {
      ...appointmentInitialState,
      error: "No se pudo registrar la cita. Intenta nuevamente.",
    };
  }

  revalidatePath("/odontologo/citas/nueva");

  return {
    error: null,
    successMessage: `Cita confirmada para ${formatLocalDateTime(startDate)}.`,
  };
}

