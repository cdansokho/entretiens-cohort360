import { useMemo, useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useSortedPatients, useSortedMedications } from "@/hooks/useSortedPatientsMedications";
import {
  FILTER_KEYS_EXCLUDED_FROM_COUNT,
  FORM_SELECT_BASE,
  PRESCRIPTION_STATUS_OPTIONS,
} from "@/constants";
import type { PrescriptionFilters } from "@/types";

interface Props {
  filters: PrescriptionFilters;
  onChange: (filters: PrescriptionFilters) => void;
}

const inputClass =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";

export default function PrescriptionFiltersBar({ filters, onChange }: Props) {
  const sortedPatients = useSortedPatients();
  const sortedMedications = useSortedMedications();
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const activeFiltersCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) =>
          !FILTER_KEYS_EXCLUDED_FROM_COUNT.includes(key as (typeof FILTER_KEYS_EXCLUDED_FROM_COUNT)[number]) &&
          value !== undefined &&
          value !== ""
      ).length,
    [filters]
  );
  const hasActiveFilters = activeFiltersCount > 0;

  const withPageOne = (next: Partial<PrescriptionFilters>) =>
    onChange({ ...filters, ...next, page: 1 });

  const resetFilters = () =>
    onChange({
      ...filters,
      patient: "",
      medication: "",
      status: "",
      start_date_gte: "",
      start_date_lte: "",
      end_date_gte: "",
      end_date_lte: "",
      ordering: "",
      page: 1,
    });

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 gap-2">
        <button
          type="button"
          onClick={() => setFiltersExpanded((v) => !v)}
          className="flex sm:pointer-events-none items-center gap-2 text-sm font-semibold text-text cursor-pointer sm:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded"
          aria-expanded={filtersExpanded}
          aria-controls="filters-content"
          aria-label={filtersExpanded ? "Replier les filtres" : "Déplier les filtres"}
        >
          <Filter size={16} className="text-primary" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
          <span className="sm:hidden text-text-secondary">
            {filtersExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition cursor-pointer shrink-0"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      <div
        id="filters-content"
        className={`border-t border-border ${filtersExpanded ? "block" : "hidden sm:block"} p-4`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Patient
            </label>
            <select
              className={`${FORM_SELECT_BASE} w-full`}
              value={filters.patient ?? ""}
              onChange={(e) =>
                withPageOne({
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

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Médicament
            </label>
            <select
              className={`${FORM_SELECT_BASE} w-full`}
              value={filters.medication ?? ""}
              onChange={(e) =>
                withPageOne({
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

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Statut
            </label>
            <select
              className={`${FORM_SELECT_BASE} w-full`}
              value={filters.status ?? ""}
              onChange={(e) =>
                withPageOne({
                  status: e.target.value as PrescriptionFilters["status"],
                })
              }
            >
              <option value="">Tous les statuts</option>
              {PRESCRIPTION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/50 bg-gray-50 p-3">
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Période de début de prescription
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Du</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.start_date_gte ?? ""}
                  onChange={(e) => withPageOne({ start_date_gte: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Au</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.start_date_lte ?? ""}
                  onChange={(e) => withPageOne({ start_date_lte: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-gray-50 p-3">
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Période de fin de prescription
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Du</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.end_date_gte ?? ""}
                  onChange={(e) => withPageOne({ end_date_gte: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Au</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.end_date_lte ?? ""}
                  onChange={(e) => withPageOne({ end_date_lte: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
