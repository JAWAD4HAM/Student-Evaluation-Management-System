from django.db import models

from filliere.models import Filiere


class Groupe(models.Model):
    id_groupe = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=50)
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        related_name="groupes",
    )

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Eleve(models.Model):
    id_national = models.CharField(max_length=50, unique=True)
    id_eleve = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=15, blank=True, null=True)
    date_naissance = models.DateField()

    ELEVE_STATUT = [
        ("A", "Active"),
        ("I", "Inactive"),
        ("G", "Graduated"),
    ]
    eleve_statut = models.CharField(max_length=1, choices=ELEVE_STATUT, default="A")

    groupe = models.ForeignKey(
        Groupe,
        on_delete=models.CASCADE,
        related_name="eleves",
    )

    class Meta:
        ordering = ["nom", "prenom"]

    def __str__(self):
        return f"{self.nom} {self.prenom}"
