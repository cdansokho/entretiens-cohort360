import * as XLSX from "xlsx";
import type { Prescription } from "@/types";

const HEADERS = [
  "ID",
  "Patient (nom)",
  "Patient (prénom)",
  "Date naissance patient",
  "Médicament (code)",
  "Médicament (libellé)",
  "Date début",
  "Date fin",
  "Statut",
  "Commentaire",
];

/** Column headers for import (must match backend import_csv). */
const IMPORT_HEADERS = [
  "patient_id",
  "medication_id",
  "start_date",
  "end_date",
  "status",
  "comment",
];

/**
 * Build an Excel workbook from prescriptions and trigger download.
 */
export function downloadPrescriptionsAsExcel(
  prescriptions: Prescription[],
  filename: string
): void {
  const rows: (string | number)[][] = [HEADERS];
  for (const p of prescriptions) {
    rows.push([
      p.id,
      p.patient.last_name,
      p.patient.first_name,
      p.patient.birth_date ?? "",
      p.medication.code,
      p.medication.label,
      p.start_date,
      p.end_date,
      p.status,
      (p.comment ?? "").replace(/\r?\n/g, " "),
    ]);
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Prescriptions");
  XLSX.writeFile(wb, filename);
}

/**
 * Download Excel template for importing prescriptions.
 * One header row + one example row. Backend expects these column names.
 */
export function downloadImportTemplateExcel(filename: string = "modele_import_prescriptions.xlsx"): void {
  const rows: (string | number)[][] = [
    IMPORT_HEADERS,
    [1, 1, "2025-01-01", "2025-06-30", "en_attente", "Remplacer les IDs par ceux de votre base. Statuts : valide, en_attente, suppr."],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import");
  XLSX.writeFile(wb, filename);
}
