from django.db import models

class Enseignant(models.Model):
       
      id_enseignant = models.CharField(max_length=50 , unique=True)
      nom = models.CharField(max_length=50)
      prenom = models.CharField(max_length=50)
      email = models.EmailField()
      ENSEIGNANT_STATUT = [

            "A","Active",
            "I","Inactive"

      ]
      enseignant_statut = models.CharField(max_length=1,choices=ENSEIGNANT_STATUT,default="A")


      class Meta:
        ordering = ["nom", "prenom"]

      def __str__(self):
          return f"{self.nom} {self.prenom}"
