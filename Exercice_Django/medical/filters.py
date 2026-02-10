import django_filters

from .models import Patient, Medication, Prescription


class PatientFilter(django_filters.FilterSet):
    nom = django_filters.CharFilter(field_name="last_name", lookup_expr="icontains")
    prenom = django_filters.CharFilter(field_name="first_name", lookup_expr="icontains")
    date_naissance = django_filters.DateFilter(field_name="birth_date")
    id = django_filters.CharFilter(method="filter_ids")

    def filter_ids(self, queryset, name, value):
        request = getattr(self, "request", None)
        values = []
        if request is not None:
            repeated = request.GET.getlist("id")
            for v in repeated:
                values.extend(v.split(","))
        if not values and value:
            values = value.split(",")
        ids = [int(v) for v in values if str(v).strip().isdigit()]
        return queryset.filter(id__in=ids) if ids else queryset

    class Meta:
        model = Patient
        fields = []


class MedicationFilter(django_filters.FilterSet):
    code = django_filters.CharFilter(field_name="code", lookup_expr="icontains")
    label = django_filters.CharFilter(field_name="label", lookup_expr="icontains")
    status = django_filters.CharFilter(field_name="status", lookup_expr="exact")

    class Meta:
        model = Medication
        fields = ["code", "label", "status"]


class PrescriptionFilter(django_filters.FilterSet):
    """
    Filtres avancés pour les prescriptions.

    Permet de filtrer par :
    - patient (id)
    - medication (id)
    - statut (exact)
    - date de début (intervalle : gte / lte)
    - date de fin (intervalle : gte / lte)
    """

    # --- Filtres par relation ---
    patient = django_filters.NumberFilter(
        field_name="patient_id",
        help_text="Filtrer par identifiant du patient.",
    )
    medication = django_filters.NumberFilter(
        field_name="medication_id",
        help_text="Filtrer par identifiant du médicament.",
    )

    # --- Filtre par statut ---
    status = django_filters.ChoiceFilter(
        choices=Prescription.STATUS_CHOICES,
        help_text="Filtrer par statut (valide, en_attente, suppr).",
    )

    # --- Filtres par date de début (intervalle) ---
    start_date = django_filters.DateFilter(
        field_name="start_date",
        lookup_expr="exact",
        help_text="Date de début exacte (YYYY-MM-DD).",
    )
    start_date_gte = django_filters.DateFilter(
        field_name="start_date",
        lookup_expr="gte",
        help_text="Date de début supérieure ou égale à (YYYY-MM-DD).",
    )
    start_date_lte = django_filters.DateFilter(
        field_name="start_date",
        lookup_expr="lte",
        help_text="Date de début inférieure ou égale à (YYYY-MM-DD).",
    )

    # --- Filtres par date de fin (intervalle) ---
    end_date = django_filters.DateFilter(
        field_name="end_date",
        lookup_expr="exact",
        help_text="Date de fin exacte (YYYY-MM-DD).",
    )
    end_date_gte = django_filters.DateFilter(
        field_name="end_date",
        lookup_expr="gte",
        help_text="Date de fin supérieure ou égale à (YYYY-MM-DD).",
    )
    end_date_lte = django_filters.DateFilter(
        field_name="end_date",
        lookup_expr="lte",
        help_text="Date de fin inférieure ou égale à (YYYY-MM-DD).",
    )

    class Meta:
        model = Prescription
        fields = [
            "patient",
            "medication",
            "status",
            "start_date",
            "start_date_gte",
            "start_date_lte",
            "end_date",
            "end_date_gte",
            "end_date_lte",
        ]
