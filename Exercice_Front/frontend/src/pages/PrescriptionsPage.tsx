import { useState, useCallback } from "react";
import { Plus, Pill } from "lucide-react";
import { usePrescriptions } from "@/hooks/useApi";
import PrescriptionFiltersBar from "@/components/PrescriptionFiltersBar";
import PrescriptionTable from "@/components/PrescriptionTable";
import CreatePrescriptionForm from "@/components/CreatePrescriptionForm";
import type { PrescriptionFilters } from "@/types";

const emptyFilters: PrescriptionFilters = {
  patient: "",
  medication: "",
  status: "",
  start_date_gte: "",
  start_date_lte: "",
  end_date_gte: "",
  end_date_lte: "",
};

export default function PrescriptionsPage() {
  const [filters, setFilters] = useState<PrescriptionFilters>(emptyFilters);
  const [showForm, setShowForm] = useState(false);

  const { data: prescriptions, isLoading } = usePrescriptions(filters);

  const handleFiltersChange = useCallback(
    (newFilters: PrescriptionFilters) => setFilters(newFilters),
    []
  );

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
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              Nouvelle prescription
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Filters */}
        <PrescriptionFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
        />

        {/* Table */}
        <PrescriptionTable
          prescriptions={prescriptions ?? []}
          isLoading={isLoading}
        />
      </main>

      {/* Modal */}
      {showForm && (
        <CreatePrescriptionForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
