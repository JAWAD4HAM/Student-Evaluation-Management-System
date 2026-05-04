from rest_framework import serializers

from .models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    filiere_nom = serializers.CharField(source="filiere.nom", read_only=True)
    module_nom = serializers.CharField(source="module.nom", read_only=True)
    cours_nom = serializers.CharField(source="cours.nom", read_only=True)
    groupe_nom = serializers.CharField(source="groupe.nom", read_only=True)
    enseignant_nom = serializers.SerializerMethodField()
    type_evaluation_label = serializers.CharField(
        source="get_type_evaluation_display",
        read_only=True,
    )

    class Meta:
        model = Evaluation
        fields = [
            "id",
            "titre",
            "type_evaluation",
            "type_evaluation_label",
            "date_evaluation",
            "filiere",
            "filiere_nom",
            "module",
            "module_nom",
            "cours",
            "cours_nom",
            "groupe",
            "groupe_nom",
            "enseignant",
            "enseignant_nom",
        ]

    def get_enseignant_nom(self, obj):
        return f"{obj.enseignant.nom} {obj.enseignant.prenom}"

    def validate(self, attrs):
        filiere = attrs.get("filiere", getattr(self.instance, "filiere", None))
        module = attrs.get("module", getattr(self.instance, "module", None))
        cours = attrs.get("cours", getattr(self.instance, "cours", None))
        groupe = attrs.get("groupe", getattr(self.instance, "groupe", None))

        errors = {}
        if module and filiere and module.filiere_id != filiere.id:
            errors["module"] = "Le module doit appartenir a la filiere choisie."
        if cours and module and cours.module_id != module.id:
            errors["cours"] = "Le cours doit appartenir au module choisi."
        if groupe and filiere and groupe.filiere_id != filiere.id:
            errors["groupe"] = "Le groupe doit appartenir a la filiere choisie."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs
