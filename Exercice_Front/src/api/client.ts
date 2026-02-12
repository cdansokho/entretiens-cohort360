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

/** Response from POST /Prescription/import */
export interface ImportPrescriptionsResponse {
  created: number;
  errors: Array<{ row: number; message: string }>;
}

/**
 * Axios instance for the Django backend.
 * In dev, Vite proxies /api → http://localhost:8000.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

/** Health check (backend /health via proxy /api/health). */
export async function fetchHealth(): Promise<{ status: string; version?: string }> {
  const { data } = await api.get<{ status: string; version?: string }>("health");
  return data;
}

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

/** Import prescriptions from a CSV file. */
export async function importPrescriptionsFromCsv(
  file: File
): Promise<ImportPrescriptionsResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportPrescriptionsResponse>(
    ENDPOINTS.prescriptionsImport,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

/** Fetch all prescriptions for export (paginates until all results). */
export async function fetchAllPrescriptionsForExport(
  filters: PrescriptionFilters,
  pageSize: number = 100
): Promise<Prescription[]> {
  const all: Prescription[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const { data } = await api.get<PaginatedPrescriptions>(ENDPOINTS.prescriptions, {
      params: buildQueryParams({ ...filters, page, page_size: pageSize }),
    });
    all.push(...data.results);
    hasMore = data.next != null && data.results.length === pageSize;
    page += 1;
  }
  return all;
}
