"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginInitialState, signInAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Autenticando..." : "Ingresar"}
    </button>
  );
}

export const LoginForm = () => {
  const [state, formAction] = useFormState(signInAction, loginInitialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-100"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="admin@consultorio.com"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-100"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          required
        />
      </div>

      {state?.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
};

