from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from enseignant.models import Enseignant
from evaluation.models import Evaluation
from filliere.models import Cours, Filiere, Module
from groupe.models import Eleve, Groupe


class Command(BaseCommand):
    help = "Cree des donnees d'exemple pour tester l'application."

    def handle(self, *args, **options):
        User = get_user_model()
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin123")
            admin.save()

        filiere, _ = Filiere.objects.update_or_create(
            id_filiere="FIL-DEV",
            defaults={"nom": "Developpement Digital"},
        )
        module, _ = Module.objects.update_or_create(
            id_module="MOD-WEB",
            defaults={"nom": "Technologies Web", "filiere": filiere},
        )
        cours_html, _ = Cours.objects.update_or_create(
            id_cours="CRS-HTML",
            defaults={"nom": "HTML CSS", "module": module},
        )
        Cours.objects.update_or_create(
            id_cours="CRS-REACT",
            defaults={"nom": "ReactJS", "module": module},
        )

        groupe, _ = Groupe.objects.update_or_create(
            id_groupe="GRP-DEV-101",
            defaults={"nom": "DEV101", "filiere": filiere},
        )

        eleves = [
            ("NAT001", "ELV001", "Alaoui", "Youssef", "youssef.alaoui@example.com"),
            ("NAT002", "ELV002", "Benali", "Sara", "sara.benali@example.com"),
            ("NAT003", "ELV003", "El Amrani", "Nora", "nora.elamrani@example.com"),
        ]
        for id_national, id_eleve, nom, prenom, email in eleves:
            Eleve.objects.update_or_create(
                id_eleve=id_eleve,
                defaults={
                    "id_national": id_national,
                    "nom": nom,
                    "prenom": prenom,
                    "email": email,
                    "telephone": "0600000000",
                    "date_naissance": "2004-01-15",
                    "eleve_statut": "A",
                    "groupe": groupe,
                },
            )

        enseignant, _ = Enseignant.objects.update_or_create(
            id_enseignant="ENS001",
            defaults={
                "nom": "Mansouri",
                "prenom": "Karim",
                "email": "karim.mansouri@example.com",
                "enseignant_statut": "A",
            },
        )

        Evaluation.objects.update_or_create(
            titre="Controle ReactJS",
            defaults={
                "type_evaluation": "C",
                "date_evaluation": "2026-05-15",
                "filiere": filiere,
                "module": module,
                "cours": cours_html,
                "groupe": groupe,
                "enseignant": enseignant,
            },
        )

        self.stdout.write(self.style.SUCCESS("Donnees d'exemple creees."))
        self.stdout.write("Compte admin: admin / admin123")
