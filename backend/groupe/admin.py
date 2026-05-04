from django.contrib import admin

from .models import Eleve, Groupe


class EleveInline(admin.TabularInline):
    model = Eleve
    extra = 0


@admin.register(Groupe)
class GroupeAdmin(admin.ModelAdmin):
    list_display = ("id_groupe", "nom", "filiere")
    search_fields = ("id_groupe", "nom", "filiere__nom")
    list_filter = ("filiere",)
    inlines = [EleveInline]


@admin.register(Eleve)
class EleveAdmin(admin.ModelAdmin):
    list_display = ("id_eleve", "nom", "prenom", "groupe", "eleve_statut")
    search_fields = ("id_eleve", "id_national", "nom", "prenom", "email")
    list_filter = ("groupe", "eleve_statut")
