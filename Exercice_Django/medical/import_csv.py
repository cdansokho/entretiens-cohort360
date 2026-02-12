"""
Import prescriptions from a CSV or Excel (.xlsx) file.

CSV: semicolon-separated, UTF-8. Header row required.
Excel: first sheet, first row = header.

Columns: patient_id, medication_id, start_date, end_date, status, comment (optional).
Status: valide, en_attente, suppr
"""
import csv
import io
from typing import Any

from django.db import transaction

from .models import Patient, Medication, Prescription


def parse_xlsx_content(content: bytes) -> list[dict[str, Any]]:
    """Parse Excel bytes (first sheet) into list of dicts. First row = header."""
    try:
        import openpyxl
    except ImportError:
        raise ValueError("openpyxl est requis pour l'import Excel. Installez-le avec: pip install openpyxl")
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    sheet = wb.active
    if not sheet:
        return []
    rows_iter = sheet.iter_rows(values_only=True)
    header = next(rows_iter, None)
    if not header:
        return []
    header = [str(h).strip() if h is not None else "" for h in header]
    result = []
    for row in rows_iter:
        if not any(c is not None and str(c).strip() for c in row):
            continue
        result.append(dict(zip(header, (v if v is not None else "" for v in row))))
    return result


def parse_csv_content(content: bytes) -> list[dict[str, Any]]:
    """Parse CSV bytes (UTF-8, optional BOM) into list of dicts. First row = header."""
    text = content.decode("utf-8-sig").strip()
    if not text:
        return []
    reader = csv.DictReader(io.StringIO(text), delimiter=";")
    return list(reader)


def parse_uploaded_file(content: bytes, filename: str) -> list[dict[str, Any]]:
    """Parse uploaded file (CSV or XLSX) into list of dicts. Raises ValueError if format unknown."""
    name_lower = filename.lower()
    if name_lower.endswith(".csv"):
        return parse_csv_content(content)
    if name_lower.endswith(".xlsx") or name_lower.endswith(".xls"):
        return parse_xlsx_content(content)
    raise ValueError("Format non supporté. Utilisez un fichier .csv ou .xlsx.")


def normalize_header(name: str) -> str:
    """Normalize CSV header to lowercase with underscores."""
    return name.strip().lower().replace(" ", "_").replace("(", "").replace(")", "")


def import_prescriptions_from_rows(rows: list[dict[str, Any]]) -> tuple[int, list[dict[str, Any]]]:
    """
    Create prescriptions from parsed rows. Returns (created_count, errors).
    Each error is {"row": 1-based index, "message": "..."}.
    """
    created = 0
    errors: list[dict[str, Any]] = []
    status_values = {"valide", "en_attente", "suppr"}

    for i, row in enumerate(rows):
        row_num = i + 2  # 1-based, +1 for header
        normalized = {normalize_header(k): v for k, v in row.items() if k}

        patient_id = normalized.get("patient_id") or normalized.get("id_patient")
        medication_id = normalized.get("medication_id") or normalized.get("id_medicament")
        _start = normalized.get("start_date") or normalized.get("date_debut") or ""
        _end = normalized.get("end_date") or normalized.get("date_fin") or ""
        start_date = _start.strftime("%Y-%m-%d") if hasattr(_start, "strftime") else str(_start).strip()
        end_date = _end.strftime("%Y-%m-%d") if hasattr(_end, "strftime") else str(_end).strip()
        status = str(normalized.get("status") or normalized.get("statut") or "en_attente").strip()
        comment = str(normalized.get("comment") or normalized.get("commentaire") or "").strip()

        if not patient_id:
            errors.append({"row": row_num, "message": "patient_id manquant"})
            continue
        if not medication_id:
            errors.append({"row": row_num, "message": "medication_id manquant"})
            continue
        if not start_date:
            errors.append({"row": row_num, "message": "date de début manquante"})
            continue
        if not end_date:
            errors.append({"row": row_num, "message": "date de fin manquante"})
            continue
        if status not in status_values:
            errors.append({"row": row_num, "message": f"statut invalide (attendu: valide, en_attente, suppr)"})
            continue
        if start_date > end_date:
            errors.append({"row": row_num, "message": "la date de fin doit être >= date de début"})
            continue

        try:
            pid = int(float(str(patient_id).strip()))
            patient = Patient.objects.get(pk=pid)
        except (ValueError, TypeError, Patient.DoesNotExist):
            errors.append({"row": row_num, "message": f"patient_id {patient_id} introuvable"})
            continue

        try:
            mid = int(float(str(medication_id).strip()))
            medication = Medication.objects.get(pk=mid)
        except (ValueError, TypeError, Medication.DoesNotExist):
            errors.append({"row": row_num, "message": f"medication_id {medication_id} introuvable"})
            continue

        try:
            with transaction.atomic():
                Prescription.objects.create(
                    patient=patient,
                    medication=medication,
                    start_date=start_date,
                    end_date=end_date,
                    status=status,
                    comment=comment,
                )
            created += 1
        except Exception as e:
            errors.append({"row": row_num, "message": str(e)})

    return created, errors
