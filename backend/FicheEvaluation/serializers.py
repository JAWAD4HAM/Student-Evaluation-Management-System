from rest_framework import serializers

from .models import FicheEvaluation


class FicheEvaluationSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.CharField(source="eleve.nom", read_only=True)
    eleve_prenom = serializers.CharField(source="eleve.prenom", read_only=True)
    eleve_id_national = serializers.CharField(source="eleve.id_national", read_only=True)
    eleve_id_eleve = serializers.CharField(source="eleve.id_eleve", read_only=True)
    groupe = serializers.IntegerField(source="eleve.groupe.id", read_only=True)
    groupe_nom = serializers.CharField(source="eleve.groupe.nom", read_only=True)
    filiere_nom = serializers.CharField(source="evaluation.filiere.nom", read_only=True)
    module_nom = serializers.CharField(source="evaluation.module.nom", read_only=True)
    cours_nom = serializers.CharField(source="evaluation.cours.nom", read_only=True)
    enseignant_nom = serializers.SerializerMethodField()
    evaluation_titre = serializers.CharField(source="evaluation.titre", read_only=True)
    evaluation_type = serializers.CharField(
        source="evaluation.get_type_evaluation_display",
        read_only=True,
    )
    evaluation_date = serializers.DateField(
        source="evaluation.date_evaluation",
        read_only=True,
    )

    class Meta:
        model = FicheEvaluation
        fields = [
            "id",
            "evaluation",
            "eleve",
            "eleve_nom",
            "eleve_prenom",
            "eleve_id_national",
            "eleve_id_eleve",
            "groupe",
            "groupe_nom",
            "filiere_nom",
            "module_nom",
            "cours_nom",
            "enseignant_nom",
            "evaluation_titre",
            "evaluation_type",
            "evaluation_date",
            "date_generation",
        ]
        read_only_fields = ["date_generation"]

    def get_enseignant_nom(self, obj):
        enseignant = obj.evaluation.enseignant
        return f"{enseignant.nom} {enseignant.prenom}"
