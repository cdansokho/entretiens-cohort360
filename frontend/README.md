# Frontend — React + TypeScript

Interface de consultation et de saisie des prescriptions médicales, construite avec React 19, TypeScript et Tailwind CSS 4.

## Prérequis

- Node.js 18+
- npm 9+
- Le backend Django doit tourner sur le port 8000

## Installation

```bash
cd frontend
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
- **Formulaire de création** — Sélection du patient et du médicament, choix des dates et du statut, validation côté client
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
