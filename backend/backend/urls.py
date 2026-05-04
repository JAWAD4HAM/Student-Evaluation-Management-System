from django.contrib import admin
from django.contrib.auth import authenticate
from django.urls import include, path
from rest_framework import routers, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from enseignant.views import EnseignantViewSet
from evaluation.views import EvaluationViewSet
from FicheEvaluation.views import FicheEvaluationViewSet
from filliere.views import CoursViewSet, FiliereViewSet, ModuleViewSet
from groupe.views import EleveViewSet, GroupeViewSet


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)

    if not user or not user.is_staff:
        return Response(
            {"detail": "Identifiants administrateur invalides."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            },
        }
    )


@api_view(["POST"])
def logout_view(request):
    if request.auth:
        request.auth.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def me_view(request):
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
        }
    )


router = routers.DefaultRouter()
router.register("filieres", FiliereViewSet, basename="filiere")
router.register("modules", ModuleViewSet, basename="module")
router.register("cours", CoursViewSet, basename="cours")
router.register("groupes", GroupeViewSet, basename="groupe")
router.register("eleves", EleveViewSet, basename="eleve")
router.register("enseignants", EnseignantViewSet, basename="enseignant")
router.register("evaluations", EvaluationViewSet, basename="evaluation")
router.register("fiches", FicheEvaluationViewSet, basename="fiche-evaluation")

admin.site.site_header = "Administration des fiches d'evaluation"
admin.site.site_title = "Fiches d'evaluation"
admin.site.index_title = "Gestion academique"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", login_view, name="api-login"),
    path("api/auth/logout/", logout_view, name="api-logout"),
    path("api/auth/me/", me_view, name="api-me"),
    path("api/", include(router.urls)),
]
