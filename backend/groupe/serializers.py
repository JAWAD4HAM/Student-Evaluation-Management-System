from rest_framework import serializers

from .models import Eleve, Groupe


class EleveSerializer(serializers.ModelSerializer):
    groupe_nom = serializers.CharField(source="groupe.nom", read_only=True)
    statut_label = serializers.CharField(source="get_eleve_statut_display", read_only=True)

    class Meta:
        model = Eleve
        fields = [
            "id",
            "id_national",
            "id_eleve",
            "nom",
            "prenom",
            "email",
            "telephone",
            "date_naissance",
            "eleve_statut",
            "statut_label",
            "groupe",
            "groupe_nom",
        ]


class GroupeSerializer(serializers.ModelSerializer):
    filiere_nom = serializers.CharField(source="filiere.nom", read_only=True)
    eleves_count = serializers.IntegerField(source="eleves.count", read_only=True)

    class Meta:
        model = Groupe
        fields = [
            "id",
            "id_groupe",
            "nom",
            "filiere",
            "filiere_nom",
            "eleves_count",
        ]
