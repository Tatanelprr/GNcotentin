---
name: brouillons-preview
description: Brouillons et prévisualisation avant publication dans l'interface admin
metadata:
  type: project
---

# Brouillons et Prévisualisation — Design

## Contexte

L'interface admin (`addNews.html`) ne permet actuellement que la publication directe. Il n'est pas possible de sauvegarder un article en cours de rédaction sans le publier immédiatement, ni de voir le rendu final avant publication.

## Modèle de données

Ajout d'un champ `status` dans chaque document Firestore de la collection `news` :

- `'published'` — article visible publiquement
- `'draft'` — brouillon, invisible hors admin

Les documents existants sans champ `status` sont traités comme `'published'` (pas de migration nécessaire).

## Fichiers modifiés

### `public/addNews.html`

Topbar : ajout de deux boutons entre "Abandonner" et "Publier".

```
[Abandonner]  [Brouillon]  [Prévisualiser]  [Publier]
```

- **Brouillon** (ghost blanc, outline) : sauvegarde `status: 'draft'`, reste sur la page. Si nouvel article, met à jour l'URL vers `?id=<newsId>` pour éviter de créer un doublon au prochain save.
- **Prévisualiser** (ghost blanc, outline) : même comportement que Brouillon, puis ouvre `news.html?id=<newsId>` dans un nouvel onglet.
- **Publier** (style actuel) : sauvegarde `status: 'published'`.

Validation minimale pour Brouillon et Prévisualiser : titre requis.

### `public/assets/js/addNews.js`

- `saveDraft()` : nouvelle fonction — collecte les sections, sauvegarde avec `status: 'draft'`, met à jour l'URL si nécessaire.
- `previewDraft()` : appelle `saveDraft()` puis ouvre `news.html?id=<newsId>` dans un nouvel onglet.
- `sendNewsFromDivs()` : ajoute `status: 'published'` explicitement au payload.
- Ajout de spinners sur les boutons Brouillon et Prévisualiser pendant le save.

### `public/admin.js`

- `loadNews()` : charge tous les docs, sépare `draft` et `published`.
- Drafts affichés en haut de la liste avec un badge `BROUILLON` (fond orange).
- KPI "Actualités publiées" ne compte que les docs `status === 'published'` (ou sans status).

### `public/admin.html`

- Section renommée "Actualités" (était "Actualités publiées").

### `public/assets/js/accueil.js`

- Filtre client-side après `getDocs` : `snap.docs.filter(d => d.data().status !== 'draft')`.

### `public/assets/js/news-list.js`

- Même filtre client-side.

### `public/news.html`

Aucun changement — lit le document par ID normalement, qu'il soit brouillon ou publié.

## Flux utilisateur

**Créer un brouillon :**
1. Admin ouvre `addNews.html`
2. Remplit le titre (et éventuellement d'autres champs)
3. Clique "Brouillon" → sauvegarde, URL mise à jour, reste sur la page
4. Peut fermer et revenir plus tard via "Modifier" dans le dashboard

**Prévisualiser :**
1. Depuis l'éditeur, clique "Prévisualiser"
2. L'article est sauvegardé en brouillon
3. `news.html?id=<id>` s'ouvre dans un nouvel onglet — rendu identique à la publication
4. L'admin revient sur l'onglet éditeur, continue d'éditer ou publie

**Publier un brouillon :**
1. Depuis le dashboard, clique "Modifier" sur un brouillon
2. Dans l'éditeur, clique "Publier" → `status` passe à `'published'`

## Backward compatibility

- Articles sans `status` : traités comme `published` dans accueil, news-list et admin (KPI).
- Aucune migration Firestore requise.
