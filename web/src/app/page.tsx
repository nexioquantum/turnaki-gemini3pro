import Link from "next/link";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { signOutAction } from "@/app/actions/signout";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type HealthStatus = "ready" | "missing-env" | "error";

type HealthResult = {
  status: HealthStatus;
  message: string;
  details?: string;
};

type ProfileSummary = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "full_name" | "role"
>;

type DashboardContext = {
  health: HealthResult;
  profileName?: string | null;
  role?: string | null;
};

const setupSteps = [
  {
    title: "Variables de entorno",
    description:
      "Copia .env.local.example y agrega las claves de Supabase (URL, anon y service role).",
  },
  {
    title: "Migraciones",
    description:
      "Ejecuta supabase db push (o carga el SQL) para crear tablas, catálogos y políticas.",
  },
  {
    title: "Usuarios iniciales",
    description:
      "Crea en Supabase Auth a Calixto (admin) y a los odontólogos Kelvin y Josue.",
  },
  {
    title: "Verificación manual",
    description:
      "Confirma que puedes iniciar sesión y crear un paciente de prueba en el ambiente staging.",
  },
];

const getSupabaseHealth = async (
  supabase: SupabaseClient<Database>
): Promise<HealthResult> => {
  const { error } = await supabase
    .from("profiles")
    .select("id", { head: true, count: "exact" });

  if (error) {
    return {
      status: "error",
      message: "La aplicación no pudo comunicarse con Supabase.",
      details: error.message,
    };
  }

  return {
    status: "ready",
    message: "Conexión a Supabase verificada correctamente.",
  };
};

const loadDashboardContext = async (): Promise<DashboardContext> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      health: {
        status: "missing-env",
        message: "Configura las variables de Supabase para habilitar la conexión.",
        details: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profileData }, health] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle(),
    getSupabaseHealth(supabase),
  ]);

  const profile = (profileData as ProfileSummary | null) ?? null;

  return {
    health,
    profileName: profile?.full_name ?? user.email,
    role: profile?.role ?? "SIN_ROL",
  };
};

const statusClasses: Record<HealthStatus, string> = {
  ready: "bg-emerald-50 text-emerald-900 border-emerald-200",
  "missing-env": "bg-amber-50 text-amber-900 border-amber-200",
  error: "bg-rose-50 text-rose-900 border-rose-200",
};

export default async function Home() {
  const { health, profileName, role } = await loadDashboardContext();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 font-sans text-zinc-950">
      <main className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                KMDT Dental Studio · Agenda inteligente
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">
                Panel de arranque del proyecto
              </h1>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            Este dashboard resume el estado inicial del sistema descrito en{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm text-zinc-700">
              docs/sistema-citas-odontologicas.md
            </code>
            . Sigue cada paso para garantizar que el entorno quede listo antes
            de implementar las iteraciones del MVP.
          </p>
          {profileName ? (
            <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
              <p className="font-medium text-zinc-900">Sesión activa</p>
              <p>
                {profileName} · <span className="uppercase">{role}</span>
              </p>
            </div>
          ) : null}
        </header>

        <section
          className={`rounded-2xl border p-6 transition-colors ${statusClasses[health.status]}`}
        >
          <p className="text-sm font-semibold uppercase tracking-wide">
            Estado de Supabase
          </p>
          <p className="mt-2 text-lg font-medium">{health.message}</p>
          {health.details ? (
            <p className="mt-1 text-sm opacity-80">{health.details}</p>
          ) : null}
        </section>

        <section className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Ruta recomendada
              </p>
              <h2 className="text-2xl font-semibold">Checklist inicial</h2>
            </div>
            <Link
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Abrir Supabase
            </Link>
          </div>
          <ol className="space-y-4">
            {setupSteps.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-base font-semibold">{step.title}</p>
                  <p className="text-sm text-zinc-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Próximos pasos</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Una vez completada la configuración, continúa con la Iteración 1
            del plan: persistir perfiles/pacientes en Supabase y proteger las
            rutas según el rol. Consulta el documento funcional para el detalle
            completo.
          </p>
        </section>
      </main>
    </div>
  );
}
