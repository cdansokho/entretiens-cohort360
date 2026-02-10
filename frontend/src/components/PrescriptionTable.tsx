import { FileText, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
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
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-12 text-center text-text-secondary">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-3 text-sm">Chargement des prescriptions…</p>
        </div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-12 text-center text-text-secondary">
          <FileText size={40} className="mx-auto mb-3 text-border" />
          <p className="text-sm font-medium">Aucune prescription trouvée</p>
          <p className="text-xs mt-1">
            Essayez de modifier vos filtres ou créez une nouvelle prescription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-white shadow-sm overflow-hidden"
      role="region"
      aria-label="Liste des prescriptions"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          <thead>
            <tr className="border-b border-border bg-surface">
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
                className={`border-b border-border/50 transition-colors ${
                  onSelectPrescription
                    ? "cursor-pointer hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
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

      <div className="border-t border-border bg-surface px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
        <span>
          {pagination
            ? pagination.totalCount === 0
              ? "0 prescription"
              : `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalCount
                )} sur ${pagination.totalCount} prescription${pagination.totalCount !== 1 ? "s" : ""}`
            : `${prescriptions.length} prescription${prescriptions.length > 1 ? "s" : ""}`}
        </span>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5">
              <span>Afficher</span>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  pagination.onPageSizeChange(Number(e.target.value))
                }
                className="rounded border border-border bg-white px-2 py-1 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                aria-label="Nombre par page"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Page précédente"
                className="rounded p-1.5 hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[6rem] text-center">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Page suivante"
                className="rounded p-1.5 hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
