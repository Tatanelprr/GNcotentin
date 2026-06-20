# Galerie Photos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Galerie photos avec albums par événement, upload Cloudinary côté admin, lightbox côté visiteurs.

**Architecture:** Collection Firestore `galerie` (un doc par album, tableau d'URLs Cloudinary). Page visiteurs `galerie.html` gère liste d'albums + vue album + lightbox en JS pur. Page admin `addGalerie.html` permet upload multiple et suppression par photo.

**Tech Stack:** Vanilla JS ES modules, Firebase Firestore v11, Cloudinary (upload preset existant), CSS natif, lightbox sans lib externe.

---

## Task 1 — Galerie.css

**Files:**
- Create: `public/assets/css/Galerie.css`

- [ ] **Créer le fichier**

```css
:root { --primary: rgb(97,0,0); --bg: #f4f1f0; --text: #1a1a1a; --text-muted: #666; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); font-family: Arial, sans-serif; overflow-x: hidden; }
#header { margin-bottom: 0 !important; }

#galerie-nav { background: white; border-bottom: 1px solid #e8e0e0; padding: 16px 32px; display: flex; align-items: center; gap: 8px; font-size: 15px; color: #aaa; }
#galerie-nav a { color: var(--primary); text-decoration: none; font-weight: bold; }
#galerie-nav a:hover { text-decoration: underline; }
#galerie-nav .sep { color: #ccc; }

#galerie-container { max-width: 1200px; margin: 0 auto; padding: 36px 24px 60px; }
#galerie-page-title { font-family: Impact, Arial, sans-serif; color: var(--primary); font-size: 36px; margin: 0 0 32px; text-align: left; }

#albums-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.album-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 2px solid transparent; }
.album-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); border-color: var(--primary); }
.album-cover { width: 100%; height: 200px; object-fit: cover; display: block; background: #ddd; }
.album-cover-placeholder { width: 100%; height: 200px; background: #f0e8e8; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 48px; }
.album-info { padding: 16px; }
.album-event-title { font-weight: bold; font-size: 16px; color: var(--text); margin: 0 0 4px; }
.album-meta { font-size: 13px; color: var(--text-muted); margin: 0; }

#album-view { display: none; }
#album-back { display: inline-flex; align-items: center; gap: 6px; color: var(--primary); font-weight: bold; font-size: 14px; cursor: pointer; margin-bottom: 20px; background: none; border: none; padding: 0; font-family: Arial, sans-serif; }
#album-back:hover { text-decoration: underline; }
#album-title { font-family: Impact, Arial, sans-serif; color: var(--primary); font-size: 28px; margin: 0 0 6px; }
#album-subtitle { font-size: 14px; color: var(--text-muted); margin: 0 0 24px; }
#album-photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.album-photo { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
.album-photo:hover { opacity: 0.85; transform: scale(1.02); }

.galerie-empty { text-align: center; color: var(--text-muted); padding: 60px 0; font-size: 15px; }

#lightbox { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 2000; align-items: center; justify-content: center; }
#lightbox.open { display: flex; }
#lightbox-img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 4px; }
#lightbox-close { position: absolute; top: 20px; right: 24px; color: white; font-size: 36px; cursor: pointer; background: none; border: none; line-height: 1; opacity: 0.7; }
#lightbox-close:hover { opacity: 1; }
#lightbox-prev, #lightbox-next { position: absolute; top: 50%; transform: translateY(-50%); color: white; font-size: 28px; cursor: pointer; background: rgba(255,255,255,0.12); border: none; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
#lightbox-prev { left: 16px; }
#lightbox-next { right: 16px; }
#lightbox-prev:hover, #lightbox-next:hover { background: rgba(255,255,255,0.25); }
#lightbox-counter { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.65); font-size: 14px; font-family: Arial, sans-serif; }

@media (max-width: 600px) {
  #galerie-container { padding: 20px 16px 40px; }
  #galerie-nav { padding: 12px 16px; font-size: 13px; }
  #albums-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  #album-photos-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
  #lightbox-prev { left: 6px; }
  #lightbox-next { right: 6px; }
}
```

- [ ] **Commit**

```bash
git add public/assets/css/Galerie.css
git commit -m "feat: Galerie.css — styles galerie photos et lightbox"
```

---

## Task 2 — galerie.html

**Files:**
- Create: `public/galerie.html`

- [ ] **Créer le fichier**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galerie – GN Cotentin</title>
    <link rel="stylesheet" href="assets/css/Galerie.css">
</head>
<body>
    <div id="galerie-nav">
        <a href="accueil.html">Accueil</a>
        <span class="sep">›</span>
        <span id="nav-label">Galerie</span>
    </div>

    <div id="galerie-container">
        <div id="albums-view">
            <h1 id="galerie-page-title">Galerie</h1>
            <div id="albums-grid"></div>
        </div>

        <div id="album-view">
            <button id="album-back">← Retour à la galerie</button>
            <h1 id="album-title"></h1>
            <p id="album-subtitle"></p>
            <div id="album-photos-grid"></div>
        </div>
    </div>

    <div id="lightbox">
        <button id="lightbox-close">×</button>
        <button id="lightbox-prev">‹</button>
        <img id="lightbox-img" src="" alt="">
        <button id="lightbox-next">›</button>
        <span id="lightbox-counter"></span>
    </div>

    <script type="module" src="assets/js/ui.js"></script>
    <script type="module" src="assets/js/galerie.js"></script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add public/galerie.html
git commit -m "feat: galerie.html — structure page galerie"
```

---

## Task 3 — galerie.js

**Files:**
- Create: `public/assets/js/galerie.js`

- [ ] **Créer le fichier**

```js
import { db } from './firebase-init.js'
import { collection, query, orderBy, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

let currentPhotos = []
let lightboxIndex = 0

document.addEventListener('DOMContentLoaded', async () => {
  const albumId = new URLSearchParams(location.search).get('album')
  if (albumId) {
    await showAlbum(albumId)
  } else {
    await showAlbumsList()
  }
  initLightbox()
})

async function showAlbumsList() {
  document.getElementById('albums-view').style.display = 'block'
  document.getElementById('album-view').style.display  = 'none'
  const grid = document.getElementById('albums-grid')
  try {
    const snap = await getDocs(query(collection(db, 'galerie'), orderBy('eventDate', 'desc')))
    if (snap.empty) { grid.innerHTML = '<p class="galerie-empty">Aucun album disponible pour le moment.</p>'; return }
    snap.forEach(d => {
      const album   = d.data()
      const date    = album.eventDate?.toDate?.()
      const dateStr = date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
      const count   = album.photos?.length ?? 0
      const card    = document.createElement('div')
      card.className = 'album-card'
      card.onclick   = () => location.href = `galerie.html?album=${d.id}`
      card.innerHTML = count > 0
        ? `<img class="album-cover" src="${album.photos[0]}" alt="${album.eventTitle}" loading="lazy">
           <div class="album-info"><p class="album-event-title">${album.eventTitle}</p><p class="album-meta">${dateStr} · ${count} photo${count > 1 ? 's' : ''}</p></div>`
        : `<div class="album-cover-placeholder">📷</div>
           <div class="album-info"><p class="album-event-title">${album.eventTitle}</p><p class="album-meta">${dateStr} · Aucune photo</p></div>`
      grid.appendChild(card)
    })
  } catch (e) {
    console.error('Erreur galerie :', e)
    grid.innerHTML = '<p class="galerie-empty">Erreur lors du chargement.</p>'
  }
}

async function showAlbum(albumId) {
  document.getElementById('albums-view').style.display = 'none'
  document.getElementById('album-view').style.display  = 'block'
  try {
    const snap = await getDoc(doc(db, 'galerie', albumId))
    if (!snap.exists()) { location.href = 'galerie.html'; return }
    const album   = snap.data()
    const date    = album.eventDate?.toDate?.()
    const dateStr = date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    currentPhotos = album.photos ?? []
    document.title                                   = `${album.eventTitle} – Galerie GN Cotentin`
    document.getElementById('nav-label').textContent = album.eventTitle
    document.getElementById('album-title').textContent    = album.eventTitle
    document.getElementById('album-subtitle').textContent = `${dateStr} · ${currentPhotos.length} photo${currentPhotos.length > 1 ? 's' : ''}`
    const grid = document.getElementById('album-photos-grid')
    if (currentPhotos.length === 0) { grid.innerHTML = '<p class="galerie-empty">Aucune photo dans cet album.</p>'; return }
    grid.innerHTML = ''
    currentPhotos.forEach((url, i) => {
      const img = document.createElement('img')
      img.className = 'album-photo'
      img.src = url; img.loading = 'lazy'; img.alt = `Photo ${i + 1}`
      img.onclick = () => openLightbox(i)
      grid.appendChild(img)
    })
  } catch (e) { console.error('Erreur album :', e) }
  document.getElementById('album-back').onclick = () => location.href = 'galerie.html'
}

function initLightbox() {
  const lb      = document.getElementById('lightbox')
  const img     = document.getElementById('lightbox-img')
  const counter = document.getElementById('lightbox-counter')
  function update() { img.src = currentPhotos[lightboxIndex]; counter.textContent = `${lightboxIndex + 1} / ${currentPhotos.length}` }
  document.getElementById('lightbox-close').onclick = () => lb.classList.remove('open')
  document.getElementById('lightbox-prev').onclick  = () => { lightboxIndex = (lightboxIndex - 1 + currentPhotos.length) % currentPhotos.length; update() }
  document.getElementById('lightbox-next').onclick  = () => { lightboxIndex = (lightboxIndex + 1) % currentPhotos.length; update() }
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open') })
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return
    if (e.key === 'Escape')     lb.classList.remove('open')
    if (e.key === 'ArrowLeft')  { lightboxIndex = (lightboxIndex - 1 + currentPhotos.length) % currentPhotos.length; update() }
    if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % currentPhotos.length; update() }
  })
  window.openLightbox = (i) => { lightboxIndex = i; update(); lb.classList.add('open') }
}
```

- [ ] **Commit**

```bash
git add public/assets/js/galerie.js
git commit -m "feat: galerie.js — liste albums, vue album, lightbox clavier"
```

---

## Task 4 — addGalerie.html

**Files:**
- Create: `public/addGalerie.html`

- [ ] **Créer le fichier**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gérer un album – GN Cotentin</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f4f1f0; min-height: 100vh; display: flex; flex-direction: column; }
        #header { margin-bottom: 0 !important; }
        #topbar { background: rgb(97,0,0); color: white; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        #topbar h1 { font-size: 18px; font-family: Arial, sans-serif; font-weight: bold; }
        .btn { border: none; border-radius: 20px; padding: 8px 20px; font-size: 14px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .btn-ghost { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.5); }
        .btn-ghost:hover { border-color: white; }
        #form-layout { max-width: 800px; margin: 32px auto; padding: 0 24px 60px; display: flex; flex-direction: column; gap: 16px; }
        .form-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .form-card label { display: block; font-size: 12px; font-weight: bold; color: rgb(97,0,0); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .form-card select { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-family: Arial, sans-serif; background: white; cursor: pointer; }
        .form-card select:focus { outline: none; border-color: rgb(97,0,0); }
        .upload-zone { border: 2px dashed #ccc; border-radius: 10px; padding: 32px; text-align: center; cursor: pointer; transition: border-color 0.2s; color: #888; font-size: 14px; }
        .upload-zone:hover { border-color: rgb(97,0,0); color: rgb(97,0,0); }
        #upload-status { font-size: 13px; color: #888; margin-top: 10px; min-height: 18px; }
        #photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
        .photo-thumb { position: relative; aspect-ratio: 4/3; }
        .photo-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block; }
        .photo-delete { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.55); color: white; border: none; border-radius: 50%; width: 26px; height: 26px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .photo-delete:hover { background: rgb(97,0,0); }
        #no-photos { color: #aaa; font-size: 14px; margin: 0; }
        @media (max-width: 600px) { #form-layout { padding: 0 16px 40px; } }
    </style>
</head>
<body>
    <div id="topbar">
        <h1>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Gérer l'album
        </h1>
        <button class="btn btn-ghost" onclick="location.href='admin.html'">← Dashboard</button>
    </div>

    <div id="form-layout">
        <div class="form-card">
            <label>Événement associé *</label>
            <select id="event-select">
                <option value="">Choisir un événement…</option>
            </select>
        </div>

        <div class="form-card">
            <label>Ajouter des photos</label>
            <div class="upload-zone" onclick="document.getElementById('photo-input').click()">
                <div>Cliquez pour sélectionner des photos</div>
                <div style="font-size:12px;margin-top:4px;color:#aaa;">JPG, PNG, WEBP — plusieurs fichiers possibles</div>
            </div>
            <input type="file" id="photo-input" accept="image/*" multiple style="display:none" onchange="uploadPhotos(this)">
            <div id="upload-status"></div>
        </div>

        <div class="form-card">
            <label>Photos de l'album</label>
            <div id="photos-grid"><p id="no-photos">Sélectionnez un événement pour voir son album.</p></div>
        </div>
    </div>

    <script type="module" src="assets/js/ui.js"></script>
    <script type="module" src="assets/js/addGalerie.js"></script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add public/addGalerie.html
git commit -m "feat: addGalerie.html — interface admin gestion album"
```

