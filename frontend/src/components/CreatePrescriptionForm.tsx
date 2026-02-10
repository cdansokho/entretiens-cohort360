import { useState, useMemo, type FormEvent } from "react";
import { Plus, X, Check, AlertCircle } from "lucide-react";
import { usePatients, useMedications, useCreatePrescription } from "@/hooks/useApi";
import type { PrescriptionPayload, PrescriptionStatus } from "@/types";

interface Props {
  onClose: () => void;
}

const initialForm: PrescriptionPayload = {
  patient_id: 0,
  medication_id: 0,
  start_date: "",
  end_date: "",
  status: "en_attente",
  comment: "",
};

export default function CreatePrescriptionForm({ onClose }: Props) {
  const { data: patients } = usePatients();
  const { data: medications } = useMedications();
  const createMutation = useCreatePrescription();

  const [form, setForm] = useState<PrescriptionPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedPatients = useMemo(
    () =>
      [...(patients ?? [])].sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(
          `${b.last_name} ${b.first_name}`
        )
      ),
    [patients]
  );

  const sortedMedications = useMemo(
    () =>
      [...(medications ?? [])].sort((a, b) => a.label.localeCompare(b.label)),
    [medications]
  );

  /** Validation locale avant soumission. */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.patient_id) errs.patient_id = "Veuillez sélectionner un patient.";
    if (!form.medication_id)
      errs.medication_id = "Veuillez sélectionner un médicament.";
    if (!form.start_date) errs.start_date = "La date de début est obligatoire.";
    if (!form.end_date) errs.end_date = "La date de fin est obligatoire.";
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      errs.end_date =
        "La date de fin doit être postérieure ou égale à la date de début.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync(form);
      onClose();
    } catch (err: unknown) {
      // Erreurs serveur
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: Record<string, string[]> } }).response?.data
      ) {
        const serverErrors = (err as { response: { data: Record<string, string[]> } })
          .response.data;
        const mapped: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
        });
        setErrors(mapped);
      }
    }
  };

  const inputClass =
    "w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 outline-none transition";
  const inputOk = "border-border focus:border-primary focus:ring-primary";
  const inputErr = "border-danger focus:border-danger focus:ring-danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            Nouvelle prescription
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-surface-hover transition cursor-pointer"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Patient <span className="text-danger">*</span>
            </label>
            <select
              className={`${inputClass} ${errors.patient_id ? inputErr : inputOk}`}
              value={form.patient_id || ""}
              onChange={(e) =>
                setForm({ ...form, patient_id: Number(e.target.value) })
              }
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
              <p className="mt-1 text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.patient_id}
              </p>
            )}
          </div>

          {/* Médicament */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Médicament <span className="text-danger">*</span>
            </label>
            <select
              className={`${inputClass} ${errors.medication_id ? inputErr : inputOk}`}
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Date de début <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={`${inputClass} ${errors.start_date ? inputErr : inputOk}`}
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
                className={`${inputClass} ${errors.end_date ? inputErr : inputOk}`}
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

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Statut
            </label>
            <select
              className={`${inputClass} ${inputOk}`}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as PrescriptionStatus,
                })
              }
            >
              <option value="en_attente">En attente</option>
              <option value="valide">Valide</option>
              <option value="suppr">Supprimée</option>
            </select>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Commentaire{" "}
              <span className="text-text-secondary font-normal">(optionnel)</span>
            </label>
            <textarea
              className={`${inputClass} ${inputOk} resize-none`}
              rows={3}
              placeholder="Informations complémentaires…"
              value={form.comment ?? ""}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition disabled:opacity-50 cursor-pointer"
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
