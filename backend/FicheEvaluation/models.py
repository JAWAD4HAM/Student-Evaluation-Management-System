from django.db import models

from evaluation.models import Evaluation
from groupe.models import Eleve


class FicheEvaluation(models.Model):
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name="fiches",
    )
    eleve = models.ForeignKey(
        Eleve,
        on_delete=models.CASCADE,
        related_name="fiches",
    )
    date_generation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["evaluation", "eleve"]
        ordering = ["-date_generation"]

    def __str__(self):
        return f"Fiche pour {self.eleve.nom} {self.eleve.prenom} - {self.evaluation.titre}"
