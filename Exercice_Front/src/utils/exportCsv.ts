import type { Prescription } from "@/types";

const CSV_SEP = ";";
const CSV_QUOTE = '"';

function escapeCsvCell(value: string): string {
  if (value.includes(CSV_SEP) || value.includes(CSV_QUOTE) || value.includes("\n")) {
    return `${CSV_QUOTE}${value.replace(/"/g, '""')}${CSV_QUOTE}`;
  }
  return value;
}

/**
 * Build CSV content from prescriptions (French locale: semicolon separator).
 */
export function prescriptionsToCsv(prescriptions: Prescription[]): string {
  const header = [
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
  ].join(CSV_SEP);

  const rows = prescriptions.map((p) =>
    [
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
    ]
      .map(String)
      .map(escapeCsvCell)
      .join(CSV_SEP)
  );

  return [header, ...rows].join("\n");
}

/**
 * Trigger download of a string as a file (UTF-8 with BOM for Excel).
 */
export function downloadCsv(content: string, filename: string): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Template CSV for import (semicolon-separated, UTF-8).
 * Columns: patient_id, medication_id, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), status (valide|en_attente|suppr), comment (optional).
 */
export const IMPORT_CSV_TEMPLATE = [
  "patient_id;medication_id;start_date;end_date;status;comment",
  "1;1;2025-01-01;2025-06-30;en_attente;Remplacer les IDs par ceux de votre base. Statuts possibles : valide, en_attente, suppr.",
].join("\n");
