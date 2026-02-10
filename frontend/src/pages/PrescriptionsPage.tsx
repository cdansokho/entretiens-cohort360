import { useState, useCallback, useEffect } from "react";
import { Plus, Pill } from "lucide-react";
import { usePrescriptions } from "@/hooks/useApi";
import PrescriptionFiltersBar from "@/components/PrescriptionFiltersBar";
import PrescriptionTable from "@/components/PrescriptionTable";
import CreatePrescriptionForm from "@/components/CreatePrescriptionForm";
import PrescriptionDetailModal from "@/components/PrescriptionDetailModal";
import Toast from "@/components/Toast";
import { DEFAULT_PAGE_SIZE, DEFAULT_PRESCRIPTION_FILTERS } from "@/constants";
import type { PrescriptionFilters, Prescription } from "@/types";

export default function PrescriptionsPage() {
  const [filters, setFilters] = useState<PrescriptionFilters>(DEFAULT_PRESCRIPTION_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  const {
    data: paginated,
    isLoading,
    isError,
    refetch,
  } = usePrescriptions(filters);

  const prescriptions = paginated?.results ?? [];
  const totalCount = paginated?.count ?? 0;
  const pageSize = filters.page_size ?? DEFAULT_PAGE_SIZE;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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

  const goToPage = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, Math.min(newPage, totalPages)) }));
  }, [totalPages]);

  const setPageSize = useCallback((newSize: number) => {
    setFilters((prev) => ({ ...prev, page_size: newSize, page: 1 }));
  }, []);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
      setToastMessage(message);
      setToastVariant(variant);
    },
    []
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
      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-white">
                <Pill size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text leading-tight">
                  Cohort360
                </h1>
                <p className="text-xs text-text-secondary">
                  Gestion des prescriptions
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              aria-label="Créer une nouvelle prescription (Ctrl+Shift+N)"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Plus size={16} />
              Nouvelle prescription
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs font-mono bg-white/20 rounded">
                ⌃⇧N
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Erreur de chargement */}
        {isError && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2 text-sm text-danger flex items-center justify-between gap-4">
            <span>
              Impossible de charger les prescriptions. Vérifiez votre connexion
              puis réessayez.
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md border border-danger/40 px-3 py-1 text-xs font-medium hover:bg-danger/10 transition cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Filters */}
        <PrescriptionFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
        />

        {/* Table */}
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
        />
      </main>

      {/* Modal création */}
      {showForm && (
        <CreatePrescriptionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => showToast("Prescription créée avec succès", "success")}
          onError={(message) => showToast(message, "error")}
        />
      )}

      {/* Modal détail */}
      {selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onSuccess={() => showToast("Prescription mise à jour", "success")}
        />
      )}

      {/* Toast */}
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
