from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cours, Filiere, Module
from .serializers import CoursSerializer, FiliereSerializer, ModuleSerializer


class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.prefetch_related("modules__cours", "groupes")
    serializer_class = FiliereSerializer

    @action(detail=True, methods=["get"])
    def modules(self, request, pk=None):
        filiere = self.get_object()
        serializer = ModuleSerializer(filiere.modules.prefetch_related("cours"), many=True)
        return Response(serializer.data)


class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        queryset = Module.objects.select_related("filiere").prefetch_related("cours")
        filiere_id = self.request.query_params.get("filiere")
        if filiere_id:
            queryset = queryset.filter(filiere_id=filiere_id)
        return queryset

    @action(detail=True, methods=["get"])
    def cours(self, request, pk=None):
        module = self.get_object()
        serializer = CoursSerializer(module.cours.all(), many=True)
        return Response(serializer.data)


class CoursViewSet(viewsets.ModelViewSet):
    serializer_class = CoursSerializer

    def get_queryset(self):
        queryset = Cours.objects.select_related("module", "module__filiere")
        module_id = self.request.query_params.get("module")
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        return queryset
