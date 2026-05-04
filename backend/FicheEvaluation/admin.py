from django.contrib import admin

from .models import FicheEvaluation


@admin.register(FicheEvaluation)
class FicheEvaluationAdmin(admin.ModelAdmin):
    list_display = ("evaluation", "eleve", "date_generation")
    search_fields = (
        "evaluation__titre",
        "eleve__nom",
        "eleve__prenom",
        "eleve__id_eleve",
    )
    list_filter = ("evaluation__type_evaluation", "evaluation__groupe")
