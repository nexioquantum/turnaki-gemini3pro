"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { PatientFormState } from "./actions";

type Props = {
  action: (
    prevState: PatientFormState,
    data: FormData
  ) => Promise<PatientFormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar paciente"}
    </button>
  );
}

export const PatientForm = ({ action }: Props) => {
  const [state, formAction] = useFormState(action, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById("patient-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state.success]);

  return (
    <form id="patient-form" action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Nombres *
          </label>
          <input
            name="first_name"
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Apellidos *
          </label>
          <input
            name="last_name"
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Cédula (CI)
          </label>
          <input
            name="ci"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Fecha de nacimiento
          </label>
          <input
            name="date_of_birth"
            type="date"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Teléfono *
          </label>
          <input
            name="phone"
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Correo electrónico
          </label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Dirección
          </label>
          <input
            name="address"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Contacto de emergencia
          </label>
          <input
            name="emergency_contact_name"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Teléfono de emergencia
          </label>
          <input
            name="emergency_contact_phone"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Alergias
        </label>
        <textarea
          name="allergies"
          rows={2}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Observaciones
        </label>
        <textarea
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Paciente registrado correctamente.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
};

