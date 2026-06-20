# Brouillons et Prévisualisation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre de sauvegarder un brouillon sans publier et de prévisualiser l'article avant publication.

**Architecture:** Ajout d'un champ `status: 'draft' | 'published'` dans Firestore. `addNews.js` expose deux nouvelles fonctions (`saveDraft`, `previewDraft`) basées sur une fonction interne `saveAsDraft()`. Les pages publiques filtrent côté client `status !== 'draft'`. L'admin affiche un badge BROUILLON et trie les drafts en premier.

**Tech Stack:** Vanilla JS ES modules, Firebase Firestore v11, CSS inline dans addNews.html, Dashboard.css pour le badge.

---

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `public/assets/js/addNews.js` | + `saveAsDraft()`, `saveDraft()`, `previewDraft()` ; `sendNewsFromDivs` ajoute `status: 'published'` |
| `public/addNews.html` | + boutons Brouillon et Prévisualiser avec spinners |
| `public/assets/js/accueil.js` | filtre client-side `status !== 'draft'` |
| `public/assets/js/news-list.js` | filtre client-side `status !== 'draft'` |
| `public/assets/css/Dashboard.css` | + `.badge-draft` |
| `public/assets/js/admin.js` | badge BROUILLON, KPI publiés uniquement, drafts en tête de liste |
| `public/admin.html` | titre section "Actualités" |

---

## Task 1 — addNews.js : saveDraft, previewDraft, status published

**Files:**
- Modify: `public/assets/js/addNews.js`

- [ ] **Ajouter `let draftSaved = false` après `let sectionCount = 0`**

```js
let draftSaved = false
```

- [ ] **Ajouter la fonction interne `saveAsDraft()` avant `window.GiveUpNews`**

```js
async function saveAsDraft() {
  const title  = document.getElementById('TitreInput').value.trim()
  const resume = document.getElementById('ResumeInput').value.trim()
  const sections = Array.from(document.querySelectorAll('.section-card')).map(card => ({
    type:    card.dataset.type,
    content: card._quill?.root.innerHTML ?? '',
    imgUrl:  card.dataset.imgUrl || null
  }))
  const data = { title, resume, coverImg: coverImgUrl, sections, status: 'draft' }
  if (!isEdit && !draftSaved) data.createdAt = serverTimestamp()
  await setDoc(doc(db, 'news', newsId), data, { merge: true })
  draftSaved = true
  if (!isEdit) history.replaceState(null, '', `?id=${newsId}`)
}
```

- [ ] **Ajouter `window.saveDraft` après `saveAsDraft()`**

```js
window.saveDraft = async () => {
  if (!document.getElementById('TitreInput').value.trim()) {
    alert('Le titre est requis.'); document.getElementById('TitreInput').focus(); return
  }
  const label   = document.getElementById('draft-label')
  const spinner = document.getElementById('draft-spinner')
  label.style.display   = 'none'
  spinner.style.display = 'inline-block'
  try {
    await saveAsDraft()
  } catch (e) {
    console.error(e); alert('Erreur lors de la sauvegarde du brouillon.')
  } finally {
    label.style.display   = 'inline'
    spinner.style.display = 'none'
  }
}
```

- [ ] **Ajouter `window.previewDraft` après `window.saveDraft`**

```js
window.previewDraft = async () => {
  if (!document.getElementById('TitreInput').value.trim()) {
    alert('Le titre est requis.'); document.getElementById('TitreInput').focus(); return
  }
  const label   = document.getElementById('preview-label')
  const spinner = document.getElementById('preview-spinner')
  label.style.display   = 'none'
  spinner.style.display = 'inline-block'
  try {
    await saveAsDraft()
    window.open(`news.html?id=${newsId}`, '_blank')
  } catch (e) {
    console.error(e); alert('Erreur lors de la prévisualisation.')
  } finally {
    label.style.display   = 'inline'
    spinner.style.display = 'none'
  }
}
```

- [ ] **Modifier `sendNewsFromDivs` : ajouter `status: 'published'` et gérer `draftSaved`**

Remplacer :
```js
const data = { title, resume, coverImg: coverImgUrl, sections }
if (!isEdit) data.createdAt = serverTimestamp()
await setDoc(doc(db, 'news', newsId), data, { merge: isEdit })
```
Par :
```js
const data = { title, resume, coverImg: coverImgUrl, sections, status: 'published' }
if (!isEdit && !draftSaved) data.createdAt = serverTimestamp()
await setDoc(doc(db, 'news', newsId), data, { merge: true })
```

- [ ] **Modifier `loadExistingNews` : adapter les boutons selon le statut**

Remplacer :
```js
document.getElementById('publish-label').textContent = 'Mettre à jour'
document.querySelector('#topbar h1').innerHTML = `...Modifier l'actualité`
```
Par :
```js
if (news.status === 'draft') {
  document.getElementById('publish-label').textContent = 'Publier'
} else {
  document.getElementById('btn-draft').style.display    = 'none'
  document.getElementById('btn-preview').style.display  = 'none'
  document.getElementById('publish-label').textContent  = 'Mettre à jour'
}
document.querySelector('#topbar h1').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Modifier l'actualité`
```

- [ ] **Commit**

```bash
git add public/assets/js/addNews.js
git commit -m "feat: saveDraft, previewDraft, status published dans addNews"
```

---

## Task 2 — addNews.html : boutons Brouillon et Prévisualiser

**Files:**
- Modify: `public/addNews.html`

- [ ] **Remplacer le bloc `.topbar-actions` existant**

Remplacer :
```html
<div class="topbar-actions">
    <button class="btn btn-ghost" onclick="GiveUpNews()">Abandonner</button>
    <button class="btn btn-publish" onclick="sendNewsFromDivs()">
        <span id="publish-label">Publier</span>
        <span class="spinner" id="publish-spinner"></span>
    </button>
