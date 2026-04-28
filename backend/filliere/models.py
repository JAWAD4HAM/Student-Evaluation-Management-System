from django.db import models

# Create your models here.

class Filliere (models.Model):
    id_filliere = models.CharField(max_length=50,unique=True)
    nom = models.CharField(max_length=100)

    class Meta:
        ordering=["nom"]

    