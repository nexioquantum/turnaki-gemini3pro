import Link from "next/link";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { AppointmentForm } from "./appointment-form";
import { createAppointmentAction } from "./actions";

type PatientOption = {
  id: string;
  label: string;
};

type SillonOption = {
  id: string;
  description: string;
};

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role" | "full_name"
>;

type PatientRow = Pick<
  Database["public"]["Tables"]["patients"]["Row"],
  "id" | "first_name" | "last_name" | "ci"
>;

type SillonRow = {
  sillon_id: string;
  priority: number | null;
  sillones: {
    name: string | null;
    location: string | null;
  } | null;
};

const timeZone = "America/Guayaquil";

const getDefaultDateTime = () => {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone,
  }).format(now);

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(now);

  return { date, time };
};

export default async function NuevaCitaOdontologoPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const db = supabase as SupabaseClient<Database>;

  const [{ data: profileData }, { date: defaultDate, time: defaultTime }] =
    await Promise.all([
      db
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      Promise.resolve(getDefaultDateTime()),
    ]);

  const profile = profileData as ProfileRow | null;

  if (!profile || profile.role !== "ODONTOLOGO") {
    redirect("/");
  }

  const [{ data: patientsData }, { data: sillonesData }] = await Promise.all([
    db
      .from("patients")
      .select("id, first_name, last_name, ci")
      .order("first_name", { ascending: true }),
    db
      .from("odontologo_sillon")
      .select(
        `
        sillon_id,
        priority,
        sillones (
          name,
          location
        )
      `
      )
      .eq("odontologo_id", user.id)
      .eq("active", true)
      .order("priority", { ascending: true }),
  ]);

  const patientRows = (patientsData ?? []) as PatientRow[];
  const patients: PatientOption[] = patientRows.map((patient) => ({
      id: patient.id,
      label: `${patient.first_name} ${patient.last_name}${
        patient.ci ? ` · CI ${patient.ci}` : ""
      }`,
    }));

  const sillonRows = (sillonesData ?? []) as SillonRow[];
  const sillones: SillonOption[] = sillonRows.map((row) => ({
      id: row.sillon_id,
      description: `${row.sillones?.name ?? "Sillón"}${
        row.sillones?.location ? ` · ${row.sillones.location}` : ""
      }`,
    }));

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <main className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Agenda · Odontólogo
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Crear cita confirmada
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {profile.full_name ?? "Profesional"} · Tu disponibilidad depende de
              los sillones que el administrador te haya asignado. Evita
              solapamientos confirmando el horario antes de guardar.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Volver al panel
          </Link>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Datos de la cita</h2>
              <p className="text-sm text-zinc-600">
                Completa los campos obligatorios. La cita se crea confirmada y
                se registra con origen Odontólogo.
              </p>
            </div>

            <AppointmentForm
              patients={patients}
              sillones={sillones}
              defaultDate={defaultDate}
              defaultTime={defaultTime}
              action={createAppointmentAction}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Checklist rápido</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>• Verifica la disponibilidad real antes de confirmar.</li>
            <li>• Solo se permiten citas confirmadas sin sillones duplicados.</li>
            <li>
              • Si el paciente aún no existe, solicítalo al administrador o
              regístralo durante el agendamiento.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

