import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "role" | "active" | "created_at"
>;

type RoleCheck = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

const roleLabels: Record<ProfileRow["role"], string> = {
  ADMIN: "Administrador",
  ODONTOLOGO: "Odontólogo",
  ASISTENTE: "Asistente",
};

const roleColors: Record<ProfileRow["role"], string> = {
  ADMIN: "bg-violet-100 text-violet-800",
  ODONTOLOGO: "bg-sky-100 text-sky-800",
  ASISTENTE: "bg-amber-100 text-amber-800",
};

const statusColors: Record<"active" | "inactive", string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-rose-100 text-rose-800",
};

async function loadProfiles(): Promise<ProfileRow[]> {
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
    .from("profiles")
    .select("id, full_name, role, active, created_at")
    .order("full_name", { ascending: true });

  if (error || !data) {
    throw new Error("No fue posible cargar la lista de perfiles.");
  }

  return data;
}

export default async function AdminProfilesPage() {
  const profiles = await loadProfiles();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <main className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Configuración · Usuarios
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Administración de perfiles
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Consulta el estado de los usuarios definidos en Supabase Auth y en
              la tabla{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
                profiles
              </code>
              . El administrador puede verificar roles, estados y fechas de alta.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Volver al panel
            </Link>
            <a
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Abrir Supabase
            </a>
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Nombre completo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    Fecha de creación
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-4 py-3 text-zinc-900">
                      {profile.full_name ?? "Sin nombre"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleColors[profile.role]}`}
                      >
                        {roleLabels[profile.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[profile.active ? "active" : "inactive"]
                        }`}
                      >
                        {profile.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(profile.created_at).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {profile.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Esta vista es de solo lectura. La creación y administración de
            credenciales se realiza desde Supabase Auth para mantener la
            consistencia con el plan documentado.
          </p>
        </section>
      </main>
    </div>
  );
}

