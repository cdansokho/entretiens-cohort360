import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionPayload,
  PrescriptionFilters,
  PaginatedPrescriptions,
} from "@/types";

/**
 * Axios instance for the Django backend.
 * In dev, Vite proxies /api → http://localhost:8000.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

/** Build query params from filters (omit empty/undefined). */
function buildQueryParams(filters?: PrescriptionFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (!filters) return params;
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params[key] = value;
  }
  return params;
}

// ─── Patients ────────────────────────────────────────────────────────────────

export async function fetchPatients(): Promise<Patient[]> {
  const { data } = await api.get<Patient[]>(ENDPOINTS.patients);
  return data;
}

// ─── Medications ─────────────────────────────────────────────────────────────

export async function fetchMedications(): Promise<Medication[]> {
  const { data } = await api.get<Medication[]>(ENDPOINTS.medications, {
    params: { status: "actif" },
  });
  return data;
}

// ─── Prescriptions ───────────────────────────────────────────────────────────

export async function fetchPrescriptions(
  filters?: PrescriptionFilters
): Promise<PaginatedPrescriptions> {
  const { data } = await api.get<PaginatedPrescriptions>(ENDPOINTS.prescriptions, {
    params: buildQueryParams(filters),
  });
  return data;
}

export async function fetchPrescription(id: number): Promise<Prescription> {
  const { data } = await api.get<Prescription>(ENDPOINTS.prescription(id));
  return data;
}

export async function createPrescription(
  payload: PrescriptionPayload
): Promise<Prescription> {
  const { data } = await api.post<Prescription>(ENDPOINTS.prescriptions, payload);
  return data;
}

export async function updatePrescription(
  id: number,
  payload: Partial<PrescriptionPayload>
): Promise<Prescription> {
  const { data } = await api.patch<Prescription>(ENDPOINTS.prescription(id), payload);
  return data;
}
