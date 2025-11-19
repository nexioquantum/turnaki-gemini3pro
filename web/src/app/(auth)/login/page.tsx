import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

const LoginPage = async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-10">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow">
          <h1 className="text-xl font-semibold">Configuración pendiente</h1>
          <p className="mt-2 text-sm">
            No encontramos las variables de entorno de Supabase. Revisa{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            y{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            en tu archivo <code>.env.local</code>.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-semibold underline decoration-dashed"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">
            KMDT Dental Studio
          </p>
          <h1 className="text-2xl font-semibold">Inicia sesión</h1>
          <p className="text-sm text-zinc-500">
            Usa las credenciales creadas en Supabase Auth.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-zinc-500">
          ¿No tienes cuenta? Solicita acceso al administrador.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

