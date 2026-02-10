# Backend — API REST Django

API REST de gestion de prescriptions médicales, construite avec Django et Django REST Framework.

## Prérequis

- Python 3.10+
- pip

## Installation

```bash
cd backend

python3 -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

pip install -r requirements.txt

python manage.py migrate

# Charger les données de démonstration
python manage.py seed_demo
```

## Lancement

```bash
python manage.py runserver
```

Le serveur démarre sur **http://localhost:8000**.

## Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/Patient` | Liste des patients (filtres : `nom`, `prenom`, `date_naissance`) |
| `GET` | `/Medication` | Liste des médicaments (filtres : `code`, `label`, `status`) |
| `GET` | `/Prescription` | Liste des prescriptions (filtrable) |
| `POST` | `/Prescription` | Créer une prescription |
| `PUT` | `/Prescription/{id}` | Mise à jour complète |
| `PATCH` | `/Prescription/{id}` | Mise à jour partielle |

## Tests

```bash
python manage.py test medical.tests.test_api -v 2
```
