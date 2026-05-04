from django.contrib import admin

from .models import Evaluation


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = (
        "titre",
        "type_evaluation",
        "date_evaluation",
        "filiere",
        "module",
        "cours",
        "groupe",
        "enseignant",
    )
    search_fields = ("titre", "cours__nom", "enseignant__nom", "enseignant__prenom")
    list_filter = ("type_evaluation", "filiere", "module", "groupe")
