import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const pacienteSchema = z.object({
  first_name: z.string().min(2, "Ingresa el nombre del paciente."),
  last_name: z.string().min(2, "Ingresa el apellido del paciente."),
  ci: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  date_of_birth: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
  address: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
  phone: z.string().min(7, "Ingresa un número de teléfono válido."),
  email: z
    .string()
    .email("Ingresa un correo válido.")
    .optional()
    .transform((value) => (value ? value : null)),
  emergency_contact_name: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
  emergency_contact_phone: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
  allergies: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
  notes: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
});

export type PatientFormState = {
  error: string | null;
  success: boolean;
};

export const patientInitialState: PatientFormState = {
  error: null,
  success: false,
};

export async function createPatientAction(
  _prevState: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error:
        "Supabase no está configurado. Revisa las variables de entorno de la base de datos.",
      success: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = pacienteSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    ci: formData.get("ci"),
    date_of_birth: formData.get("date_of_birth"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    emergency_contact_name: formData.get("emergency_contact_name"),
    emergency_contact_phone: formData.get("emergency_contact_phone"),
    allergies: formData.get("allergies"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
      success: false,
    };
  }

  const db = supabase as SupabaseClient<Database>;

  const payload: Database["public"]["Tables"]["patients"]["Insert"] = {
    ...parsed.data,
    created_by: user.id,
  };

  // FIXME: Supabase tipo insert no infiere correctamente en esta versión, se castea a any.
  // Supabase aún no expone tipado completo para insert en SSR (ver nota en backlog).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawDb = db as SupabaseClient<any>;
  const { error } = await rawDb.from("patients").insert(payload);

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Ya existe un paciente con esa cédula (CI).",
        success: false,
      };
    }

    return {
      error: "No se pudo crear el paciente. Intenta nuevamente.",
      success: false,
    };
  }

  revalidatePath("/admin/pacientes");

  return {
    error: null,
    success: true,
  };
}