---

## Task 5 — addGalerie.js

**Files:**
- Create: `public/assets/js/addGalerie.js`

- [ ] **Créer le fichier**

```js
import { auth, db } from './firebase-init.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'
import { collection, query, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'
import { uploadToCloudinary } from './cloudinary.js'

const editId = new URLSearchParams(location.search).get('id')
let currentAlbumId   = editId || null
let currentEventMeta = null  // { id, title, dateMs }

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = 'login.html'; return }
  await loadEventOptions()
  if (editId) await loadAlbumById(editId)
})

async function loadEventOptions() {
  const select = document.getElementById('event-select')
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc')))
    snap.forEach(d => {
      const opt = document.createElement('option')
      opt.value           = d.id
      opt.textContent     = d.data().title
      opt.dataset.title   = d.data().title
      opt.dataset.dateMs  = (d.data().date?.seconds ?? 0) * 1000
      select.appendChild(opt)
    })
  } catch (e) { console.error(e) }
  select.addEventListener('change', () => onEventSelect(select.value))
}

async function onEventSelect(eventId) {
  if (!eventId) {
    currentAlbumId = null; currentEventMeta = null
    document.getElementById('photos-grid').innerHTML = '<p id="no-photos">Sélectionnez un événement pour voir son album.</p>'
    return
  }
  const opt = document.getElementById('event-select').querySelector(`option[value="${eventId}"]`)
  currentEventMeta = { id: eventId, title: opt.dataset.title, dateMs: parseInt(opt.dataset.dateMs) }

  // Chercher album existant pour cet event
  const snap = await getDocs(query(collection(db, 'galerie')))
  let found = null
  snap.forEach(d => { if (d.data().eventId === eventId) found = d.id })

  if (found) {
    currentAlbumId = found
    history.replaceState(null, '', `?id=${found}`)
    await loadAlbumById(found)
  } else {
    currentAlbumId = null
    renderPhotos([])
  }
}

async function loadAlbumById(albumId) {
  const snap = await getDoc(doc(db, 'galerie', albumId))
  if (!snap.exists()) return
  const album = snap.data()
  currentAlbumId = albumId
  // Sélectionner l'event dans le dropdown
  document.getElementById('event-select').value = album.eventId
  if (!currentEventMeta) {
    currentEventMeta = { id: album.eventId, title: album.eventTitle, dateMs: album.eventDate?.toMillis?.() ?? 0 }
  }
  renderPhotos(album.photos ?? [])
}

function renderPhotos(photos) {
  const grid = document.getElementById('photos-grid')
  if (photos.length === 0) {
    grid.innerHTML = '<p id="no-photos">Aucune photo. Uploadez-en ci-dessus.</p>'
    return
  }
  grid.innerHTML = ''
  photos.forEach(url => {
    const wrap = document.createElement('div')
    wrap.className = 'photo-thumb'
    wrap.innerHTML = `<img src="${url}" loading="lazy" alt=""><button class="photo-delete" title="Supprimer">×</button>`
    wrap.querySelector('.photo-delete').onclick = () => deletePhoto(url)
    grid.appendChild(wrap)
  })
}

window.uploadPhotos = async (input) => {
  if (!input.files?.length) return
  if (!currentEventMeta) { alert('Sélectionnez un événement d\'abord.'); input.value = ''; return }

  const files  = Array.from(input.files)
  const status = document.getElementById('upload-status')
  status.textContent = `Upload de ${files.length} photo${files.length > 1 ? 's' : ''}…`

  if (!currentAlbumId) currentAlbumId = crypto.randomUUID()
  const folder = `gncotentin/galerie/${currentAlbumId}`

  try {
    const urls      = await Promise.all(files.map(f => uploadToCloudinary(f, folder)))
    const albumRef  = doc(db, 'galerie', currentAlbumId)
    const existing  = await getDoc(albumRef)

    if (existing.exists()) {
      await updateDoc(albumRef, { photos: arrayUnion(...urls) })
    } else {
      await setDoc(albumRef, {
        eventId:    currentEventMeta.id,
        eventTitle: currentEventMeta.title,
        eventDate:  new Date(currentEventMeta.dateMs),
        photos:     urls,
        createdAt:  serverTimestamp()
      })
      history.replaceState(null, '', `?id=${currentAlbumId}`)
    }

    const updated = await getDoc(albumRef)
    renderPhotos(updated.data().photos ?? [])
    status.textContent = `${files.length} photo${files.length > 1 ? 's ajoutées' : ' ajoutée'} ✓`
    setTimeout(() => { status.textContent = '' }, 3000)
  } catch (e) {
    console.error(e)
    status.textContent = 'Erreur lors de l\'upload.'
  }
  input.value = ''
}

async function deletePhoto(url) {
  if (!currentAlbumId || !confirm('Supprimer cette photo ?')) return
  try {
    await updateDoc(doc(db, 'galerie', currentAlbumId), { photos: arrayRemove(url) })
    const snap = await getDoc(doc(db, 'galerie', currentAlbumId))
    renderPhotos(snap.data().photos ?? [])
  } catch (e) { console.error(e); alert('Erreur lors de la suppression.') }
}
```

