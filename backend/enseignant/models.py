from django.db import models
import filliere.models from Filliere
# Create your models here.

class Groupe(models.Model):

    id_groupe = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=50)
    
    filliere = models.ForeignKey(
    Filliere,
    on_delete=models.CASCADE,
    related_name="groupes"
    )

    class Meta:
        ordering=["nom"]


    def __str__ (self):
        return f"{self.nom}"