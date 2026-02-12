import { useMemo, useState } from "react";
import { Filter, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useSortedPatients, useSortedMedications } from "@/hooks/useSortedPatientsMedications";
import { countActiveFilters, FORM_SELECT_BASE, PRESCRIPTION_STATUS_OPTIONS } from "@/constants";
import SearchableSelect from "./SearchableSelect";
import type { PrescriptionFilters } from "@/types";

interface Props {
  filters: PrescriptionFilters;
  onChange: (filters: PrescriptionFilters) => void;
}

const inputClass =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";

export default function PrescriptionFiltersBar({ filters, onChange }: Props) {
  const sortedPatients = useSortedPatients();
  const sortedMedications = useSortedMedications();
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const patientOptions = useMemo(
    () => [
      { value: 0, label: "Tous les patients" },
      ...sortedPatients.map((p) => ({
        value: p.id,
        label: `${p.last_name} ${p.first_name}`,
      })),
    ],
    [sortedPatients]
  );
  const medicationOptions = useMemo(
    () => [
      { value: 0, label: "Tous les médicaments" },
      ...sortedMedications.map((m) => ({
        value: m.id,
        label: m.label,
      })),
    ],
    [sortedMedications]
  );

  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);
  const hasActiveFilters = activeFiltersCount > 0;

  const withPageOne = (next: Partial<PrescriptionFilters>) =>
    onChange({ ...filters, ...next, page: 1 });

  const resetFilters = () =>
    onChange({
      ...filters,
      patient: "",
      medication: "",
      status: "",
      comment: "",
      start_date_gte: "",
      start_date_lte: "",
      end_date_gte: "",
      end_date_lte: "",
      ordering: "",
      page: 1,
    });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
        className={`grid transition-[grid-template-rows] duration-200 ease-out border-t border-border ${
          filtersExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } sm:grid-rows-[1fr]`}
        aria-hidden={!filtersExpanded}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-4">
        <div className="mb-4">
          <label htmlFor="filter-search" className="block text-xs font-medium text-text-secondary mb-1">
            Recherche
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" aria-hidden />
            <input
              id="filter-search"
              type="search"
              placeholder="Rechercher dans les commentaires…"
              value={filters.comment ?? ""}
              onChange={(e) => withPageOne({ comment: e.target.value || "" })}
              className={`${inputClass} w-full pl-10 pr-3`}
              aria-label="Rechercher dans les commentaires des prescriptions"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <SearchableSelect
              id="filter-patient"
              label="Patient"
              placeholder="Rechercher un patient…"
              options={patientOptions}
              value={filters.patient === "" || filters.patient === undefined ? 0 : Number(filters.patient)}
              onChange={(v) => withPageOne({ patient: v === 0 ? "" : v })}
            />
          </div>

          <div>
            <SearchableSelect
              id="filter-medication"
              label="Médicament"
              placeholder="Rechercher un médicament…"
              options={medicationOptions}
              value={filters.medication === "" || filters.medication === undefined ? 0 : Number(filters.medication)}
              onChange={(v) => withPageOne({ medication: v === 0 ? "" : v })}
            />
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
          <div className="rounded-lg border border-border/50 bg-surface-hover p-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Période de début de prescription
            </label>
            <p className="text-[11px] text-text-secondary mb-2" role="note">
              Afficher les prescriptions dont la <strong>date de début</strong> est comprise entre ces deux dates.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Du</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.start_date_gte ?? ""}
                  max={filters.start_date_lte ?? undefined}
                  onChange={(e) => {
                    const gte = e.target.value;
                    const lte =
                      filters.start_date_lte && gte > filters.start_date_lte ? gte : filters.start_date_lte;
                    withPageOne({ start_date_gte: gte, start_date_lte: lte ?? "" });
                  }}
                  title="Date de début minimum"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Au</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.start_date_lte ?? ""}
                  min={filters.start_date_gte ?? undefined}
                  onChange={(e) => withPageOne({ start_date_lte: e.target.value })}
                  title="Date de début maximum (≥ Du)"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-surface-hover p-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Période de fin de prescription
            </label>
            <p className="text-[11px] text-text-secondary mb-2" role="note">
              Afficher les prescriptions dont la <strong>date de fin</strong> est comprise entre ces deux dates.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Du</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.end_date_gte ?? ""}
                  max={filters.end_date_lte ?? undefined}
                  onChange={(e) => {
                    const gte = e.target.value;
                    const lte =
                      filters.end_date_lte && gte > filters.end_date_lte ? gte : filters.end_date_lte;
                    withPageOne({ end_date_gte: gte, end_date_lte: lte ?? "" });
                  }}
                  title="Date de fin minimum"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Au</label>
                <input
                  type="date"
                  className={`${inputClass} w-full`}
                  value={filters.end_date_lte ?? ""}
                  min={filters.end_date_gte ?? undefined}
                  onChange={(e) => withPageOne({ end_date_lte: e.target.value })}
                  title="Date de fin maximum (≥ Du)"
                />
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
