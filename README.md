# Student Evaluation Management System

Application web pour la generation automatique des fiches d'evaluation des eleves.

## Stack

- Backend: Django, Django REST Framework, Token Authentication
- Frontend: ReactJS, React Router, Axios, Vite
- Interface: francais
- Base de donnees par defaut: SQLite

## Pages principales

La barre laterale contient seulement:

- Tableau de bord
- Filieres
- Groupes
- Enseignants
- Evaluations
- Fiches d'evaluation

Les eleves sont geres dans le detail d'un groupe. Les modules et cours sont geres dans le detail d'une filiere.

## Regles metier

- Une filiere contient plusieurs modules.
- Un module contient au maximum 2 cours.
- Un groupe appartient a une filiere.
- Un groupe doit contenir au moins 2 eleves avant la generation de fiches.
- Une fiche est unique pour un couple eleve/evaluation.
- La generation cree une fiche par eleve du groupe selectionne.

## Installation backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Compte admin cree par les donnees d'exemple:

```text
admin / admin123
```

L'API est disponible sur:

```text
http://127.0.0.1:8000/api/
```

## Installation frontend

Dans un second terminal:

```bash
cd frontend
npm install
npm run dev
```

Interface:

```text
http://127.0.0.1:5173
```

Si le backend utilise une autre adresse, creer `frontend/.env`:

```text
VITE_API_URL=http://127.0.0.1:8000/api/
```

## Donnees d'exemple

La commande `python manage.py seed_data` cree:

- 1 filiere: Developpement Digital
- 1 module: Technologies Web
- 2 cours: HTML CSS, ReactJS
- 1 groupe: DEV101
- 3 eleves
- 1 enseignant
- 1 evaluation
- 1 compte administrateur

## Endpoints principaux

- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET|POST /api/filieres/`
- `GET|PUT|PATCH|DELETE /api/filieres/{id}/`
- `GET /api/filieres/{id}/modules/`
- `GET|POST /api/modules/`
- `GET /api/modules/?filiere={id}`
- `GET /api/modules/{id}/cours/`
- `GET|POST /api/cours/`
- `GET /api/cours/?module={id}`
- `GET|POST /api/groupes/`
- `GET /api/groupes/?filiere={id}`
- `GET /api/groupes/{id}/eleves/`
- `GET|POST /api/eleves/`
- `GET /api/eleves/?groupe={id}`
- `GET|POST /api/enseignants/`
- `GET|POST /api/evaluations/`
- `GET|POST /api/fiches/`
- `POST /api/fiches/generate/`

Toutes les routes API, sauf la connexion, demandent un utilisateur admin authentifie.

## Tests

```bash
cd backend
source .venv/bin/activate
python manage.py test
```

Les tests couvrent la limite de 2 cours par module, la generation avec au moins 2 eleves et l'absence de doublons.

## Base de donnees MySQL

Le backend utilise MySQL. Le driver `mysqlclient` est deja dans `backend/requirements.txt`.
Les valeurs par defaut pointent vers la base locale `FicheEval_db` avec l'utilisateur `jawad` et le mot de passe `0000`. Si votre configuration est differente, ajuster ces variables:

```bash
export DB_NAME=FicheEval_db
export DB_USER=jawad
export DB_PASSWORD=0000
export DB_HOST=127.0.0.1
export DB_PORT=3306
python manage.py migrate
python manage.py seed_data
```
