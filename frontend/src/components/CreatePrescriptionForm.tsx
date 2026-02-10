import { useState, useRef, useEffect, type FormEvent } from "react";
import { Plus, X, Check, AlertCircle } from "lucide-react";
import { useSortedPatients, useSortedMedications } from "@/hooks/useSortedPatientsMedications";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useCreatePrescription } from "@/hooks/useApi";
import { validatePrescriptionForm, parseApiError } from "@/utils";
import {
  PRESCRIPTION_STATUS_OPTIONS,
  FORM_INPUT_BASE,
  FORM_INPUT_OK,
  FORM_INPUT_ERROR,
  MODAL_CLOSE_BUTTON,
  FORM_BUTTON_SECONDARY,
  FORM_BUTTON_PRIMARY,
} from "@/constants";
import type { PrescriptionPayload } from "@/types";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const INITIAL_FORM: PrescriptionPayload = {
  patient_id: 0,
  medication_id: 0,
  start_date: "",
  end_date: "",
  status: "en_attente",
  comment: "",
};

export default function CreatePrescriptionForm({ onClose, onSuccess, onError }: Props) {
  const createMutation = useCreatePrescription();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstSelectRef = useRef<HTMLSelectElement>(null);

  const [form, setForm] = useState<PrescriptionPayload>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedPatients = useSortedPatients();
  const sortedMedications = useSortedMedications();

  useEscapeKey(onClose);

  useEffect(() => {
    firstSelectRef.current?.focus();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const validate = (): boolean => {
    const errs = validatePrescriptionForm(form);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync(form);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const { fieldErrors, message } = parseApiError(err);
      setErrors(fieldErrors);
      onError?.(message);
    }
  };

  const inputCn = (hasError: boolean) =>
    `${FORM_INPUT_BASE} ${hasError ? FORM_INPUT_ERROR : FORM_INPUT_OK}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-prescription-title"
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="modal-panel w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="create-prescription-title"
            className="text-lg font-bold text-text flex items-center gap-2"
          >
            <Plus size={20} className="text-primary" />
            Nouvelle prescription
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className={MODAL_CLOSE_BUTTON}
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Patient <span className="text-danger">*</span>
            </label>
            <select
              ref={firstSelectRef}
              className={inputCn(!!errors.patient_id)}
              value={form.patient_id || ""}
              onChange={(e) =>
                setForm({ ...form, patient_id: Number(e.target.value) })
              }
              aria-invalid={!!errors.patient_id}
              aria-describedby={errors.patient_id ? "error-patient_id" : undefined}
            >
              <option value="">— Sélectionner un patient —</option>
              {sortedPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                  {p.birth_date ? ` (${p.birth_date})` : ""}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p
                id="error-patient_id"
                role="alert"
                className="mt-1 text-xs text-danger flex items-center gap-1"
              >
                <AlertCircle size={12} /> {errors.patient_id}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Médicament <span className="text-danger">*</span>
            </label>
            <select
              className={inputCn(!!errors.medication_id)}
              value={form.medication_id || ""}
              onChange={(e) =>
                setForm({ ...form, medication_id: Number(e.target.value) })
              }
            >
              <option value="">— Sélectionner un médicament —</option>
              {sortedMedications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.code})
                </option>
              ))}
            </select>
            {errors.medication_id && (
              <p className="mt-1 text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.medication_id}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Date de début <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={inputCn(!!errors.start_date)}
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-danger flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.start_date}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Date de fin <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={inputCn(!!errors.end_date)}
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
              />
              {errors.end_date && (
                <p className="mt-1 text-xs text-danger flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.end_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Statut
            </label>
            <select
              className={`${FORM_INPUT_BASE} ${FORM_INPUT_OK}`}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as PrescriptionPayload["status"],
                })
              }
            >
              {PRESCRIPTION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Commentaire{" "}
              <span className="text-text-secondary font-normal">(optionnel)</span>
            </label>
            <textarea
              className={`${FORM_INPUT_BASE} ${FORM_INPUT_OK} resize-none`}
              rows={3}
              placeholder="Informations complémentaires…"
              value={form.comment ?? ""}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={FORM_BUTTON_SECONDARY}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className={FORM_BUTTON_PRIMARY}
            >
              {createMutation.isPending ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              ) : (
                <Check size={16} />
              )}
              Créer la prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
