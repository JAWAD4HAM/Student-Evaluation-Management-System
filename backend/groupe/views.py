from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Eleve, Groupe
from .serializers import EleveSerializer, GroupeSerializer


class GroupeViewSet(viewsets.ModelViewSet):
    serializer_class = GroupeSerializer

    def get_queryset(self):
        queryset = Groupe.objects.select_related("filiere").prefetch_related("eleves")
        filiere_id = self.request.query_params.get("filiere")
        if filiere_id:
            queryset = queryset.filter(filiere_id=filiere_id)
        return queryset

    @action(detail=True, methods=["get"])
    def eleves(self, request, pk=None):
        groupe = self.get_object()
        serializer = EleveSerializer(groupe.eleves.all(), many=True)
        return Response(serializer.data)


class EleveViewSet(viewsets.ModelViewSet):
    serializer_class = EleveSerializer

    def get_queryset(self):
        queryset = Eleve.objects.select_related("groupe", "groupe__filiere")
        groupe_id = self.request.query_params.get("groupe")
        if groupe_id:
            queryset = queryset.filter(groupe_id=groupe_id)
        return queryset
