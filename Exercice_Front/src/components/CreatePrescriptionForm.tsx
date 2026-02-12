import { useState, useRef, useCallback, useMemo, type FormEvent } from "react";
import { Plus, X, Check, AlertCircle, Upload } from "lucide-react";
import { useSortedPatients, useSortedMedications } from "@/hooks/useSortedPatientsMedications";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useCreatePrescription, useImportPrescriptions } from "@/hooks/useApi";
import { validatePrescriptionForm, parseApiError } from "@/utils";
import { downloadCsv, IMPORT_CSV_TEMPLATE } from "@/utils/exportCsv";
import { downloadImportTemplateExcel } from "@/utils/exportExcel";
import {
  PRESCRIPTION_STATUS_OPTIONS,
  FORM_INPUT_BASE,
  FORM_INPUT_OK,
  FORM_INPUT_ERROR,
  FORM_BUTTON_SECONDARY,
  FORM_BUTTON_PRIMARY,
  MODAL_CLOSE_BUTTON,
} from "@/constants";
import SearchableSelect from "./SearchableSelect";
import type { PrescriptionPayload } from "@/types";
import type { ImportPrescriptionsResponse } from "@/api/client";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onImportSuccess?: (data: ImportPrescriptionsResponse) => void;
  onImportError?: (message: string) => void;
}

const INITIAL_FORM: PrescriptionPayload = {
  patient_id: 0,
  medication_id: 0,
  start_date: "",
  end_date: "",
  status: "en_attente",
  comment: "",
};

export default function CreatePrescriptionForm({
  onClose,
  onSuccess,
  onError,
  onImportSuccess,
  onImportError,
}: Props) {
  const createMutation = useCreatePrescription();
  const importMutation = useImportPrescriptions();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PrescriptionPayload>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedPatients = useSortedPatients();
  const sortedMedications = useSortedMedications();

  const patientOptions = useMemo(
    () =>
      sortedPatients.map((p) => ({
        value: p.id,
        label: `${p.last_name} ${p.first_name}${p.birth_date ? ` (${p.birth_date})` : ""}`,
      })),
    [sortedPatients]
  );
  const medicationOptions = useMemo(
    () =>
      sortedMedications.map((m) => ({
        value: m.id,
        label: `${m.label} (${m.code})`,
      })),
    [sortedMedications]
  );

  useEscapeKey(onClose);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      importMutation.mutate(file, {
        onSuccess: (data) => onImportSuccess?.(data),
        onError: () => {
          onImportError?.("Erreur lors de l'import. Vérifiez le format du fichier et l'API.");
        },
      });
    },
    [importMutation, onImportSuccess, onImportError]
  );

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
      <div className="modal-panel w-full max-w-lg rounded-2xl bg-card shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] mx-4 border border-border/50">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface/50">
          <h2
            id="create-prescription-title"
            className="text-lg font-bold text-text flex items-center gap-2"
          >
            <Plus size={20} className="text-primary" strokeWidth={2.5} />
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

        {/* Import depuis fichier */}
        <div className="border-b border-border px-6 py-4 bg-surface/30">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            aria-hidden
            onChange={handleImportFile}
          />
          <p className="text-sm font-semibold text-text-secondary mb-2">Importer depuis un fichier</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={importMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover disabled:opacity-50 transition cursor-pointer"
            >
              <Upload size={16} />
              {importMutation.isPending ? "Import en cours…" : "Choisir un fichier CSV ou Excel"}
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(IMPORT_CSV_TEMPLATE, "modele_import_prescriptions.csv")}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Modèle CSV
            </button>
            <button
              type="button"
              onClick={() => downloadImportTemplateExcel()}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Modèle Excel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <fieldset className="space-y-5 border-0 p-0 m-0">
            <legend className="sr-only">Patient et médicament</legend>
          <div>
            <SearchableSelect
              id="create-prescription-patient"
              label={
                <>
                  Patient <span className="text-danger">*</span>
                </>
              }
              placeholder="Rechercher un patient par nom, prénom…"
              options={patientOptions}
              value={form.patient_id}
              onChange={(v) => setForm({ ...form, patient_id: v })}
              error={!!errors.patient_id}
              aria-describedby={errors.patient_id ? "error-patient_id" : undefined}
              aria-invalid={!!errors.patient_id}
              inputRef={firstInputRef}
            />
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
            <SearchableSelect
              id="create-prescription-medication"
              label={
                <>
                  Médicament <span className="text-danger">*</span>
                </>
              }
              placeholder="Rechercher un médicament par nom ou code…"
              options={medicationOptions}
              value={form.medication_id}
              onChange={(v) => setForm({ ...form, medication_id: v })}
              error={!!errors.medication_id}
              aria-describedby={errors.medication_id ? "error-medication_id" : undefined}
              aria-invalid={!!errors.medication_id}
            />
            {errors.medication_id && (
              <p id="error-medication_id" role="alert" className="mt-1 text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.medication_id}
              </p>
            )}
          </div>
          </fieldset>

          <fieldset className="space-y-5 border-0 p-0 m-0">
            <legend className="text-sm font-semibold text-text-secondary mb-2">Période et statut</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Date de début <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={inputCn(!!errors.start_date)}
                value={form.start_date}
                max={form.end_date || undefined}
                onChange={(e) => {
                  const start = e.target.value;
                  const end = form.end_date && start > form.end_date ? start : form.end_date;
                  setForm({ ...form, start_date: start, end_date: end ?? "" });
                }}
                title={form.end_date ? "Ne peut pas être après la date de fin" : undefined}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-danger flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.start_date}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Date de fin <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={inputCn(!!errors.end_date)}
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(e) => {
                  const end = e.target.value;
                  setForm({ ...form, end_date: end });
                }}
                title={form.start_date ? "Ne peut pas être avant la date de début" : undefined}
              />
              {errors.end_date && (
                <p className="mt-1 text-xs text-danger flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.end_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
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
          </fieldset>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text mb-2">
              Commentaire
            </label>
            <textarea
              className={`${FORM_INPUT_BASE} ${FORM_INPUT_OK} resize-none`}
              rows={3}
              placeholder="Informations complémentaires…"
              value={form.comment ?? ""}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
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
