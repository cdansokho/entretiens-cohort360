# Moteur de Cohortes — Scala / Spark / Solr

Moteur de recherche de cohortes de patients basé sur des critères FHIR R4, utilisant Apache Spark pour le traitement distribué et Apache Solr pour l'indexation des données médicales.

## Stack

- Scala 2.12
- Apache Spark 3.3
- Apache Solr 8.11
- Standard FHIR R4 — [documentation officielle](https://www.hl7.org/fhir/R4/index.html)

## Prérequis

- Docker & Docker Compose
- Java JDK 11 ou 17
- sbt 1.9+

### Installation de Java (via SDKMAN!)

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 17.0.10-tem
sdk use java 17.0.10-tem
```

### Installation de sbt

```bash
sdk install sbt
```

## Installation

```bash
cd Exercice_scala_spark

# Démarrer Solr (les données sont initialisées automatiquement au premier lancement)
docker compose up -d

# Configurer l'environnement
cp .env.example .env
```

**Vérifier Solr** : Ouvrir [http://localhost:8983](http://localhost:8983). Les collections `patientAphp`, `encounterAphp`, `documentReferenceAphp` et `organizationAphp` doivent être présentes.

## Lancement

```bash
sbt run
```

Le moteur charge les critères depuis `query.json`, exécute la recherche et retourne le nombre de patients correspondants.

## Fonctionnement

Le moteur fonctionne en 4 étapes :

1. **Parsing des critères FHIR** — Traduction des `searchParams` en filtres Solr natifs
2. **Chargement Solr** — Mapping dynamique Resource FHIR vers Collection Solr
3. **Inclusion / Exclusion** — Inner join (inclusion) et left anti join (exclusion) via Spark
4. **Filtrage par périmètre** — Conservation des patients ayant un Encounter dans l'organisation spécifiée

## Tests

```bash
sbt test
```

## Réinitialiser l'environnement

```bash
docker compose down -v
docker compose up -d
```

## Arrêter Solr

```bash
docker compose down
```
