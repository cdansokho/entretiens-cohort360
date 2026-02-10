from django.core.exceptions import ValidationError
from django.db import models


class Patient(models.Model):
    """Représente un patient."""

    last_name = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["last_name", "first_name", "id"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.last_name} {self.first_name}"


class Medication(models.Model):
    """Représente un médicament."""

    STATUS_ACTIF = "actif"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_ACTIF, "actif"),
        (STATUS_SUPPR, "suppr"),
    )

    code = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=255)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIF)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.code} - {self.label} ({self.status})"


class Prescription(models.Model):
    """
    Représente une prescription médicamenteuse.
    Lie un patient à un médicament sur une période donnée.
    """

    STATUS_VALIDE = "valide"
    STATUS_EN_ATTENTE = "en_attente"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_VALIDE, "Valide"),
        (STATUS_EN_ATTENTE, "En attente"),
        (STATUS_SUPPR, "Supprimée"),
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        help_text="Patient concerné par la prescription.",
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        help_text="Médicament prescrit.",
    )
    start_date = models.DateField(
        help_text="Date de début de la prescription.",
    )
    end_date = models.DateField(
        help_text="Date de fin de la prescription.",
    )
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_EN_ATTENTE,
        help_text="Statut de la prescription.",
    )
    comment = models.TextField(
        blank=True,
        default="",
        help_text="Commentaire optionnel sur la prescription.",
    )

    class Meta:
        ordering = ["-start_date", "id"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return (
            f"Prescription #{self.pk} — "
            f"{self.patient} → {self.medication.label} "
            f"({self.start_date} → {self.end_date}) [{self.status}]"
        )

    def clean(self) -> None:
        """Validation métier : la date de fin doit être >= date de début."""
        super().clean()
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValidationError(
                {"end_date": "La date de fin doit être postérieure ou égale à la date de début."}
            )
