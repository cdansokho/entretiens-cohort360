import type { PrescriptionPayload } from "@/types";

export const PRESCRIPTION_VALIDATION_MESSAGES = {
  patient_required: "Veuillez sélectionner un patient.",
  medication_required: "Veuillez sélectionner un médicament.",
  start_date_required: "La date de début est obligatoire.",
  end_date_required: "La date de fin est obligatoire.",
  end_date_after_start:
    "La date de fin doit être postérieure ou égale à la date de début.",
} as const;

/**
 * Validate prescription form data. Returns a record of field errors (empty if valid).
 */
export function validatePrescriptionForm(
  form: Partial<PrescriptionPayload>
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.patient_id) errors.patient_id = PRESCRIPTION_VALIDATION_MESSAGES.patient_required;
  if (!form.medication_id)
    errors.medication_id = PRESCRIPTION_VALIDATION_MESSAGES.medication_required;
  if (!form.start_date)
    errors.start_date = PRESCRIPTION_VALIDATION_MESSAGES.start_date_required;
  if (!form.end_date)
    errors.end_date = PRESCRIPTION_VALIDATION_MESSAGES.end_date_required;
  if (
    form.start_date &&
    form.end_date &&
    form.end_date < form.start_date
  ) {
    errors.end_date = PRESCRIPTION_VALIDATION_MESSAGES.end_date_after_start;
  }
  return errors;
}
