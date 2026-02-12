# Frontend — React + TypeScript

Interface de consultation et de saisie des prescriptions médicales, construite avec React 19, TypeScript et Tailwind CSS 4.

## Prérequis

- Node.js 18+
- npm 9+
- Le backend Django doit tourner sur le port 8000

## Installation

```bash
cd Exercice_Front
npm install
```

## Lancement

```bash
npm run dev
```

L'application démarre sur **http://localhost:5173**.

## Fonctionnalités

- **Tableau des prescriptions** — Colonnes triables avec badges colorés pour la visualisation rapide des statuts
- **Filtres dynamiques** — Recherche par patient, médicament, statut et plage de dates
- **Formulaire de création** — Sélection du patient et du médicament (avec barre de recherche), choix des dates et du statut, validation côté client
- **Export CSV / Excel** — Boutons « CSV » et « Excel » pour télécharger la liste des prescriptions (filtres appliqués)
- **Indicateur de connexion API** — Point vert/rouge dans le header selon la disponibilité du backend
- **Error boundary** — En cas d’erreur de rendu, affichage d’un message et bouton « Réessayer »
- **Page 404** — Route inconnue affiche « Page non trouvée » avec lien vers l’accueil
- **Chargement asynchrone** — React Query pour le data fetching avec cache automatique

## Stack

- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Vite 7
- React Query 5
- Axios

## Build de production

```bash
npm run build
```
