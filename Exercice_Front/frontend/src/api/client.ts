import axios from "axios";
import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionPayload,
  PrescriptionFilters,
} from "@/types";

/**
 * Client Axios configuré pour communiquer avec le backend Django.
 * En développement, Vite proxy /api → http://localhost:8000.
 */
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Patients ────────────────────────────────────────────────────────────────

export const fetchPatients = async (): Promise<Patient[]> => {
  const { data } = await api.get<Patient[]>("/Patient");
  return data;
};

// ─── Medications ─────────────────────────────────────────────────────────────

export const fetchMedications = async (): Promise<Medication[]> => {
  const { data } = await api.get<Medication[]>("/Medication", {
    params: { status: "actif" },
  });
  return data;
};

// ─── Prescriptions ───────────────────────────────────────────────────────────

/** Récupérer la liste des prescriptions avec filtres optionnels. */
export const fetchPrescriptions = async (
  filters?: PrescriptionFilters
): Promise<Prescription[]> => {
  // Nettoyer les filtres vides pour ne pas envoyer de paramètres inutiles
  const params: Record<string, string | number> = {};
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params[key] = value;
      }
    });
  }
  const { data } = await api.get<Prescription[]>("/Prescription", { params });
  return data;
};

/** Créer une nouvelle prescription. */
export const createPrescription = async (
  payload: PrescriptionPayload
): Promise<Prescription> => {
  const { data } = await api.post<Prescription>("/Prescription", payload);
  return data;
};

/** Mettre à jour une prescription existante (partiel). */
export const updatePrescription = async (
  id: number,
  payload: Partial<PrescriptionPayload>
): Promise<Prescription> => {
  const { data } = await api.patch<Prescription>(`/Prescription/${id}`, payload);
  return data;
};
