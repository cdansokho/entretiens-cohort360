import { FileText, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatDate } from "@/utils/date";
import { PAGE_SIZE_OPTIONS } from "@/constants";
import StatusBadge from "./StatusBadge";
import type { Prescription } from "@/types";

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface Props {
  prescriptions: Prescription[];
  isLoading: boolean;
  ordering?: string;
  onChangeOrdering?: (ordering: string) => void;
  onSelectPrescription?: (prescription: Prescription) => void;
  pagination?: PaginationProps;
  /** When true, empty state shows "Réinitialiser les filtres" */
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onCreateNew?: () => void;
}

function getNextOrdering(field: string, current?: string): string {
  if (current === field) return `-${field}`;
  if (current === `-${field}`) return "";
  return field;
}

function OrderingIcon({ field, current }: { field: string; current?: string }) {
  if (current === field) {
    return <ArrowUp size={14} className="inline-block ml-1" aria-hidden="true" />;
  }
  if (current === `-${field}`) {
    return (
      <ArrowDown size={14} className="inline-block ml-1" aria-hidden="true" />
    );
  }
  return (
    <ArrowUpDown size={14} className="inline-block ml-1" aria-hidden="true" />
  );
}

export default function PrescriptionTable({
  prescriptions,
  isLoading,
  ordering,
  onChangeOrdering,
  onSelectPrescription,
  pagination,
  hasActiveFilters,
  onResetFilters,
  onCreateNew,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden" role="status" aria-label="Chargement">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <div className="h-4 w-24 rounded bg-border/60 animate-skeleton" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <tr key={row} className="border-b border-border/50">
                  {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                    <td key={cell} className="px-4 py-3">
                      <div className="h-4 rounded bg-surface-hover animate-skeleton max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border bg-surface px-4 py-3 flex justify-between items-center">
          <div className="h-4 w-32 rounded bg-border/60 animate-skeleton" />
          <div className="h-8 w-24 rounded bg-border/60 animate-skeleton" />
        </div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-12 sm:p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-hover text-border mb-4" aria-hidden>
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <p className="text-base font-semibold text-text">
            {hasActiveFilters ? "Aucune prescription ne correspond à vos critères" : "Aucune prescription pour le moment"}
          </p>
          <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Réinitialisez les filtres pour voir toutes les prescriptions, ou créez une nouvelle prescription."
              : "Créez une prescription pour commencer."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="rounded-lg border-2 border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover transition cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
            {onCreateNew && (
              <button
                type="button"
                onClick={onCreateNew}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition cursor-pointer"
              >
                Nouvelle prescription
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
      role="region"
      aria-label="Liste des prescriptions"
    >
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-sm" role="grid">
          <thead className="sticky top-0 z-10 bg-surface border-b border-border shadow-[0_1px_0_0_var(--color-border)]">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                <button
                  type="button"
                  onClick={() =>
                    onChangeOrdering?.(getNextOrdering("id", ordering))
                  }
                  className="inline-flex items-center gap-1 hover:text-text cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  aria-label="Trier par identifiant"
                >
                  #
                  <OrderingIcon field="id" current={ordering} />
                </button>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                Patient
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                Médicament
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                <button
                  type="button"
                  onClick={() =>
                    onChangeOrdering?.(getNextOrdering("start_date", ordering))
                  }
                  className="inline-flex items-center gap-1 hover:text-text cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  aria-label="Trier par date de début"
                >
                  Date début
                  <OrderingIcon field="start_date" current={ordering} />
                </button>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                <button
                  type="button"
                  onClick={() =>
                    onChangeOrdering?.(getNextOrdering("end_date", ordering))
                  }
                  className="inline-flex items-center gap-1 hover:text-text cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  aria-label="Trier par date de fin"
                >
                  Date fin
                  <OrderingIcon field="end_date" current={ordering} />
                </button>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                <button
                  type="button"
                  onClick={() =>
                    onChangeOrdering?.(getNextOrdering("status", ordering))
                  }
                  className="inline-flex items-center gap-1 hover:text-text cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  aria-label="Trier par statut"
                >
                  Statut
                  <OrderingIcon field="status" current={ordering} />
                </button>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-text-secondary"
                scope="col"
              >
                Commentaire
              </th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx) => (
              <tr
                key={rx.id}
                role={onSelectPrescription ? "button" : undefined}
                tabIndex={onSelectPrescription ? 0 : undefined}
                onClick={() => onSelectPrescription?.(rx)}
                onKeyDown={(e) => {
                  if (onSelectPrescription && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelectPrescription(rx);
                  }
                }}
                className={`border-b border-border/50 transition-colors duration-150 ${
                  onSelectPrescription
                    ? "cursor-pointer hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset active:bg-surface"
                    : ""
                }`}
              >
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {rx.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-text">
                    {rx.patient.last_name} {rx.patient.first_name}
                  </div>
                  {rx.patient.birth_date && (
                    <div className="text-xs text-text-secondary">
                      Né(e) le {formatDate(rx.patient.birth_date)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-text">
                    {rx.medication.label}
                  </div>
                  <div className="text-xs text-text-secondary font-mono">
                    {rx.medication.code}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(rx.start_date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(rx.end_date)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={rx.status} />
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs max-w-[200px] truncate">
                  {rx.comment || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
        <span className="font-medium text-text">
          {pagination
            ? pagination.totalCount === 0
              ? "0 prescription"
              : `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalCount
                )} sur ${pagination.totalCount}`
            : `${prescriptions.length} prescription${prescriptions.length > 1 ? "s" : ""}`}
        </span>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-text-secondary">Afficher</span>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  pagination.onPageSizeChange(Number(e.target.value))
                }
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                aria-label="Nombre par page"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
              <button
                type="button"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page <= 1}
                aria-label="Première page"
                className="rounded-md p-2 hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Page précédente"
                className="rounded-md p-2 hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[5rem] text-center text-sm font-medium text-text px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Page suivante"
                className="rounded-md p-2 hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Dernière page"
                className="rounded-md p-2 hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
