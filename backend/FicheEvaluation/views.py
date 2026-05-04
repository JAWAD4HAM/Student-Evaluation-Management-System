from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from evaluation.models import Evaluation
from groupe.models import Eleve, Groupe

from .models import FicheEvaluation
from .serializers import FicheEvaluationSerializer


class FicheEvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = FicheEvaluationSerializer

    def get_queryset(self):
        queryset = FicheEvaluation.objects.select_related(
            "evaluation",
            "evaluation__filiere",
            "evaluation__module",
            "evaluation__cours",
            "evaluation__groupe",
            "evaluation__enseignant",
            "eleve",
            "eleve__groupe",
        )
        evaluation_id = self.request.query_params.get("evaluation")
        groupe_id = self.request.query_params.get("groupe")
        if evaluation_id:
            queryset = queryset.filter(evaluation_id=evaluation_id)
        if groupe_id:
            queryset = queryset.filter(eleve__groupe_id=groupe_id)
        return queryset

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        evaluation_id = request.data.get("evaluation") or request.data.get("evaluation_id")
        groupe_id = request.data.get("groupe") or request.data.get("groupe_id")
        selected_eleve_ids = request.data.get("eleves")

        if not evaluation_id or not groupe_id:
            return Response(
                {"detail": "Evaluation et groupe sont obligatoires."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            evaluation = Evaluation.objects.select_related("groupe").get(pk=evaluation_id)
            groupe = Groupe.objects.prefetch_related("eleves").get(pk=groupe_id)
        except (Evaluation.DoesNotExist, Groupe.DoesNotExist):
            return Response(
                {"detail": "Evaluation ou groupe introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if evaluation.groupe_id != groupe.id:
            return Response(
                {"detail": "Le groupe choisi doit correspondre au groupe de l'evaluation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        groupe_eleves = list(groupe.eleves.all())
        if len(groupe_eleves) < 2:
            return Response(
                {"detail": "Un groupe doit contenir au moins 2 eleves avant la generation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if selected_eleve_ids is None:
            eleves = groupe_eleves
        else:
            if not isinstance(selected_eleve_ids, list):
                return Response(
                    {"detail": "La liste des eleves selectionnes est invalide."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not selected_eleve_ids:
                return Response(
                    {"detail": "Selectionnez au moins un eleve pour generer les fiches."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            eleves = list(
                Eleve.objects.filter(
                    id__in=selected_eleve_ids,
                    groupe_id=groupe.id,
                )
            )
            if len(eleves) != len(set(selected_eleve_ids)):
                return Response(
                    {"detail": "Un ou plusieurs eleves selectionnes n'appartiennent pas au groupe."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        created_count = 0
        fiches = []
        with transaction.atomic():
            for eleve in eleves:
                fiche, created = FicheEvaluation.objects.get_or_create(
                    evaluation=evaluation,
                    eleve=eleve,
                )
                if created:
                    created_count += 1
                fiches.append(fiche)

        serializer = self.get_serializer(fiches, many=True)
        return Response(
            {
                "created": created_count,
                "skipped": len(fiches) - created_count,
                "total": len(fiches),
                "fiches": serializer.data,
            },
            status=status.HTTP_201_CREATED if created_count else status.HTTP_200_OK,
        )
