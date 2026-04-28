from django.db import models

# Create your models here.

class Filliere(models.Model):
    id_filliere = models.CharField(max_length=50,unique=True)
    nom = models.CharField(max_length=100)

    class Meta:
        ordering=["nom"]

    def __str__(self):
        return f"{self.nom} {self.prenom}"
    
    from django.db import models

# Create your models here.

class Module(models.Model):
    id_module= models.CharField(max_length=50,unique=True)
    nom = models.CharField(max_length=50)
     module = module.ForeignKey(
        Filliere,
        on_delete=models.CASCADE,
        related_name="modules"
    )


class Cours(models.Model):
    id_cours= models.CharField(max_length=50,unique=True)
    nom = models.CharField(max_length=50)
    module = module.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="cours"
    )