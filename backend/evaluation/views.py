from rest_framework import viewsets

from .models import Evaluation
from .serializers import EvaluationSerializer


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer

    def get_queryset(self):
        queryset = Evaluation.objects.select_related(
            "filiere",
            "module",
            "cours",
            "groupe",
            "enseignant",
        )
        filiere_id = self.request.query_params.get("filiere")
        groupe_id = self.request.query_params.get("groupe")
        if filiere_id:
            queryset = queryset.filter(filiere_id=filiere_id)
        if groupe_id:
            queryset = queryset.filter(groupe_id=groupe_id)
        return queryset