- [ ] **Commit**

```bash
git add public/assets/js/addGalerie.js
git commit -m "feat: addGalerie.js — upload multiple Cloudinary, suppression photo"
```

---

## Task 6 — admin.html + admin.js

**Files:**
- Modify: `public/admin.html`
- Modify: `public/assets/js/admin.js`

- [ ] **admin.html — ajouter section Galerie après la section Événements**

Avant le `</div>` fermant `#dashboard`, après la section Événements, ajouter :

```html
        <!-- Galerie -->
        <div class="dash-section">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--primary-light);">
                <h2 style="margin:0;border:none;padding:0;">Galerie</h2>
                <a href="addGalerie.html" class="btn-primary" style="font-size:14px;padding:8px 18px;">+ Nouvel album</a>
            </div>
            <div id="galerieList"></div>
        </div>
```

- [ ] **admin.js — ajouter loadGalerie dans loadDashboard**

Remplacer :
```js
async function loadDashboard() {
  await Promise.all([loadVisits(), loadNews(), loadEvents()])
}
```
Par :
```js
async function loadDashboard() {
  await Promise.all([loadVisits(), loadNews(), loadEvents(), loadGalerie()])
}
```

- [ ] **admin.js — ajouter loadGalerie et deleteAlbum à la fin du fichier**

