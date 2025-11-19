"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginFormState = {
  error: string | null;
};

const INITIAL_ERROR_STATE: LoginFormState = { error: null };

export const signInAction = async (
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error:
        "Supabase no está configurado. Revisa las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña para continuar." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
};

export const loginInitialState = INITIAL_ERROR_STATE;

