from rest_framework import serializers

from .models import Cours, Filiere, Module


class CoursSerializer(serializers.ModelSerializer):
    module_nom = serializers.CharField(source="module.nom", read_only=True)

    class Meta:
        model = Cours
        fields = ["id", "id_cours", "nom", "module", "module_nom"]

    def validate(self, attrs):
        module = attrs.get("module", getattr(self.instance, "module", None))
        if module:
            queryset = Cours.objects.filter(module=module)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.count() >= 2:
                raise serializers.ValidationError(
                    "Un module peut contenir au maximum 2 cours."
                )
        return attrs


class ModuleSerializer(serializers.ModelSerializer):
    filiere_nom = serializers.CharField(source="filiere.nom", read_only=True)
    cours = CoursSerializer(many=True, read_only=True)
    cours_count = serializers.IntegerField(source="cours.count", read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "id_module",
            "nom",
            "filiere",
            "filiere_nom",
            "cours",
            "cours_count",
        ]


class FiliereSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    modules_count = serializers.IntegerField(source="modules.count", read_only=True)
    groupes_count = serializers.IntegerField(source="groupes.count", read_only=True)

    class Meta:
        model = Filiere
        fields = [
            "id",
            "id_filiere",
            "nom",
            "modules",
            "modules_count",
            "groupes_count",
        ]