```js
async function loadGalerie() {
  const container = document.getElementById('galerieList')
  try {
    const snap = await getDocs(query(collection(db, 'galerie'), orderBy('eventDate', 'desc')))
    if (snap.empty) { container.innerHTML = '<p id="no-news-admin">Aucun album.</p>'; return }
    snap.forEach(d => {
      const album   = d.data()
      const date    = album.eventDate?.toDate?.()
      const dateStr = date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
      const count   = album.photos?.length ?? 0
      const item    = document.createElement('div')
      item.className = 'news-admin-item'
      item.innerHTML = `
        <div class="news-admin-info">
          <div class="news-admin-title">${album.eventTitle}</div>
          <div class="news-admin-date">${dateStr} · ${count} photo${count > 1 ? 's' : ''}</div>
        </div>
        <div class="news-admin-actions">
          <a href="addGalerie.html?id=${d.id}" class="btn-view">Gérer</a>
          <button class="btn-delete" data-id="${d.id}">Supprimer</button>
        </div>
      `
      item.querySelector('.btn-delete').addEventListener('click', () => deleteAlbum(d.id, item))
      container.appendChild(item)
    })
  } catch (e) {
    console.error('Erreur galerie admin :', e)
    container.innerHTML = '<p id="no-news-admin">Erreur lors du chargement.</p>'
  }
}

async function deleteAlbum(id, element) {
  if (!confirm('Supprimer cet album et toutes ses photos ?')) return
  try {
    await deleteDoc(doc(db, 'galerie', id))
    element.remove()
  } catch (e) { console.error(e); alert('Erreur lors de la suppression.') }
}
```

