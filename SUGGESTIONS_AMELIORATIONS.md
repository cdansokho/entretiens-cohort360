# Idées d’améliorations pertinentes — Cohort360

> Pistes pour aller plus loin (entretien, démo, passage en prod).

---

## Backend (Exercice_Django)

| Priorité | Action | Intérêt |
|----------|--------|---------|
| **Haute** | **Documenter l’API (OpenAPI/Swagger)** — `drf-spectacular` ou `drf-yasg` pour exposer une doc interactive (`/schema/`, `/docs/`). | Montre le souci de l’intégration et de la maintenabilité. |
| **Haute** | **CORS** — Configurer `django-cors-headers` pour autoriser le front en dev (et lister les origines en prod). | Évite les blocages en local / démo. |
| **Moyenne** | **Variables d’environnement** — `python-dotenv` ou `.env` pour `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`. | Bonnes pratiques, préparation déploiement. |
| **Moyenne** | **Limiter le nombre de résultats** — `MAX_PAGE_SIZE` ou plafond sur `page_size` pour éviter des requêtes trop lourdes. | Sécurité / perf. |
| **Basse** | **Endpoint de santé** — `GET /health` ou `GET /api/health` qui renvoie 200 + version. | Utile pour du monitoring ou du load balancer. |

---

## Frontend (Exercice_Front)

| Priorité | Action | Intérêt |
|----------|--------|---------|
| **Haute** | **Error boundary** — Un composant React qui attrape les erreurs de rendu et affiche un message + bouton « Réessayer » au lieu d’un écran blanc. | Robustesse, UX en cas de bug. |
| **Haute** | **Gestion 404 / route inconnue** — Une page « Page non trouvée » si tu ajoutes un routeur plus tard, ou au moins un fallback. | Complétude de l’app. |
| **Moyenne** | **Indicateur de connexion API** — Petit indicateur (ex. point vert/rouge dans le header) ou toast si l’API est injoignable au chargement. | Rassure l’utilisateur en démo. |
| **Moyenne** | **Export CSV/Excel** — Bouton « Exporter » sur la liste des prescriptions (filtres appliqués) pour télécharger un fichier. | Très apprécié en contexte métier. |
| **Moyenne** | **Raccourcis clavier** — En plus de Ctrl+Shift+N : par ex. Échap pour fermer les modales (déjà fait), ou `/` pour focus recherche si tu ajoutes une barre de recherche globale. | Montre l’attention à l’UX. |
| **Basse** | **Mode sombre** — Toggle dark/light avec préférence système (`prefers-color-scheme`) + persistance en `localStorage`. | Bonus design. |
| **Basse** | **Tests front (Vitest + React Testing Library)** — Quelques tests sur un formulaire ou sur le SearchableSelect. | Montre la rigueur sur la qualité. |

---

## Qualité & livraison

| Priorité | Action | Intérêt |
|----------|--------|---------|
| **Haute** | **Lancer tout avec Docker Compose** — Un `docker-compose.yml` à la racine qui monte backend + frontend (build ou dev) + éventuellement le moteur Scala. | « Un seul `docker compose up` pour tout faire tourner » en entretien. |
| **Haute** | **README racine à jour** — Section « Démarrage rapide » avec les 2–3 commandes (backend, frontend, seed). Vérifier que les chemins `Exercice_Django` / `Exercice_Front` sont bien indiqués. | Premier contact du recruteur. |
| **Moyenne** | **.env.example à la racine** — Lister `API_URL` (front), `CORS_ALLOWED_ORIGINS` (backend), etc. | Facilite le clone et la démo. |
| **Moyenne** | **Script de vérification** — Petit script (bash ou npm) qui vérifie que le backend répond sur `/Patient` et que le front build sans erreur. | Rassure avant envoi du lien / démo. |

---

## Scala / Spark (optionnel)

| Priorité | Action | Intérêt |
|----------|--------|---------|
| **Moyenne** | **README Exercice_scala_spark** — Résumer en 5 lignes ce que fait le moteur (entrée JSON, sortie comptage, critères FHIR → Solr). | Montre que tu maîtrises le contexte. |
| **Basse** | **Exemple de requête** — Un `query.json` commenté ou un 2e fichier d’exemple avec un cas d’usage typique. | Aide à faire tourner une démo. |

---

## Pour l’entretien

- **Préparer une démo en 3 temps** : (1) liste + filtres, (2) création avec recherche patient/médicament, (3) édition + cohérence des dates. Montrer les messages d’erreur et la validation.
- **Anticiper les questions** : « Pourquoi ce choix technique ? » (ex. React Query, Tailwind, SearchableSelect custom vs lib), « Comment tu testerais en charge ? », « Comment tu déploierais ? ».
- **Avoir le backend seedé** avec `--patients 2500 --medications 150` pour montrer que la recherche et les filtres tiennent la route avec du volume.

---

## Récap par effort

- **Quick wins (< 1 h)** : CORS, `.env.example`, README démarrage rapide, endpoint health, error boundary.
- **Impact moyen (1–2 h)** : Doc API (Swagger), Docker Compose full stack, export CSV.
- **Plus long** : Tests front, mode sombre, script de vérification, polish Scala.

Tu peux piocher dans cette liste en fonction du temps et de ce que tu veux mettre en avant (backend, front, DevOps, data).
