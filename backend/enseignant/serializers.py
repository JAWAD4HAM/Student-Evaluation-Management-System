from rest_framework import serializers

from .models import Enseignant


class EnseignantSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()
    statut_label = serializers.CharField(
        source="get_enseignant_statut_display",
        read_only=True,
    )

    class Meta:
        model = Enseignant
        fields = [
            "id",
            "id_enseignant",
            "nom",
            "prenom",
            "nom_complet",
            "email",
            "enseignant_statut",
            "statut_label",
        ]

    def get_nom_complet(self, obj):
        return f"{obj.nom} {obj.prenom}"
