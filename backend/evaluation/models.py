from django.db import models

from enseignant.models import Enseignant
from filliere.models import Cours, Filiere, Module
from groupe.models import Groupe


class Evaluation(models.Model):
    titre = models.CharField(max_length=100)

    TYPE_EVALUATION = [
        ("C", "CONTROLE"),
        ("E", "EXAMEN"),
        ("SG", "STAGE"),
        ("P", "PRESENTATION"),
        ("ST", "SOUTENANCE"),
    ]
    type_evaluation = models.CharField(
        max_length=2,
        choices=TYPE_EVALUATION,
        default="C",
    )
    date_evaluation = models.DateField()

    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    cours = models.ForeignKey(
        Cours,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    groupe = models.ForeignKey(
        Groupe,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    enseignant = models.ForeignKey(
        Enseignant,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )

    class Meta:
        ordering = ["-date_evaluation", "titre"]

    def __str__(self):
        return f"{self.titre} - {self.get_type_evaluation_display()}"
