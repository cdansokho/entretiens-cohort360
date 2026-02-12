from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter

from .models import Patient, Medication, Prescription
from .filters import PatientFilter, MedicationFilter, PrescriptionFilter
from .serializers import PatientSerializer, MedicationSerializer, PrescriptionSerializer
from .pagination import PrescriptionPagination
from .import_csv import parse_uploaded_file, import_prescriptions_from_rows


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    """Lecture seule des patients avec filtrage via query params."""

    serializer_class = PatientSerializer
    queryset = Patient.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = PatientFilter


class MedicationViewSet(viewsets.ReadOnlyModelViewSet):
    """Lecture seule des médicaments avec filtrage via query params."""

    serializer_class = MedicationSerializer
    queryset = Medication.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = MedicationFilter


class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les prescriptions médicamenteuses.

    Endpoints :
    - GET    /Prescription          → liste (avec filtres)
    - POST   /Prescription          → création
    - GET    /Prescription/{id}     → détail
    - PUT    /Prescription/{id}     → mise à jour complète
    - PATCH  /Prescription/{id}     → mise à jour partielle
    - DELETE /Prescription/{id}     → suppression

    Filtres disponibles :
    - patient, medication, status
    - start_date, start_date_gte, start_date_lte
    - end_date, end_date_gte, end_date_lte

    Tri disponible :
    - start_date, end_date, status, id
    """

    serializer_class = PrescriptionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PrescriptionFilter
    ordering_fields = ["start_date", "end_date", "status", "id"]
    ordering = ["-start_date"]
    pagination_class = PrescriptionPagination

    def get_queryset(self):
        """
        Optimisation : ``select_related`` pour éviter les requêtes N+1
        lors de la sérialisation nested de patient et medication.
        """
        return Prescription.objects.select_related("patient", "medication").all()

    @action(detail=False, methods=["post"], url_path="import")
    def import_file(self, request):
        """
        Import prescriptions from a CSV or Excel file (multipart/form-data, field name: file).

        Accepted: .csv (semicolon-separated, UTF-8) or .xlsx.
        Header row required. Columns: patient_id, medication_id, start_date, end_date, status, comment.
        """
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response(
                {"detail": "Aucun fichier fourni. Envoyez un fichier CSV ou Excel avec le champ 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            content = uploaded.read()
        except Exception as e:
            return Response(
                {"detail": f"Impossible de lire le fichier: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            rows = parse_uploaded_file(content, uploaded.name)
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not rows:
            return Response(
                {"detail": "Le fichier est vide ou n'a pas de ligne de données après l'en-tête."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        created, errors = import_prescriptions_from_rows(rows)
        return Response(
            {"created": created, "errors": errors},
            status=status.HTTP_200_OK,
        )
