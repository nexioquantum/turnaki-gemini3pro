export type PatientFormState = {
  error: string | null;
  success: boolean;
};

export const patientInitialState: PatientFormState = {
  error: null,
  success: false,
};

