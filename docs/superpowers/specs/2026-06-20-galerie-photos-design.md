---
name: galerie-photos
description: Galerie photos avec albums par événement, upload Cloudinary, lightbox visiteurs
metadata:
  type: project
---

# Galerie Photos — Design

## Modèle de données — Firestore collection `galerie`

```
galerie/{albumId}: {
  eventId:    string,     // référence à events/{id}
  eventTitle: string,     // dénormalisé
  eventDate:  Timestamp,  // dénormalisé pour tri
  photos:     string[],   // URLs Cloudinary
  createdAt:  Timestamp
}
```

Un album par événement. Photos uploadées dans `gncotentin/galerie/<albumId>/` sur Cloudinary.

## Fichiers nouveaux

| Fichier | Rôle |
|---|---|
| `public/galerie.html` | Page visiteurs — liste albums + vue album + lightbox |
| `public/assets/js/galerie.js` | Logique liste/album/lightbox |
| `public/assets/css/Galerie.css` | Styles |
| `public/addGalerie.html` | Admin — créer/gérer un album |
| `public/assets/js/addGalerie.js` | Upload, suppression, sauvegarde Firestore |

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `public/admin.html` | Section "Galerie" |
| `public/assets/js/admin.js` | `loadGalerie()` + `deleteAlbum()` |
| `public/assets/js/ui.js` | Bouton "Galerie" visiteur + dropdown admin |

## galerie.html — page visiteurs

**Vue liste (défaut) :**
- Grid de cards — une par album
- Card : photo couverture (1ère photo), titre event, date, nombre de photos
- Clic → `?album=<albumId>` charge la vue album

**Vue album (`?album=<albumId>`) :**
- Fil d'Ariane : Accueil › Galerie › [Titre event]
- Grid de toutes les photos de l'album
- Bouton "← Retour à la galerie"

**Lightbox :**
- S'ouvre au clic sur une photo
- Navigation ← → (touches clavier + boutons)
- Fermeture via clic en dehors ou touche Échap
- Pas de lib externe — implémentation native

## addGalerie.html — admin

1. Dropdown sélection événement (chargé depuis Firestore `events`)
2. Si album existant pour cet event → chargé automatiquement
3. Zone d'upload multi-photos (`<input multiple accept="image/*">`)
4. Spinner pendant upload Cloudinary (un par photo, en parallèle)
5. Grille des photos uploadées avec bouton × par photo (suppression)
6. Sauvegarde Firestore à chaque action (upload ou suppression)

## admin.html / admin.js

Nouvelle section "Galerie" :
- Liste des albums (titre event + nb photos + date)
- Bouton "Gérer" → `addGalerie.html?id=<albumId>`
- Bouton "+ Nouvel album" → `addGalerie.html`

## ui.js

- Nav visiteur : bouton "Galerie" → `galerie.html`
- Nav admin dropdown : ajout "Nouvel album" → `addGalerie.html`
