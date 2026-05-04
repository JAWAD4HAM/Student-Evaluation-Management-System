from django.db import models


class Filiere(models.Model):
    id_filiere = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=100)

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Module(models.Model):
    id_module = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=50)
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        related_name="modules",
    )

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Cours(models.Model):
    id_cours = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=50)
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="cours",
    )

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom
