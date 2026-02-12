import { useState, useCallback, useEffect } from "react";
import { usePrescriptions, useExportPrescriptions } from "@/hooks/useApi";
import PrescriptionFiltersBar from "@/components/PrescriptionFiltersBar";
import PrescriptionTable from "@/components/PrescriptionTable";
import CreatePrescriptionForm from "@/components/CreatePrescriptionForm";
import PrescriptionDetailModal from "@/components/PrescriptionDetailModal";
import PrescriptionsHeader from "@/components/PrescriptionsHeader";
import Toast from "@/components/Toast";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PRESCRIPTION_FILTERS,
  hasActiveFilters,
} from "@/constants";
import type { PrescriptionFilters, Prescription } from "@/types";

export default function PrescriptionsPage() {
  const [filters, setFilters] = useState<PrescriptionFilters>(DEFAULT_PRESCRIPTION_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  const { data: paginated, isLoading, isError, refetch } = usePrescriptions(filters);
  const showToast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
      setToastMessage(message);
      setToastVariant(variant);
    },
    []
  );
  const { exportCsv, exportExcel, isExporting } = useExportPrescriptions(filters, showToast);

  const prescriptions = paginated?.results ?? [];
  const totalCount = paginated?.count ?? 0;
  const pageSize = filters.page_size ?? DEFAULT_PAGE_SIZE;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_PRESCRIPTION_FILTERS });
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: PrescriptionFilters) => {
      setFilters((prev) => ({
        ...newFilters,
        page: newFilters.page ?? 1,
        page_size: newFilters.page_size ?? prev.page_size ?? DEFAULT_PAGE_SIZE,
      }));
    },
    []
  );

  const goToPage = useCallback(
    (newPage: number) => {
      setFilters((prev) => ({ ...prev, page: Math.max(1, Math.min(newPage, totalPages)) }));
    },
    [totalPages]
  );

  const setPageSize = useCallback((newSize: number) => {
    setFilters((prev) => ({ ...prev, page_size: newSize, page: 1 }));
  }, []);

  const handleImportSuccess = useCallback(
    (data: { created: number; errors: Array<{ row: number; message: string }> }) => {
      if (data.created > 0) refetch();
      if (data.errors.length > 0) {
        const msg =
          data.created > 0
            ? `${data.created} prescription(s) créée(s). ${data.errors.length} erreur(s) (lignes: ${data.errors.slice(0, 5).map((x) => x.row).join(", ")}${data.errors.length > 5 ? "…" : ""}).`
            : `Aucune prescription créée. ${data.errors.length} erreur(s).`;
        showToast(msg, data.created > 0 ? "success" : "error");
      } else {
        showToast(`${data.created} prescription(s) importée(s) avec succès`, "success");
      }
    },
    [showToast, refetch]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        setShowForm(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <PrescriptionsHeader
        onNewPrescription={() => setShowForm(true)}
        onExportCsv={exportCsv}
        onExportExcel={exportExcel}
        isExporting={isExporting}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {isError && (
          <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <span className="font-medium">
              Impossible de charger les prescriptions. Vérifiez que l'API est démarrée puis réessayez.
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border-2 border-danger/50 bg-card px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10 transition cursor-pointer shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}

        <PrescriptionFiltersBar filters={filters} onChange={handleFiltersChange} />

        <PrescriptionTable
          prescriptions={prescriptions}
          isLoading={isLoading}
          ordering={filters.ordering}
          onChangeOrdering={(ordering) =>
            setFilters((prev) => ({ ...prev, ordering, page: 1 }))
          }
          onSelectPrescription={setSelectedPrescription}
          pagination={{
            page,
            pageSize,
            totalCount,
            totalPages,
            onPageChange: goToPage,
            onPageSizeChange: setPageSize,
          }}
          hasActiveFilters={hasActiveFilters(filters)}
          onResetFilters={resetFilters}
          onCreateNew={() => setShowForm(true)}
        />
      </main>

      {showForm && (
        <CreatePrescriptionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => showToast("Prescription créée avec succès", "success")}
          onError={(message) => showToast(message, "error")}
          onImportSuccess={handleImportSuccess}
          onImportError={(message) => showToast(message, "error")}
        />
      )}

      {selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onSuccess={() => showToast("Prescription mise à jour", "success")}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant={toastVariant}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
