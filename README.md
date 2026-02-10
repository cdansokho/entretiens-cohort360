# Cohort360 — Exercices Techniques Fullstack & Data

> Plateforme d'exercices techniques couvrant le développement fullstack dans le domaine de la santé numérique : **Backend Django**, **Frontend React/TypeScript** et **Moteur de cohortes Scala/Spark**.

---

## Table des matières

- [Présentation](#présentation)
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Exercice 1 — Backend Django REST API](#exercice-1--backend-django-rest-api)
- [Exercice 2 — Frontend React + TypeScript](#exercice-2--frontend-react--typescript)
- [Exercice 3 — Moteur de cohortes Scala/Spark](#exercice-3--moteur-de-cohortes-scalaspark)
- [Stack technique](#stack-technique)
- [Auteur](#auteur)

---

## Présentation

Ce dépôt contient trois exercices techniques indépendants, conçus autour du domaine de la **santé numérique** et du standard **HL7-FHIR**. Chaque exercice peut être installé et exécuté séparément.

| Exercice | Stack | Description |
|----------|-------|-------------|
| **Exercice_Django** | Python, Django, DRF | API REST de gestion de prescriptions médicales |
| **Exercice_Front** | React 19, TypeScript, Tailwind CSS 4 | Interface de consultation et de création de prescriptions |
| **Exercice_scala_spark** | Scala 2.12, Spark 3.3, Solr 8 | Moteur de recherche de cohortes de patients |

Les exercices **Backend Django** et **Frontend** sont liés : le frontend consomme l'API Django. L'exercice **Scala/Spark** est indépendant.

---

## Architecture du projet

```
.
├── Exercice_Django/                 # Backend — API REST Django
│   ├── config/                      # Configuration Django (settings, urls)
│   ├── medical/                     # Application principale
│   │   ├── models.py                # Modèles Patient, Medication, Prescription
│   │   ├── serializers.py           # Serializers DRF avec validation
│   │   ├── views.py                 # ViewSets CRUD
│   │   ├── filters.py               # Filtres avancés (dates, statut, patient)
│   │   ├── urls.py                  # Routage automatique DRF
│   │   ├── tests/test_api.py        # 23 tests unitaires
│   │   └── management/commands/     # Commande seed_demo
│   ├── requirements.txt
│   └── manage.py
│
├── Exercice_Front/                  # Frontend — React + TypeScript
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
└── Exercice_scala_spark/            # Big Data — Moteur de cohortes
    ├── src/main/scala/com/exercise/
    │   ├── engine/                  # CohortSearchEngine (coeur du moteur)
    │   ├── model/                   # Modèle SearchCriteria
    │   └── utils/                   # Connecteur Solr
    ├── src/test/scala/              # Tests unitaires Scala
    ├── docker-compose.yml           # Solr en conteneur
    ├── init_solr.sh                 # Script d'initialisation des données
    └── build.sbt
```

---

## Prérequis

| Outil | Version | Utilisé par |
|-------|---------|-------------|
| **Python** | 3.10+ | Exercice Django |
| **Node.js** | 18+ | Exercice Frontend |
| **npm** | 9+ | Exercice Frontend |
| **Java JDK** | 17+ | Exercice Scala/Spark |
| **sbt** | 1.9+ | Exercice Scala/Spark |
| **Docker** & **Docker Compose** | 20+ | Exercice Scala/Spark (Solr) |

---

## Exercice 1 — Backend Django REST API

### Description

API REST complète de gestion de **prescriptions médicales**, construite avec Django et Django REST Framework. L'API expose des endpoints CRUD pour les patients, les médicaments et les prescriptions, avec des filtres avancés et une validation métier.

### Installation

```bash
# 1. Se placer dans le répertoire
cd Exercice_Django

# 2. Créer un environnement virtuel
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Appliquer les migrations
python manage.py migrate

# 5. Charger les données de démonstration
python manage.py seed_demo
```

### Lancement

```bash
python manage.py runserver
```

Le serveur démarre sur **http://localhost:8000**. L'API est accessible sous `/api/`.

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/Patient` | Liste de tous les patients |
| `GET` | `/api/Patient/{id}` | Détail d'un patient |
| `GET` | `/api/Medication` | Liste de tous les médicaments |
| `GET` | `/api/Medication/{id}` | Détail d'un médicament |
| `GET` | `/api/Prescription` | Liste des prescriptions (avec filtres) |
| `GET` | `/api/Prescription/{id}` | Détail d'une prescription |
| `POST` | `/api/Prescription` | Créer une prescription |
| `PUT` | `/api/Prescription/{id}` | Mise à jour complète |
| `PATCH` | `/api/Prescription/{id}` | Mise à jour partielle |

### Filtres disponibles

Les prescriptions peuvent être filtrées via des query parameters :

```
GET /api/Prescription?patient=1&status=active
GET /api/Prescription?medication=3&date_debut__gte=2025-01-01
GET /api/Prescription?date_fin__lte=2025-12-31&status=completed
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `patient` | int | ID du patient |
| `medication` | int | ID du médicament |
| `status` | string | Statut : `active`, `completed`, `cancelled`, `suspended` |
| `date_debut__gte` | date | Date de début supérieure ou égale à |
| `date_debut__lte` | date | Date de début inférieure ou égale à |
| `date_fin__gte` | date | Date de fin supérieure ou égale à |
| `date_fin__lte` | date | Date de fin inférieure ou égale à |

### Validation métier

Le serializer applique les règles suivantes :
- La **date de fin** doit être postérieure à la **date de début**
- Le **statut** doit être l'une des valeurs autorisées (`active`, `completed`, `cancelled`, `suspended`)
- Les champs `patient` et `medication` sont obligatoires

### Lancer les tests

```bash
python manage.py test medical.tests.test_api -v 2
```

**Résultat attendu : 23 tests passent.**

---

## Exercice 2 — Frontend React + TypeScript

### Description

Interface web de consultation et de création de prescriptions médicales, construite avec **React 19**, **TypeScript** et **Tailwind CSS 4**. L'application consomme l'API Django de l'exercice 1.

### Installation

```bash
# 1. Se placer dans le répertoire
cd Exercice_Front/frontend

# 2. Installer les dépendances
npm install
```

### Lancement

```bash
# Assurez-vous que le backend Django tourne sur le port 8000
npm run dev
```

L'application démarre sur **http://localhost:5173**.

### Fonctionnalités

L'interface propose les fonctionnalités suivantes :

**Consultation des prescriptions**

Tableau complet avec colonnes triables (patient, médicament, dates, statut), badges colorés pour visualiser le statut de chaque prescription, et chargement asynchrone avec indicateurs de progression.

**Filtres avancés**

Recherche par patient et par médicament via des dropdowns, filtre par statut (active, terminée, annulée, suspendue), et filtre par plage de dates.

**Création de prescriptions**

Formulaire complet avec validation côté client, sélection du patient et du médicament, choix des dates et du statut, et champ commentaire optionnel.

### Architecture frontend

```
src/
├── api/client.ts              # Client Axios configuré
├── types/index.ts             # Interfaces TypeScript (Patient, Medication, Prescription)
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

Les fichiers de production sont générés dans le répertoire `dist/`.

---

## Exercice 3 — Moteur de cohortes Scala/Spark

### Description

Moteur de recherche de cohortes de patients utilisant **Apache Spark** et **Apache Solr**. Le moteur traduit des critères de recherche au format FHIR en requêtes Solr, puis applique une logique d'inclusion/exclusion pour identifier les patients correspondants.

### Installation

```bash
# 1. Se placer dans le répertoire
cd Exercice_scala_spark

# 2. Démarrer Solr via Docker
docker-compose up -d

# 3. Attendre que Solr soit prêt (~10 secondes), puis initialiser les données
chmod +x init_solr.sh
./init_solr.sh

# 4. Copier le fichier d'environnement
cp .env.example .env
```

### Lancement

```bash
sbt run
```

Le moteur charge la requête depuis `src/main/resources/query.json`, exécute la recherche de cohorte, et affiche le nombre de patients correspondants.

### Fonctionnement du moteur

Le `CohortSearchEngine` fonctionne en 4 étapes :

**Étape 1 — Parsing des critères FHIR**

Les `searchParams` au format FHIR sont traduits en filtres Solr. Les préfixes suivants sont supportés :

| Préfixe FHIR | Signification | Exemple | Filtre Solr généré |
|---------------|---------------|---------|-------------------|
| `ge` | Supérieur ou égal | `birthDate=ge2005-01-01` | `birthDate:[2005-01-01T00:00:00Z TO *]` |
| `gt` | Strictement supérieur | `birthDate=gt2005-01-01` | `birthDate:{2005-01-01T00:00:00Z TO *}` |
| `le` | Inférieur ou égal | `length=le11` | `length:[* TO 11]` |
| `lt` | Strictement inférieur | `length=lt12` | `length:[* TO 11]` |
| *(aucun)* | Égalité exacte | `gender=male` | `gender:male` |

**Étape 2 — Chargement depuis Solr**

Chaque critère est mappé dynamiquement à sa collection Solr :

| Resource FHIR | Collection Solr |
|---------------|----------------|
| Patient | `patientAphp` |
| Encounter | `encounterAphp` |
| DocumentReference | `documentReferenceAphp` |

**Étape 3 — Logique d'inclusion / exclusion**

Les critères avec `Include=true` sont intersectés via un inner join Spark. Les critères avec `Include=false` sont exclus via un left anti join. Cela permet de construire la cohorte progressivement, quel que soit le nombre de critères.

**Étape 4 — Filtrage par périmètre**

Les périmètres (organisations) filtrent les patients en ne conservant que ceux ayant au moins un `Encounter` dans l'organisation spécifiée.

### Exemple de requête

Le fichier `query.json` fourni recherche les patients masculins, actifs, nés après le 01/01/2005 (inclusion), ayant au moins un séjour de moins de 12 jours (inclusion), sans document mentionnant "cancer" (exclusion), dans le périmètre Organization/aphp-psl.

### Lancer les tests

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

