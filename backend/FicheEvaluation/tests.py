from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from enseignant.models import Enseignant
from evaluation.models import Evaluation
from filliere.models import Cours, Filiere, Module
from groupe.models import Eleve, Groupe

from .models import FicheEvaluation


class FicheGenerationTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

        self.filiere = Filiere.objects.create(id_filiere="FIL1", nom="Informatique")
        self.module = Module.objects.create(
            id_module="MOD1",
            nom="Web",
            filiere=self.filiere,
        )
        self.cours = Cours.objects.create(
            id_cours="CRS1",
            nom="React",
            module=self.module,
        )
        self.groupe = Groupe.objects.create(
            id_groupe="GRP1",
            nom="DEV101",
            filiere=self.filiere,
        )
        self.enseignant = Enseignant.objects.create(
            id_enseignant="ENS1",
            nom="Mansouri",
            prenom="Karim",
            email="karim@example.com",
        )
        self.evaluation = Evaluation.objects.create(
            titre="Controle React",
            type_evaluation="C",
            date_evaluation="2026-05-15",
            filiere=self.filiere,
            module=self.module,
            cours=self.cours,
            groupe=self.groupe,
            enseignant=self.enseignant,
        )

    def create_eleve(self, index):
        return Eleve.objects.create(
            id_national=f"NAT{index}",
            id_eleve=f"ELV{index}",
            nom=f"Nom{index}",
            prenom=f"Prenom{index}",
            email=f"eleve{index}@example.com",
            telephone="0600000000",
            date_naissance="2004-01-01",
            groupe=self.groupe,
        )

    def test_generation_requires_two_students(self):
        self.create_eleve(1)
        response = self.client.post(
            "/api/fiches/generate/",
            {"evaluation": self.evaluation.id, "groupe": self.groupe.id},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(FicheEvaluation.objects.count(), 0)

    def test_generation_does_not_create_duplicates(self):
        self.create_eleve(1)
        self.create_eleve(2)

        first_response = self.client.post(
            "/api/fiches/generate/",
            {"evaluation": self.evaluation.id, "groupe": self.groupe.id},
            format="json",
        )
        second_response = self.client.post(
            "/api/fiches/generate/",
            {"evaluation": self.evaluation.id, "groupe": self.groupe.id},
            format="json",
        )

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(FicheEvaluation.objects.count(), 2)
        self.assertEqual(second_response.data["created"], 0)

    def test_generation_can_target_selected_students(self):
        first = self.create_eleve(1)
        second = self.create_eleve(2)
        third = self.create_eleve(3)

        response = self.client.post(
            "/api/fiches/generate/",
            {
                "evaluation": self.evaluation.id,
                "groupe": self.groupe.id,
                "eleves": [first.id, third.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(FicheEvaluation.objects.count(), 2)
        self.assertTrue(
            FicheEvaluation.objects.filter(
                evaluation=self.evaluation,
                eleve=first,
            ).exists()
        )
        self.assertFalse(
            FicheEvaluation.objects.filter(
                evaluation=self.evaluation,
                eleve=second,
            ).exists()
        )
        self.assertTrue(
            FicheEvaluation.objects.filter(
                evaluation=self.evaluation,
                eleve=third,
            ).exists()
        )

    def test_generation_rejects_empty_student_selection(self):
        self.create_eleve(1)
        self.create_eleve(2)

        response = self.client.post(
            "/api/fiches/generate/",
            {
                "evaluation": self.evaluation.id,
                "groupe": self.groupe.id,
                "eleves": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(FicheEvaluation.objects.count(), 0)
