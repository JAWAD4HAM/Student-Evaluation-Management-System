from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Cours, Filiere, Module


class CoursValidationTests(TestCase):
    def setUp(self):
        admin = get_user_model().objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=admin)
        self.filiere = Filiere.objects.create(id_filiere="FIL1", nom="Informatique")
        self.module = Module.objects.create(
            id_module="MOD1",
            nom="Web",
            filiere=self.filiere,
        )

    def test_module_accepts_only_two_courses(self):
        Cours.objects.create(id_cours="CRS1", nom="HTML", module=self.module)
        Cours.objects.create(id_cours="CRS2", nom="React", module=self.module)

        response = self.client.post(
            "/api/cours/",
            {"id_cours": "CRS3", "nom": "Django", "module": self.module.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Cours.objects.count(), 2)
