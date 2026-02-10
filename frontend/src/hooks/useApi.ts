import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPatients,
  fetchMedications,
  fetchPrescriptions,
  fetchPrescription,
  createPrescription,
  updatePrescription,
} from "@/api/client";
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