</div>
```
Par :
```html
<div class="topbar-actions">
    <button class="btn btn-ghost" onclick="GiveUpNews()">Abandonner</button>
    <button id="btn-draft" class="btn btn-ghost" onclick="saveDraft()">
        <span id="draft-label">Brouillon</span>
        <span class="spinner" id="draft-spinner"></span>
    </button>
    <button id="btn-preview" class="btn btn-ghost" onclick="previewDraft()">
        <span id="preview-label">Prévisualiser</span>
        <span class="spinner" id="preview-spinner"></span>
    </button>
    <button class="btn btn-publish" onclick="sendNewsFromDivs()">
        <span id="publish-label">Publier</span>
        <span class="spinner" id="publish-spinner"></span>
    </button>
</div>
```

- [ ] **Commit**

```bash
git add public/addNews.html
git commit -m "feat: boutons Brouillon et Prévisualiser dans la topbar"
```

---

## Task 3 — accueil.js + news-list.js : filtre status !== 'draft'

**Files:**
- Modify: `public/assets/js/accueil.js`
- Modify: `public/assets/js/news-list.js`

- [ ] **accueil.js — filtrer les drafts après getDocs**

Dans `loadNews()`, remplacer :
```js
const allDocs = snap.docs
const hasMore = allDocs.length > 3
const newsList = allDocs.slice(0, 3).map(d => ({ id: d.id, ...d.data() }))
```
Par :
```js
const allDocs = snap.docs.filter(d => d.data().status !== 'draft')
const hasMore = allDocs.length > 3
const newsList = allDocs.slice(0, 3).map(d => ({ id: d.id, ...d.data() }))
```

- [ ] **news-list.js — filtrer les drafts après getDocs**

Dans la boucle `snap.forEach(d => {` remplacer l'ensemble par un filtrage préalable. Remplacer :
```js
snap.forEach(d => {
  const news = d.data()
```
Par :
```js
snap.docs.filter(d => d.data().status !== 'draft').forEach(d => {
  const news = d.data()
```

- [ ] **Commit**

```bash
git add public/assets/js/accueil.js public/assets/js/news-list.js
git commit -m "feat: masquer les brouillons sur les pages publiques"
```

---

## Task 4 — Dashboard.css : badge BROUILLON

**Files:**
- Modify: `public/assets/css/Dashboard.css`

- [ ] **Ajouter `.badge-draft` à la fin du fichier**

```css
.badge-draft {
    display: inline-block;
    background: #f97316;
    color: white;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 10px;
    text-transform: uppercase;
    margin-right: 6px;
    vertical-align: middle;
}
```

- [ ] **Commit**

```bash
git add public/assets/css/Dashboard.css
git commit -m "feat: style badge BROUILLON dans le dashboard"
```

---

## Task 5 — admin.js : badge, KPI, tri drafts en tête

**Files:**
- Modify: `public/assets/js/admin.js`

- [ ] **Modifier `loadNews()` : tri drafts en premier, badge, KPI correct**

Remplacer le contenu de `loadNews()` à partir de `snap.forEach(d => {` :

```js
async function loadNews() {
  const container = document.getElementById('newsList')
  try {
    const snap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc')))

    const allDocs = snap.docs
    const publishedCount = allDocs.filter(d => d.data().status !== 'draft').length
    document.getElementById('kpi-news').textContent = publishedCount

    if (allDocs.length === 0) {
      container.innerHTML = '<p id="no-news-admin">Aucune actualité.</p>'
      return
    }

    const sorted = [
      ...allDocs.filter(d => d.data().status === 'draft'),
      ...allDocs.filter(d => d.data().status !== 'draft')
    ]

    sorted.forEach(d => {
      const news = d.data()
      const isDraft = news.status === 'draft'
      const date = news.createdAt?.toDate?.()
      const dateStr = date
        ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''

      const item = document.createElement('div')
      item.className = 'news-admin-item'
      item.innerHTML = `
        <img class="news-admin-img" src="${news.coverImg || ''}" alt="" onerror="this.style.display='none'">
        <div class="news-admin-info">
          <div class="news-admin-title">${news.title}</div>
          <div class="news-admin-date">${isDraft ? '<span class="badge-draft">Brouillon</span>' : ''}${dateStr}</div>
        </div>
        <div class="news-admin-actions">
          <a href="news.html?id=${d.id}" class="btn-view" target="_blank">Voir</a>
          <a href="addNews.html?id=${d.id}" class="btn-view">Modifier</a>
          <button class="btn-delete" data-id="${d.id}">Supprimer</button>
        </div>
      `
      item.querySelector('.btn-delete').addEventListener('click', () => deleteNews(d.id, item))
      container.appendChild(item)
    })
  } catch (e) {
    console.error('Erreur news :', e)
    container.innerHTML = '<p id="no-news-admin">Erreur lors du chargement.</p>'
  }
}
```

- [ ] **Commit**

```bash
git add public/assets/js/admin.js
git commit -m "feat: badge brouillon, KPI publiés, tri drafts dans admin"
```

---

## Task 6 — admin.html : titre section

**Files:**
- Modify: `public/admin.html`

- [ ] **Renommer le titre de section**

Remplacer :
```html
<h2>Actualités publiées</h2>
```
Par :
```html
<h2>Actualités</h2>
```

- [ ] **Commit + push final**

```bash
git add public/admin.html
git commit -m "feat: brouillons et prévisualisation — complet"
git push
```
