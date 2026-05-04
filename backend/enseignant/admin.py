from django.contrib import admin

from .models import Enseignant


@admin.register(Enseignant)
class EnseignantAdmin(admin.ModelAdmin):
    list_display = ("id_enseignant", "nom", "prenom", "email", "enseignant_statut")
    search_fields = ("id_enseignant", "nom", "prenom", "email")
    list_filter = ("enseignant_statut",)
