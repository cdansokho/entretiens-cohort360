import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPatients,
  fetchMedications,
  fetchPrescriptions,
  fetchPrescription,
  createPrescription,
  updatePrescription,
  fetchHealth,
  importPrescriptionsFromCsv,
  fetchAllPrescriptionsForExport,
} from "@/api/client";
import { prescriptionsToCsv, downloadCsv } from "@/utils/exportCsv";
import { downloadPrescriptionsAsExcel } from "@/utils/exportExcel";
import type { PrescriptionPayload, PrescriptionFilters } from "@/types";

// ─── Query Keys (centralisées pour la cohérence du cache) ────────────────────

export const queryKeys = {
  patients: ["patients"] as const,
  medications: ["medications"] as const,
  prescriptions: (filters?: PrescriptionFilters) =>
    ["prescriptions", filters ?? {}] as const,
  prescription: (id: number) => ["prescription", id] as const,
};

// ─── Hooks de lecture ────────────────────────────────────────────────────────

export const usePatients = () =>
  useQuery({
    queryKey: queryKeys.patients,
    queryFn: fetchPatients,
    staleTime: 5 * 60 * 1000, // 5 min – les patients changent rarement
  });

export const useMedications = () =>
  useQuery({
    queryKey: queryKeys.medications,
    queryFn: fetchMedications,
    staleTime: 5 * 60 * 1000,
  });

export const usePrescriptions = (filters?: PrescriptionFilters) =>
  useQuery({
    queryKey: queryKeys.prescriptions(filters),
    queryFn: () => fetchPrescriptions(filters),
  });

export const usePrescription = (id: number | null) =>
  useQuery({
    queryKey: queryKeys.prescription(id ?? 0),
    queryFn: () => fetchPrescription(id!),
    enabled: id != null && id > 0,
  });

/** Health check for API status indicator (refetch every 30s). */
export const useApiHealth = () =>
  useQuery({
    queryKey: ["apiHealth"] as const,
    queryFn: fetchHealth,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  });

// ─── Hooks de mutation ───────────────────────────────────────────────────────

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PrescriptionPayload) => createPrescription(payload),
    onSuccess: () => {
      // Invalider le cache pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PrescriptionPayload> }) =>
      updatePrescription(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

export const useImportPrescriptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importPrescriptionsFromCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

const EXPORT_PAGE_SIZE = 100;

/** Export prescriptions to CSV or Excel. Handles loading state and toasts. */
export function useExportPrescriptions(
  filters: PrescriptionFilters,
  showToast: (message: string, variant?: "success" | "error") => void
) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const list = await fetchAllPrescriptionsForExport(
        { ...filters, page: 1, page_size: EXPORT_PAGE_SIZE },
        EXPORT_PAGE_SIZE
      );
      const csv = prescriptionsToCsv(list);
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `prescriptions_${date}.csv`);
      showToast(`${list.length} prescription(s) exportée(s)`, "success");
    } catch {
      showToast("Erreur lors de l'export. Vérifiez la connexion à l'API.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [filters, showToast]);

  const exportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const list = await fetchAllPrescriptionsForExport(
        { ...filters, page: 1, page_size: EXPORT_PAGE_SIZE },
        EXPORT_PAGE_SIZE
      );
      const date = new Date().toISOString().slice(0, 10);
      downloadPrescriptionsAsExcel(list, `prescriptions_${date}.xlsx`);
      showToast(`${list.length} prescription(s) exportée(s)`, "success");
    } catch {
      showToast("Erreur lors de l'export. Vérifiez la connexion à l'API.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [filters, showToast]);

  return { exportCsv, exportExcel, isExporting };
}
