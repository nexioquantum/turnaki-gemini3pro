import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { createPatientAction } from "./actions";
import { PatientForm } from "./patient-form";

type PatientRow = Pick<
  Database["public"]["Tables"]["patients"]["Row"],
  | "id"
  | "first_name"
  | "last_name"
  | "ci"
  | "phone"
  | "email"
  | "created_at"
  | "created_by"
>;

type PatientView = PatientRow & {
  created_by_profile?: {
    full_name: string | null;
  } | null;
};

type RoleCheck = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

const fetchPatients = async (): Promise<PatientView[]> => {
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

  const requesterProfileResponse = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const requesterProfile = requesterProfileResponse.data as RoleCheck | null;

  if (!requesterProfile || requesterProfile.role !== "ADMIN") {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("patients")
    .select(
      `
        id,
        first_name,
        last_name,
        ci,
        phone,
        email,
        created_at,
        created_by,
        created_by_profile:profiles!patients_created_by_fkey(full_name)
      `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error("No fue posible cargar los pacientes.");
  }

  return data as PatientView[];
};

export default async function AdminPatientsPage() {
  const patients = await fetchPatients();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Configuración · Pacientes
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Gestión de pacientes
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Registra y consulta pacientes del consultorio. Los datos se
              sincronizan con Supabase y respetan las políticas RLS definidas en{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
                docs/sistema-citas-odontologicas.md
              </code>
              .
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Volver al panel
          </Link>
        </header>

        <section className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Nuevo paciente</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Completa los campos obligatorios y confirma para registrar al
              paciente. La CI es única cuando se ingresa.
            </p>
            <div className="mt-4 rounded-2xl border border-zinc-100 p-4">
              <PatientForm action={createPatientAction} />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Checklist rápido</h2>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>• Verifica CI y teléfono antes de guardar.</li>
              <li>• Registra alergias relevantes y contacto de emergencia.</li>
              <li>
                • El campo correo se usa para futuras notificaciones (opcional).
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pacientes registrados</h2>
              <p className="text-sm text-zinc-600">
                {patients.length} paciente(s) en la base.
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Abrir en Supabase
            </a>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    CI
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Registrado por
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {patient.ci ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <div>{patient.phone}</div>
                      <div className="text-xs text-zinc-500">
                        {patient.email ?? "Sin correo"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {patient.created_by_profile?.full_name ?? "N/D"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(patient.created_at).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
                {patients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-zinc-500"
                    >
                      Aún no se registran pacientes.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