- [ ] **Commit**

```bash
git add public/admin.html public/assets/js/admin.js
git commit -m "feat: section Galerie dans le dashboard admin"
```

---

## Task 7 — ui.js — boutons nav

**Files:**
- Modify: `public/assets/js/ui.js`

- [ ] **Ajouter "Galerie" dans le nav visiteur (entre Événements et Nous Contacter)**

Remplacer :
```js
        <button class="header_button" onclick="location.href='events.html'">Événements</button>
        <button class="header_button" onclick="location.href='mailto:Gcncotentin@gmail.com'">Nous Contacter</button>
```
Par :
```js
        <button class="header_button" onclick="location.href='events.html'">Événements</button>
        <button class="header_button" onclick="location.href='galerie.html'">Galerie</button>
        <button class="header_button" onclick="location.href='mailto:Gcncotentin@gmail.com'">Nous Contacter</button>
```

- [ ] **Ajouter "Nouvel album" dans le dropdown admin**

Remplacer :
```js
          <div class="dropdown-content">
            <a href="addNews.html">Nouvelle actualité</a>
            <a href="addEvent.html">Nouvel événement</a>
          </div>
```
Par :
```js
          <div class="dropdown-content">
            <a href="addNews.html">Nouvelle actualité</a>
            <a href="addEvent.html">Nouvel événement</a>
            <a href="addGalerie.html">Nouvel album</a>
          </div>
```

- [ ] **Commit + push final**

```bash
git add public/assets/js/ui.js
git commit -m "feat: bouton Galerie dans le nav visiteur et dropdown admin"
git push
```
