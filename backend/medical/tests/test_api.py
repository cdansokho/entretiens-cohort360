from datetime import date, timedelta

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from medical.models import Patient, Medication, Prescription


class PatientApiTests(TestCase):
    """Tests existants pour l'API Patient."""

    def setUp(self):
        self.client = APIClient()
        Patient.objects.create(last_name="Martin", first_name="Jeanne", birth_date="1992-03-10")
        Patient.objects.create(last_name="Durand", first_name="Jean", birth_date="1980-05-20")
        Patient.objects.create(last_name="Bernard", first_name="Paul")

    def test_patient_list(self):
        url = reverse("patient-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 3)

    def test_patient_filter_nom(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"nom": "mart"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all("mart" in p["last_name"].lower() for p in data))

    def test_patient_filter_date(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"date_naissance": "1980-05-20"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(p["birth_date"] == "1980-05-20" for p in data))


class MedicationApiTests(TestCase):
    """Tests existants pour l'API Medication."""

    def setUp(self):
        self.client = APIClient()
        Medication.objects.create(code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF)
        Medication.objects.create(code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_SUPPR)

    def test_medication_list(self):
        url = reverse("medication-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 2)

    def test_medication_filter_status(self):
        url = reverse("medication-list")
        r = self.client.get(url, {"status": "actif"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(m["status"] == "actif" for m in data))


class PrescriptionApiTests(TestCase):
    """Tests complets pour l'API Prescription (CRUD + filtres)."""

    def setUp(self):
        self.client = APIClient()

        # Patients
        self.patient1 = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.patient2 = Patient.objects.create(
            last_name="Durand", first_name="Jean", birth_date="1980-05-20"
        )

        # Médicaments
        self.med1 = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF
        )
        self.med2 = Medication.objects.create(
            code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_ACTIF
        )

        # Prescriptions
        self.rx1 = Prescription.objects.create(
            patient=self.patient1,
            medication=self.med1,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 6, 30),
            status=Prescription.STATUS_VALIDE,
            comment="Traitement de fond",
        )
        self.rx2 = Prescription.objects.create(
            patient=self.patient2,
            medication=self.med2,
            start_date=date(2025, 3, 15),
            end_date=date(2025, 9, 15),
            status=Prescription.STATUS_EN_ATTENTE,
        )
        self.rx3 = Prescription.objects.create(
            patient=self.patient1,
            medication=self.med2,
            start_date=date(2024, 6, 1),
            end_date=date(2024, 12, 31),
            status=Prescription.STATUS_SUPPR,
            comment="Prescription annulée",
        )

    # ------------------------------------------------------------------
    # LECTURE (GET)
    # ------------------------------------------------------------------

    def test_prescription_list(self):
        """La liste des prescriptions est accessible."""
        url = reverse("prescription-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.json()), 3)

    def test_prescription_detail(self):
        """Le détail d'une prescription est accessible."""
        url = reverse("prescription-detail", args=[self.rx1.pk])
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(data["id"], self.rx1.pk)
        # Vérifier que les données nested sont présentes
        self.assertEqual(data["patient"]["last_name"], "Martin")
        self.assertEqual(data["medication"]["code"], "PARA500")

    # ------------------------------------------------------------------
    # CRÉATION (POST)
    # ------------------------------------------------------------------

    def test_create_prescription_valid(self):
        """Une prescription peut être créée avec des données valides."""
        url = reverse("prescription-list")
        payload = {
            "patient_id": self.patient1.pk,
            "medication_id": self.med1.pk,
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "status": "valide",
            "comment": "Nouvelle prescription",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        data = r.json()
        self.assertEqual(data["patient"]["id"], self.patient1.pk)
        self.assertEqual(data["medication"]["id"], self.med1.pk)
        self.assertEqual(data["status"], "valide")
        self.assertEqual(data["comment"], "Nouvelle prescription")

    def test_create_prescription_invalid_dates(self):
        """La création est refusée si date_fin < date_début."""
        url = reverse("prescription-list")
        payload = {
            "patient_id": self.patient1.pk,
            "medication_id": self.med1.pk,
            "start_date": "2026-06-30",
            "end_date": "2026-01-01",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("end_date", r.json())

    def test_create_prescription_missing_patient(self):
        """La création est refusée si le patient n'existe pas."""
        url = reverse("prescription-list")
        payload = {
            "patient_id": 99999,
            "medication_id": self.med1.pk,
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_prescription_missing_medication(self):
        """La création est refusée si le médicament n'existe pas."""
        url = reverse("prescription-list")
        payload = {
            "patient_id": self.patient1.pk,
            "medication_id": 99999,
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_prescription_missing_required_fields(self):
        """La création est refusée si des champs obligatoires manquent."""
        url = reverse("prescription-list")
        payload = {
            "patient_id": self.patient1.pk,
            # medication_id manquant
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_prescription_without_comment(self):
        """Le commentaire est optionnel."""
        url = reverse("prescription-list")
        payload = {
            "patient_id": self.patient1.pk,
            "medication_id": self.med1.pk,
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "status": "en_attente",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.json()["comment"], "")

    # ------------------------------------------------------------------
    # MISE À JOUR (PUT / PATCH)
    # ------------------------------------------------------------------

    def test_update_prescription_full(self):
        """Mise à jour complète (PUT) d'une prescription."""
        url = reverse("prescription-detail", args=[self.rx1.pk])
        payload = {
            "patient_id": self.patient2.pk,
            "medication_id": self.med2.pk,
            "start_date": "2026-02-01",
            "end_date": "2026-08-31",
            "status": "en_attente",
            "comment": "Mise à jour complète",
        }
        r = self.client.put(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(data["patient"]["id"], self.patient2.pk)
        self.assertEqual(data["status"], "en_attente")

    def test_update_prescription_partial(self):
        """Mise à jour partielle (PATCH) d'une prescription."""
        url = reverse("prescription-detail", args=[self.rx1.pk])
        payload = {"status": "suppr", "comment": "Annulée par le médecin"}
        r = self.client.patch(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(data["status"], "suppr")
        self.assertEqual(data["comment"], "Annulée par le médecin")

    def test_update_prescription_invalid_dates(self):
        """La mise à jour est refusée si date_fin < date_début."""
        url = reverse("prescription-detail", args=[self.rx1.pk])
        payload = {"end_date": "2024-01-01"}  # Avant start_date (2025-01-01)
        r = self.client.patch(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # FILTRES
    # ------------------------------------------------------------------

    def test_filter_by_patient(self):
        """Filtrer les prescriptions par patient."""
        url = reverse("prescription-list")
        r = self.client.get(url, {"patient": self.patient1.pk})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(len(data), 2)
        self.assertTrue(all(p["patient"]["id"] == self.patient1.pk for p in data))

    def test_filter_by_medication(self):
        """Filtrer les prescriptions par médicament."""
        url = reverse("prescription-list")
        r = self.client.get(url, {"medication": self.med2.pk})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(len(data), 2)
        self.assertTrue(all(p["medication"]["id"] == self.med2.pk for p in data))

    def test_filter_by_status(self):
        """Filtrer les prescriptions par statut."""
        url = reverse("prescription-list")
        r = self.client.get(url, {"status": "valide"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["status"], "valide")

    def test_filter_by_start_date_gte(self):
        """Filtrer par date de début >= valeur."""
        url = reverse("prescription-list")
        r = self.client.get(url, {"start_date_gte": "2025-01-01"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(len(data), 2)  # rx1 et rx2

    def test_filter_by_end_date_lte(self):
        """Filtrer par date de fin <= valeur."""
        url = reverse("prescription-list")
        r = self.client.get(url, {"end_date_lte": "2025-06-30"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(len(data), 2)  # rx1 et rx3

    def test_filter_combined(self):
        """Les filtres peuvent être combinés entre eux."""
        url = reverse("prescription-list")
        r = self.client.get(url, {
            "patient": self.patient1.pk,
            "status": "valide",
        })
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        data = r.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], self.rx1.pk)

    def test_filter_no_results(self):
        """Les filtres retournent une liste vide si aucun résultat."""
        url = reverse("prescription-list")
        r = self.client.get(url, {"status": "valide", "patient": self.patient2.pk})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.json()), 0)
