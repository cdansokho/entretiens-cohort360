import { useMemo } from "react";
import { Filter, X } from "lucide-react";
import { usePatients, useMedications } from "@/hooks/useApi";
import type { PrescriptionFilters } from "@/types";

interface Props {
  filters: PrescriptionFilters;
  onChange: (filters: PrescriptionFilters) => void;
}

export default function PrescriptionFiltersBar({ filters, onChange }: Props) {
  const { data: patients } = usePatients();
  const { data: medications } = useMedications();

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

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  const resetFilters = () =>
    onChange({
      patient: "",
      medication: "",
      status: "",
      start_date_gte: "",
      start_date_lte: "",
      end_date_gte: "",
      end_date_lte: "",
    });

  const selectClass =
    "rounded-lg border border-border bg-white px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";

  const inputClass =
    "rounded-lg border border-border bg-white px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text">
          <Filter size={16} className="text-primary" />
          Filtres
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition cursor-pointer"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Patient */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Patient
          </label>
          <select
            className={selectClass + " w-full"}
            value={filters.patient ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                patient: e.target.value ? Number(e.target.value) : "",
              })
            }
          >
            <option value="">Tous les patients</option>
            {sortedPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.last_name} {p.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Médicament */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Médicament
          </label>
          <select
            className={selectClass + " w-full"}
            value={filters.medication ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                medication: e.target.value ? Number(e.target.value) : "",
              })
            }
          >
            <option value="">Tous les médicaments</option>
            {sortedMedications.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Statut
          </label>
          <select
            className={selectClass + " w-full"}
            value={filters.status ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as PrescriptionFilters["status"],
              })
            }
          >
            <option value="">Tous les statuts</option>
            <option value="valide">Valide</option>
            <option value="en_attente">En attente</option>
            <option value="suppr">Supprimée</option>
          </select>
        </div>

        {/* Date début (intervalle) */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Date début (du)
          </label>
          <input
            type="date"
            className={inputClass + " w-full"}
            value={filters.start_date_gte ?? ""}
            onChange={(e) =>
              onChange({ ...filters, start_date_gte: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Date début (au)
          </label>
          <input
            type="date"
            className={inputClass + " w-full"}
            value={filters.start_date_lte ?? ""}
            onChange={(e) =>
              onChange({ ...filters, start_date_lte: e.target.value })
            }
          />
        </div>

        {/* Date fin (intervalle) */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Date fin (du)
          </label>
          <input
            type="date"
            className={inputClass + " w-full"}
            value={filters.end_date_gte ?? ""}
            onChange={(e) =>
              onChange({ ...filters, end_date_gte: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Date fin (au)
          </label>
          <input
            type="date"
            className={inputClass + " w-full"}
            value={filters.end_date_lte ?? ""}
            onChange={(e) =>
              onChange({ ...filters, end_date_lte: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
