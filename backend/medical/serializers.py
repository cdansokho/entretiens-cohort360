from rest_framework import serializers

from .models import Patient, Medication, Prescription


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "last_name", "first_name", "birth_date"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "code", "label", "status"]


class PrescriptionSerializer(serializers.ModelSerializer):
    """
    Serializer pour la ressource Prescription.

    En lecture, les champs ``patient`` et ``medication`` sont développés
    (nested) afin de fournir toutes les informations utiles au frontend.

    En écriture, on accepte les identifiants (PK) via les champs
    ``patient_id`` et ``medication_id``.
    """

    # --- Champs en lecture (nested) ---
    patient = PatientSerializer(read_only=True)
    medication = MedicationSerializer(read_only=True)

    # --- Champs en écriture (PK) ---
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        source="patient",
        write_only=True,
        help_text="Identifiant du patient.",
    )
    medication_id = serializers.PrimaryKeyRelatedField(
        queryset=Medication.objects.all(),
        source="medication",
        write_only=True,
        help_text="Identifiant du médicament.",
    )

    class Meta:
        model = Prescription
        fields = [
            "id",
            "patient",
            "patient_id",
            "medication",
            "medication_id",
            "start_date",
            "end_date",
            "status",
            "comment",
        ]

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate(self, attrs: dict) -> dict:
        """
        Validation croisée : la date de fin doit être >= date de début.
        """
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        # En cas de PATCH partiel, on récupère les valeurs existantes
        if self.instance:
            start_date = start_date or self.instance.start_date
            end_date = end_date or self.instance.end_date

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "La date de fin doit être postérieure ou égale à la date de début."}
            )

        return attrs
