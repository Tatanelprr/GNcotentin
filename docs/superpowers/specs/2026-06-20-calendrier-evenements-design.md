---
name: calendrier-evenements
description: Calendrier d'événements côté visiteurs + gestion admin CRUD
metadata:
  type: project
---

# Calendrier d'Événements — Design

## Contexte

L'association organise des events géocaching (rencontres, sorties, CITO…). Aucune page dédiée n'existe pour les afficher. On ajoute une page calendrier pour les visiteurs et une interface CRUD pour l'admin.

## Modèle de données — Firestore collection `events`

| Champ | Type | Requis |
|---|---|---|
| `title` | string | ✓ |
| `date` | Timestamp | ✓ |
| `location` | string | ✓ |
| `description` | string | ✓ |
| `time` | string (`"HH:MM"`) | — |
| `link` | string (URL) | — |
| `createdAt` | Timestamp | ✓ |

## Fichiers nouveaux

| Fichier | Rôle |
|---|---|
| `public/events.html` | Page calendrier visiteurs |
| `public/assets/js/events.js` | Logique calendrier et affichage |
| `public/assets/css/Events.css` | Styles de la page events |
| `public/addEvent.html` | Formulaire admin créer/modifier event |
| `public/assets/js/addEvent.js` | Logique formulaire event |

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `public/accueil.html` | Nouvelle section `#Events` entre `#Assos` et `#Boutique` |
| `public/assets/js/accueil.js` | Charger les 3 prochains events |
| `public/assets/css/style.css` | Styles section events accueil |
| `public/admin.html` | Section "Événements" avec liste + bouton créer |
| `public/assets/js/admin.js` | Charger/supprimer les events |

## Page events.html (visiteurs)

Calendrier grille mensuelle :
- Navigation mois précédent / mois suivant
- En-tête : jours de la semaine (Lu Ma Me Je Ve Sa Di)
- Cases : numéro du jour, point rouge si un event existe ce jour
- Clic sur un jour avec event → fiche détail affichée sous la grille
- Fiche : titre, date formatée, heure si renseignée, lieu, description, lien externe si renseigné
- En dessous du calendrier : liste de tous les events du mois (triés par date)
- Styles cohérents avec le reste du site (rouge `rgb(97,0,0)`, police Arial/Impact)

## Section `#Events` dans accueil.html

Position : entre `#Assos` et `#Boutique`.

Contenu :
- HoriSepLine + titre h1 "Événements à venir"
- 3 prochains events (date ≥ aujourd'hui, triés par date ASC) en cards compactes
  - Date bien visible (jour + mois), titre, lieu
  - Clic → `events.html`
- Section masquée si aucun event à venir
- Lien "Voir tous les événements →" vers `events.html`

## Admin — addEvent.html

Formulaire simple (style topbar rouge identique à addNews.html) :
- Titre (input text, requis)
- Date (input date, requis)
- Heure (input time, optionnel)
- Lieu (input text, requis)
- Description (textarea, requis)
- Lien externe (input url, optionnel)
- Boutons : Abandonner / Publier (création) ou Mettre à jour (édition)
- URL `?id=<eventId>` pour le mode édition

## Admin — admin.html / admin.js

Nouvelle section "Événements" sous la section "Actualités" :
- Liste des events triés par date (plus récent en premier)
- Chaque item : titre + date + boutons Modifier / Supprimer
- Bouton "+ Nouvel événement" → `addEvent.html`
- Suppression avec confirmation

## Navigation

Lien "Événements" à ajouter dans `ui.js` (header/nav) si un menu de navigation existe — à vérifier à l'implémentation.
