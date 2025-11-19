 "use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { AppointmentFormState } from "./state";
import { appointmentInitialState } from "./state";

type PatientOption = {
  id: string;
  label: string;
};

type SillonOption = {
  id: string;
  description: string;
};

type AppointmentFormProps = {
  patients: PatientOption[];
  sillones: SillonOption[];
  defaultDate: string;
  defaultTime: string;
  action: (
    prevState: AppointmentFormState,
    formData: FormData
  ) => Promise<AppointmentFormState>;
};

const durationOptions = [30, 45, 60, 90];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Confirmar cita"}
    </button>
  );
}

export const AppointmentForm = ({
  patients,
  sillones,
  defaultDate,
  defaultTime,
  action,
}: AppointmentFormProps) => {
  const [state, formAction] = useFormState(action, appointmentInitialState);

  useEffect(() => {
    if (state.successMessage) {
      const form = document.getElementById(
        "appointment-form"
      ) as HTMLFormElement | null;
      form?.reset();
    }
  }, [state.successMessage]);

  const hasRequiredData = patients.length > 0 && sillones.length > 0;

  return (
    <form
      id="appointment-form"
      action={formAction}
      className="space-y-5 rounded-2xl border border-zinc-100 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="patient_id"
            className="block text-sm font-medium text-zinc-700"
          >
            Paciente *
          </label>
          <select
            id="patient_id"
            name="patient_id"
            required
            disabled={patients.length === 0}
            defaultValue=""
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {patients.length === 0
                ? "No hay pacientes registrados"
                : "Selecciona un paciente"}
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="sillon_id"
            className="block text-sm font-medium text-zinc-700"
          >
            Sillón *
          </label>
          <select
            id="sillon_id"
            name="sillon_id"
            required
            disabled={sillones.length === 0}
            defaultValue={sillones[0]?.id ?? ""}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed"
          >
            {sillones.length === 0 ? (
              <option value="" disabled>
                Sin sillones disponibles
              </option>
            ) : null}
            {sillones.map((sillon) => (
              <option key={sillon.id} value={sillon.id}>
                {sillon.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-zinc-700"
          >
            Fecha *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
        <div>
          <label
            htmlFor="start_time"
            className="block text-sm font-medium text-zinc-700"
          >
            Hora de inicio *
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            defaultValue={defaultTime}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-zinc-700"
          >
            Duración *
          </label>
          <select
            id="duration"
            name="duration"
            required
            defaultValue={durationOptions[2].toString()}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            {durationOptions.map((value) => (
              <option key={value} value={value}>
                {value} minutos
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="honorario_estimado"
            className="block text-sm font-medium text-zinc-700"
          >
            Honorario estimado
          </label>
          <input
            id="honorario_estimado"
            name="honorario_estimado"
            type="number"
            step="0.01"
            min="0"
            placeholder="Opcional"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="motivo_detalle"
          className="block text-sm font-medium text-zinc-700"
        >
          Motivo / notas
        </label>
        <textarea
          id="motivo_detalle"
          name="motivo_detalle"
          rows={3}
          placeholder="Describe el motivo de la consulta"
          className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {state.error}
        </p>
      ) : null}

      {state.successMessage ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {state.successMessage}
        </p>
      ) : null}

      <SubmitButton />

      {!hasRequiredData ? (
        <p className="text-xs text-amber-600">
          Para crear una cita necesitas al menos un paciente registrado y al
          menos un sillón asignado.
        </p>
      ) : null}
    </form>
  );
};

