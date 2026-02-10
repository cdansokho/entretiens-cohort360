/** Représente un patient. */
export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  birth_date: string | null;
}

/** Représente un médicament. */
export interface Medication {
  id: number;
  code: string;
  label: string;
  status: "actif" | "suppr";
}

/** Statuts possibles d'une prescription. */
export type PrescriptionStatus = "valide" | "en_attente" | "suppr";

/** Représente une prescription (lecture). */
export interface Prescription {
  id: number;
  patient: Patient;
  medication: Medication;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment: string;
}

/** Payload pour créer / mettre à jour une prescription. */
export interface PrescriptionPayload {
  patient_id: number;
  medication_id: number;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment?: string;
}

/** Filtres disponibles pour les prescriptions. */
export interface PrescriptionFilters {
  patient?: number | "";
  medication?: number | "";
  status?: PrescriptionStatus | "";
  start_date_gte?: string;
  start_date_lte?: string;
  end_date_gte?: string;
  end_date_lte?: string;
  /**
   * Champ de tri côté backend (paramètre `ordering` de Django REST).
   * Exemples : "start_date", "-start_date", "end_date", "-end_date", "id", "-id".
   */
  ordering?: string;
  /** Numéro de page (1-based). */
  page?: number;
  /** Nombre d'éléments par page. */
  page_size?: number;
}

/** Réponse paginée des prescriptions (format Django REST). */
export interface PaginatedPrescriptions {
  count: number;
  next: string | null;
  previous: string | null;
  results: Prescription[];
}
