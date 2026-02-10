# Cohort360 — Plateforme de Gestion de Prescriptions Médicales

> Application fullstack de gestion de prescriptions médicales avec moteur de recherche de cohortes de patients, construite autour du standard **HL7-FHIR** pour le domaine de la santé numérique.

---

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Backend — API REST Django](#backend--api-rest-django)
- [Frontend — React + TypeScript](#frontend--react--typescript)
- [Moteur de cohortes — Scala/Spark](#moteur-de-cohortes--scalaspark)
- [Stack technique](#stack-technique)
- [Auteur](#auteur)

---

## Présentation

Cohort360 est une plateforme médicale composée de trois modules complémentaires, conçue pour répondre aux besoins des établissements de santé en matière de gestion de prescriptions et d'analyse de cohortes de patients.

Le projet s'articule autour de trois axes :

| Module | Stack | Rôle |
|--------|-------|------|
| **Backend API** | Python, Django, DRF | API REST de gestion des prescriptions médicales |
| **Frontend** | React 19, TypeScript, Tailwind CSS 4 | Interface de consultation et de saisie des prescriptions |
| **Moteur de cohortes** | Scala 2.12, Spark 3.3, Solr 8 | Recherche de cohortes de patients sur des critères FHIR |

L'API et le frontend fonctionnent ensemble (le frontend consomme l'API Django). Le moteur de cohortes est un module indépendant dédié à l'analyse de données massives.

---

## Fonctionnalités

**Gestion des prescriptions**
- CRUD complet sur les prescriptions (création, consultation, modification)
- Liaison Patient ↔ Médicament avec dates de début/fin et statut
- Filtres avancés : par patient, médicament, statut, plages de dates
- Validation métier (cohérence des dates, statuts autorisés)
- Données de démonstration réalistes (30+ prescriptions)

**Interface utilisateur**
- Tableau interactif avec colonnes triables
- Filtres dynamiques (patient, médicament, statut, dates)
- Formulaire de création avec validation côté client
- Badges colorés pour la visualisation des statuts
- Design responsive avec thème médical professionnel

**Moteur de cohortes**
- Traduction dynamique des critères FHIR en requêtes Solr
- Logique d'inclusion/exclusion avec jointures Spark
- Filtrage par périmètre organisationnel
- Support de tous les préfixes FHIR (ge, gt, le, lt)

---

## Architecture

```
.
├── backend/                         # API REST Django
│   ├── config/                      # Configuration Django (settings, urls)
│   ├── medical/                     # Application principale
│   │   ├── models.py                # Modèles Patient, Medication, Prescription
│   │   ├── serializers.py           # Serializers DRF avec validation
│   │   ├── views.py                 # ViewSets CRUD
│   │   ├── filters.py               # Filtres avancés (dates, statut, patient)
│   │   ├── urls.py                  # Routage automatique DRF
│   │   ├── tests/test_api.py        # 23 tests unitaires
│   │   └── management/commands/     # Commande de seed
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                        # Interface React + TypeScript
│   └── frontend/
│       ├── src/
│       │   ├── pages/               # Pages (PrescriptionsPage)
│       │   ├── components/          # Composants réutilisables
│       │   ├── hooks/               # Custom hooks (useApi)
│       │   ├── api/                 # Client HTTP Axios
│       │   └── types/               # Types TypeScript
│       ├── package.json
│       └── vite.config.ts
│
└── cohort-engine/                   # Moteur de cohortes Scala/Spark
    ├── src/main/scala/com/exercise/
    │   ├── engine/                  # CohortSearchEngine (coeur du moteur)
    │   ├── model/                   # Modèle SearchCriteria
    │   └── utils/                   # Connecteur Solr
    ├── src/test/scala/              # Tests unitaires
    ├── docker-compose.yml           # Solr en conteneur
    ├── init_solr.sh                 # Initialisation des données
    └── build.sbt
```

---

## Prérequis

| Outil | Version | Module |
|-------|---------|--------|
| **Python** | 3.10+ | Backend API |
| **Node.js** | 18+ | Frontend |
| **npm** | 9+ | Frontend |
| **Java JDK** | 17+ | Moteur de cohortes |
| **sbt** | 1.9+ | Moteur de cohortes |
| **Docker** & **Docker Compose** | 20+ | Moteur de cohortes (Solr) |

---

## Backend — API REST Django

### Installation

```bash
cd Exercice_Django

python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

pip install -r requirements.txt

python manage.py migrate

# Charger les données de démonstration
python manage.py seed_demo
```

### Lancement

```bash
python manage.py runserver
```

Le serveur démarre sur **http://localhost:8000**. L'API est accessible sous `/api/`.

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/Patient` | Liste des patients |
| `GET` | `/api/Patient/{id}` | Détail d'un patient |
| `GET` | `/api/Medication` | Liste des médicaments |
| `GET` | `/api/Medication/{id}` | Détail d'un médicament |
| `GET` | `/api/Prescription` | Liste des prescriptions (filtrable) |
| `GET` | `/api/Prescription/{id}` | Détail d'une prescription |
| `POST` | `/api/Prescription` | Créer une prescription |
| `PUT` | `/api/Prescription/{id}` | Mise à jour complète |
| `PATCH` | `/api/Prescription/{id}` | Mise à jour partielle |

### Filtres

Les prescriptions peuvent être filtrées via query parameters :

```
GET /api/Prescription?patient=1&status=active
GET /api/Prescription?medication=3&date_debut__gte=2025-01-01
GET /api/Prescription?date_fin__lte=2025-12-31&status=completed
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `patient` | int | ID du patient |
| `medication` | int | ID du médicament |
| `status` | string | `active`, `completed`, `cancelled`, `suspended` |
| `date_debut__gte` | date | Date de début >= |
| `date_debut__lte` | date | Date de début <= |
| `date_fin__gte` | date | Date de fin >= |
| `date_fin__lte` | date | Date de fin <= |

### Validation métier

- La **date de fin** doit être postérieure à la **date de début**
- Le **statut** doit être une valeur autorisée
- Les champs `patient` et `medication` sont obligatoires

### Tests

```bash
python manage.py test medical.tests.test_api -v 2
```

23 tests couvrant le CRUD, les filtres, la validation et les cas d'erreur.

---

## Frontend — React + TypeScript

### Installation

```bash
cd Exercice_Front/frontend

npm install
```

### Lancement

```bash
# Le backend Django doit tourner sur le port 8000
npm run dev
```

L'application démarre sur **http://localhost:5173**.

### Fonctionnalités de l'interface

**Tableau des prescriptions** — Colonnes triables (patient, médicament, dates, statut) avec badges colorés pour la visualisation rapide des statuts et chargement asynchrone.

**Filtres dynamiques** — Recherche par patient et médicament via dropdowns, filtre par statut et par plage de dates. Les filtres se combinent entre eux.

**Formulaire de création** — Sélection du patient et du médicament, choix des dates et du statut, champ commentaire optionnel, avec validation côté client.

### Architecture des composants

```
src/
├── api/client.ts              # Client Axios configuré
├── types/index.ts             # Interfaces TypeScript
├── hooks/useApi.ts            # Custom hooks React Query
├── components/
│   ├── PrescriptionTable.tsx  # Tableau des prescriptions
│   ├── PrescriptionFiltersBar.tsx  # Barre de filtres
│   ├── CreatePrescriptionForm.tsx  # Formulaire de création
│   └── StatusBadge.tsx        # Badge de statut coloré
└── pages/
    └── PrescriptionsPage.tsx  # Page principale
```

### Build de production

```bash
npm run build
```

---

## Moteur de cohortes — Scala/Spark

### Installation

```bash
cd Exercice_scala_spark

# Démarrer Solr
docker-compose up -d

# Initialiser les données (attendre ~10s que Solr soit prêt)
chmod +x init_solr.sh
./init_solr.sh

cp .env.example .env
```

### Lancement

```bash
sbt run
```

Le moteur charge les critères depuis `query.json`, exécute la recherche et retourne le nombre de patients correspondants.

### Fonctionnement

Le moteur fonctionne en 4 étapes :

**1. Parsing des critères FHIR** — Traduction des searchParams en filtres Solr :

| Préfixe FHIR | Signification | Exemple | Filtre Solr |
|---------------|---------------|---------|-------------|
| `ge` | >= | `birthDate=ge2005-01-01` | `birthDate:[2005-01-01T00:00:00Z TO *]` |
| `gt` | > | `birthDate=gt2005-01-01` | `birthDate:{2005-01-01T00:00:00Z TO *}` |
| `le` | <= | `length=le11` | `length:[* TO 11]` |
| `lt` | < | `length=lt12` | `length:[* TO 11]` |
| *(aucun)* | = | `gender=male` | `gender:male` |

**2. Chargement Solr** — Mapping dynamique Resource FHIR → Collection Solr (Patient → `patientAphp`, Encounter → `encounterAphp`, etc.)

**3. Inclusion / Exclusion** — Les critères `Include=true` sont intersectés (inner join Spark), les critères `Include=false` sont exclus (left anti join).

**4. Filtrage par périmètre** — Seuls les patients ayant un Encounter dans l'organisation spécifiée sont conservés.

### Tests

```bash
sbt test
```

### Arrêter Solr

```bash
docker-compose down
```

---

## Stack technique

| Catégorie | Technologies |
|-----------|-------------|
| **Backend** | Python 3.10+, Django 4.2+, Django REST Framework, django-filter |
| **Frontend** | React 19, TypeScript 5.9, Tailwind CSS 4, Vite 7, React Query, Axios |
| **Big Data** | Scala 2.12, Apache Spark 3.3, Apache Solr 8.11 |
| **Tests** | unittest (Django), ScalaTest |
| **Infra** | Docker, Docker Compose |

---

## Auteur

**Cheikhou Dansokho** — Développeur Fullstack

- GitHub : [@cdansokho](https://github.com/cdansokho)
