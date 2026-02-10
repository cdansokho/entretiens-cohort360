import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Prescription } from "@/types";

interface Props {
  prescriptions: Prescription[];
  isLoading: boolean;
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
}

export default function PrescriptionTable({
  prescriptions,
  isLoading,
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
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                #
              </th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                Patient
              </th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                Médicament
              </th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                Date début
              </th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                Date fin
              </th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                Statut
              </th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                Commentaire
              </th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx) => (
              <tr
                key={rx.id}
                className="border-b border-border/50 hover:bg-surface-hover transition-colors"
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

      <div className="border-t border-border bg-surface px-4 py-2 text-xs text-text-secondary">
        {prescriptions.length} prescription{prescriptions.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}
