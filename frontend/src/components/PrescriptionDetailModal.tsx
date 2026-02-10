import { useState, useRef, useEffect, type FormEvent } from "react";
import { X, Pencil, Check, AlertCircle } from "lucide-react";
import { useSortedPatients, useSortedMedications } from "@/hooks/useSortedPatientsMedications";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useUpdatePrescription } from "@/hooks/useApi";
import { formatDate } from "@/utils/date";
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
import StatusBadge from "./StatusBadge";
import type { Prescription, PrescriptionPayload, PrescriptionStatus } from "@/types";

interface Props {
  prescription: Prescription;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PrescriptionDetailModal({
  prescription,
  onClose,
  onSuccess,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<PrescriptionPayload>>({
    patient_id: prescription.patient.id,
    medication_id: prescription.medication.id,
    start_date: prescription.start_date,
    end_date: prescription.end_date,
    status: prescription.status,
    comment: prescription.comment ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateMutation = useUpdatePrescription();
  const panelRef = useRef<HTMLDivElement>(null);

  const sortedPatients = useSortedPatients();
  const sortedMedications = useSortedMedications();

  useEscapeKey(onClose);

  useEffect(() => {
    setForm({
      patient_id: prescription.patient.id,
      medication_id: prescription.medication.id,
      start_date: prescription.start_date,
      end_date: prescription.end_date,
      status: prescription.status,
      comment: prescription.comment ?? "",
    });
  }, [prescription]);

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
      await updateMutation.mutateAsync({
        id: prescription.id,
        payload: {
          patient_id: form.patient_id,
          medication_id: form.medication_id,
          start_date: form.start_date,
          end_date: form.end_date,
          status: form.status,
          comment: form.comment,
        },
      });
      onSuccess?.();
      setEditing(false);
    } catch (err: unknown) {
      const { fieldErrors } = parseApiError(err);
      setErrors(fieldErrors);
    }
  };

  const inputCn = (hasError: boolean) =>
    `${FORM_INPUT_BASE} ${hasError ? FORM_INPUT_ERROR : FORM_INPUT_OK}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-prescription-title"
      ref={panelRef}
      onClick={handleBackdropClick}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="modal-panel w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <h2 id="detail-prescription-title" className="text-lg font-bold text-text">
            Prescription #{prescription.id}
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

        <div className="p-6 overflow-y-auto flex-1">
          {!editing ? (
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-text-secondary block text-xs font-medium mb-0.5">
                  Patient
                </span>
                <p className="font-medium text-text">
                  {prescription.patient.last_name} {prescription.patient.first_name}
                  {prescription.patient.birth_date && (
                    <span className="text-text-secondary font-normal ml-1">
                      — Né(e) le {formatDate(prescription.patient.birth_date)}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-text-secondary block text-xs font-medium mb-0.5">
                  Médicament
                </span>
                <p className="font-medium text-text">
                  {prescription.medication.label}
                  <span className="font-mono text-text-secondary ml-1">
                    ({prescription.medication.code})
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-text-secondary block text-xs font-medium mb-0.5">
                    Date début
                  </span>
                  <p>{formatDate(prescription.start_date)}</p>
                </div>
                <div>
                  <span className="text-text-secondary block text-xs font-medium mb-0.5">
                    Date fin
                  </span>
                  <p>{formatDate(prescription.end_date)}</p>
                </div>
              </div>
              <div>
                <span className="text-text-secondary block text-xs font-medium mb-0.5">
                  Statut
                </span>
                <StatusBadge status={prescription.status} />
              </div>
              {(prescription.comment ?? "").trim() && (
                <div>
                  <span className="text-text-secondary block text-xs font-medium mb-0.5">
                    Commentaire
                  </span>
                  <p className="text-text whitespace-pre-wrap">{prescription.comment}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover transition cursor-pointer"
              >
                <Pencil size={16} />
                Modifier
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Patient *
                </label>
                <select
                  className={inputCn(!!errors.patient_id)}
                  value={form.patient_id ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, patient_id: Number(e.target.value) })
                  }
                >
                  {sortedPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.last_name} {p.first_name}
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="mt-1 text-xs text-danger flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.patient_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Médicament *
                </label>
                <select
                  className={inputCn(!!errors.medication_id)}
                  value={form.medication_id ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, medication_id: Number(e.target.value) })
                  }
                >
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
                    Date début *
                  </label>
                  <input
                    type="date"
                    className={inputCn(!!errors.start_date)}
                    value={form.start_date ?? ""}
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
                    Date fin *
                  </label>
                  <input
                    type="date"
                    className={inputCn(!!errors.end_date)}
                    value={form.end_date ?? ""}
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
                  value={form.status ?? "en_attente"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as PrescriptionStatus,
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
                  Commentaire (optionnel)
                </label>
                <textarea
                  className={`${FORM_INPUT_BASE} ${FORM_INPUT_OK} resize-none`}
                  rows={3}
                  value={form.comment ?? ""}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={FORM_BUTTON_SECONDARY}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className={FORM_BUTTON_PRIMARY}
                >
                  {updateMutation.isPending ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <Check size={16} />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
