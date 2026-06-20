# Calendrier Événements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Page calendrier visiteurs + section accueil + CRUD admin pour les événements de l'association.

**Architecture:** Nouvelle collection Firestore `events`. Page `events.html` avec grille calendrier mensuelle. Section `#Events` dans `accueil.html` (3 prochains events). Interface admin `addEvent.html` pour créer/modifier. Section "Événements" dans `admin.html`.

**Tech Stack:** Vanilla JS ES modules, Firebase Firestore v11, CSS inline dans les pages admin, fichier `Events.css` pour la page visiteurs.

---

## Task 1 — Events.css

**Files:**
- Create: `public/assets/css/Events.css`

- [ ] **Créer le fichier**

```css
:root { --primary: rgb(97,0,0); --bg: #f4f1f0; --text: #1a1a1a; --text-muted: #666; }
* { box-sizing: border-box; }
html, body { max-width: 100%; overflow-x: hidden; }
body { margin: 0; padding: 0; background: var(--bg); font-family: Arial, sans-serif; color: var(--text); }

#events-nav { background: white; border-bottom: 1px solid #e8e0e0; padding: 16px 32px; display: flex; align-items: center; gap: 8px; font-size: 15px; color: #aaa; }
#events-nav a { color: var(--primary); text-decoration: none; font-weight: bold; }
#events-nav a:hover { text-decoration: underline; }
#events-nav .sep { color: #ccc; }

#events-container { max-width: 860px; margin: 0 auto; padding: 40px 24px; }
#events-page-title { font-family: Impact, Arial, sans-serif; color: var(--primary); font-size: 32px; margin: 0 0 32px; }

#calendar { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 24px; }
#calendar-header { background: var(--primary); color: white; display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; }
#calendar-header h2 { font-family: Impact, Arial, sans-serif; font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
.cal-nav-btn { background: none; border: 2px solid rgba(255,255,255,0.6); color: white; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: 0.2s; line-height: 1; }
.cal-nav-btn:hover { background: rgba(255,255,255,0.2); border-color: white; }

#calendar-grid { padding: 16px; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
.cal-weekday { text-align: center; font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase; padding: 4px 0; }
.cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; font-size: 14px; color: var(--text); cursor: default; }
.cal-day.other-month { color: #ccc; }
.cal-day.today { background: #f0e8e8; font-weight: bold; }
.cal-day.has-event { cursor: pointer; }
.cal-day.has-event:hover { background: #fdf0f0; }
.cal-day.selected { background: var(--primary); color: white; }
.event-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); margin-top: 2px; }
.cal-day.selected .event-dot { background: white; }

#event-detail { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid var(--primary); display: none; }
#event-detail.visible { display: block; }
#event-detail h3 { font-family: Impact, Arial, sans-serif; color: var(--primary); font-size: 22px; margin: 0 0 12px; }
.event-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; font-size: 14px; color: var(--text-muted); }
#event-detail p { font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
a.event-link { display: inline-block; background: var(--primary); color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; text-decoration: none; transition: opacity 0.2s; }
a.event-link:hover { opacity: 0.85; }

#month-events-title { font-family: Impact, Arial, sans-serif; color: var(--primary); font-size: 20px; margin: 0 0 16px; }
#month-events-list { display: flex; flex-direction: column; gap: 10px; }
.event-list-item { background: white; border-radius: 10px; padding: 14px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); display: flex; gap: 16px; align-items: center; cursor: pointer; transition: box-shadow 0.2s; border: 2px solid transparent; }
.event-list-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-color: var(--primary); }
.event-date-badge { background: var(--primary); color: white; border-radius: 8px; padding: 8px 12px; text-align: center; min-width: 52px; flex-shrink: 0; }
.event-date-badge .day { font-size: 22px; font-weight: bold; line-height: 1; font-family: Impact, Arial, sans-serif; }
.event-date-badge .month { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
.event-list-info { flex: 1; min-width: 0; }
.event-list-title { font-weight: bold; font-size: 15px; color: var(--text); margin: 0 0 3px; }
.event-list-location { font-size: 13px; color: var(--text-muted); margin: 0; }
#no-events { text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 15px; }

@media (max-width: 600px) {
  #events-container { padding: 20px 16px; }
  #events-nav { padding: 12px 16px; font-size: 13px; }
  .cal-day { font-size: 12px; }
}
```

- [ ] **Commit**

```bash
git add public/assets/css/Events.css
git commit -m "feat: Events.css — styles page calendrier"
```

---

## Task 2 — events.html

**Files:**
- Create: `public/events.html`

- [ ] **Créer le fichier**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Événements – GN Cotentin</title>
    <link rel="stylesheet" href="assets/css/Events.css">
</head>
<body>
    <div id="events-nav">
        <a href="accueil.html">Accueil</a>
        <span class="sep">›</span>
        <span>Événements</span>
    </div>

    <div id="events-container">
        <h1 id="events-page-title">Événements</h1>

        <div id="calendar">
            <div id="calendar-header">
                <button class="cal-nav-btn" id="prev-month">&#8249;</button>
                <h2 id="calendar-month-label"></h2>
                <button class="cal-nav-btn" id="next-month">&#8250;</button>
            </div>
            <div id="calendar-grid">
                <div class="cal-weekdays">
                    <div class="cal-weekday">Lu</div>
                    <div class="cal-weekday">Ma</div>
                    <div class="cal-weekday">Me</div>
                    <div class="cal-weekday">Je</div>
                    <div class="cal-weekday">Ve</div>
                    <div class="cal-weekday">Sa</div>
                    <div class="cal-weekday">Di</div>
                </div>
                <div class="cal-days" id="cal-days"></div>
            </div>
        </div>

        <div id="event-detail"></div>

        <p id="month-events-title"></p>
        <div id="month-events-list"></div>
    </div>

    <script type="module" src="assets/js/ui.js"></script>
    <script type="module" src="assets/js/events.js"></script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add public/events.html
git commit -m "feat: events.html — structure page calendrier"
```

---

## Task 3 — events.js

**Files:**
- Create: `public/assets/js/events.js`

- [ ] **Créer le fichier**

```js
import { db } from './firebase-init.js'
import { collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

const MONTHS_FR    = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

let allEvents = []
let currentYear  = new Date().getFullYear()
let currentMonth = new Date().getMonth()
let selectedDay  = null

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')))
    allEvents = snap.docs.map(d => ({ id: d.id, ...d.data(), dateObj: d.data().date?.toDate?.() }))
  } catch (e) {
    console.error('Erreur chargement events :', e)
  }
  renderCalendar()
  renderMonthList()
})

function eventsForMonth(year, month) {
  return allEvents.filter(e => e.dateObj && e.dateObj.getFullYear() === year && e.dateObj.getMonth() === month)
}

function renderCalendar() {
  document.getElementById('calendar-month-label').textContent = `${MONTHS_FR[currentMonth]} ${currentYear}`

  const monthEvents = eventsForMonth(currentYear, currentMonth)
  const eventDays   = new Set(monthEvents.map(e => e.dateObj.getDate()))
  const today       = new Date()

  const firstDayRaw  = new Date(currentYear, currentMonth, 1).getDay()
  const startOffset  = firstDayRaw === 0 ? 6 : firstDayRaw - 1
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate()

  const grid = document.getElementById('cal-days')
  grid.innerHTML = ''

  for (let i = 0; i < startOffset; i++) {
    const cell = document.createElement('div')
    cell.className = 'cal-day other-month'
    grid.appendChild(cell)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d
    const hasEvent   = eventDays.has(d)
    const isSelected = selectedDay === d
    const cell = document.createElement('div')
    cell.className = 'cal-day' + (isToday ? ' today' : '') + (hasEvent ? ' has-event' : '') + (isSelected ? ' selected' : '')
    cell.innerHTML = `<span>${d}</span>${hasEvent ? '<div class="event-dot"></div>' : ''}`
    if (hasEvent) cell.addEventListener('click', () => selectDay(d))
    grid.appendChild(cell)
  }

  document.getElementById('prev-month').onclick = () => {
    currentMonth === 0 ? (currentMonth = 11, currentYear--) : currentMonth--
    selectedDay = null
    renderCalendar(); renderMonthList(); hideDetail()
  }
  document.getElementById('next-month').onclick = () => {
    currentMonth === 11 ? (currentMonth = 0, currentYear++) : currentMonth++
    selectedDay = null
    renderCalendar(); renderMonthList(); hideDetail()
  }
}

function selectDay(day) {
  selectedDay = day
  renderCalendar()
  const events = allEvents.filter(e => e.dateObj && e.dateObj.getFullYear() === currentYear && e.dateObj.getMonth() === currentMonth && e.dateObj.getDate() === day)
  if (events.length > 0) showDetail(events[0])
}

function showDetail(event) {
  const d = event.dateObj
  const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const detail = document.getElementById('event-detail')
  detail.innerHTML = `
    <h3>${event.title}</h3>
    <div class="event-meta">
      <span>📅 ${dateStr}${event.time ? ' à ' + event.time : ''}</span>
      <span>📍 ${event.location}</span>
    </div>
    <p>${event.description.replace(/\n/g, '<br>')}</p>
    ${event.link ? `<a href="${event.link}" class="event-link" target="_blank" rel="noopener">Voir l'événement →</a>` : ''}
  `
  detail.className = 'visible'
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function hideDetail() {
  const detail = document.getElementById('event-detail')
  detail.className = ''
  detail.innerHTML = ''
}

function renderMonthList() {
  const events = eventsForMonth(currentYear, currentMonth)
  const title  = document.getElementById('month-events-title')
  const list   = document.getElementById('month-events-list')

  title.textContent = events.length > 0 ? `Événements — ${MONTHS_FR[currentMonth]} ${currentYear}` : ''

  if (events.length === 0) {
    list.innerHTML = '<p id="no-events">Aucun événement ce mois-ci.</p>'
    return
  }
  list.innerHTML = ''
  events.forEach(event => {
    const d    = event.dateObj
    const item = document.createElement('div')
    item.className = 'event-list-item'
    item.innerHTML = `
      <div class="event-date-badge">
        <div class="day">${d.getDate()}</div>
        <div class="month">${MONTHS_SHORT[d.getMonth()]}</div>
      </div>
      <div class="event-list-info">
        <p class="event-list-title">${event.title}</p>
        <p class="event-list-location">📍 ${event.location}</p>
      </div>
    `
    item.addEventListener('click', () => { selectedDay = d.getDate(); renderCalendar(); showDetail(event) })
    list.appendChild(item)
  })
}
```

- [ ] **Commit**

```bash
git add public/assets/js/events.js
git commit -m "feat: events.js — logique calendrier et liste mensuelle"
```

---

## Task 4 — addEvent.html

**Files:**
- Create: `public/addEvent.html`

- [ ] **Créer le fichier**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvel événement - GN Cotentin</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f4f1f0; min-height: 100vh; display: flex; flex-direction: column; }
        #topbar { background: rgb(97,0,0); color: white; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        #topbar h1 { font-size: 18px; font-family: Arial, sans-serif; font-weight: bold; }
        .topbar-actions { display: flex; gap: 10px; }
        .btn { border: none; border-radius: 20px; padding: 8px 20px; font-size: 14px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .btn-ghost { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.5); }
        .btn-ghost:hover { border-color: white; }
        .btn-publish { background: white; color: rgb(97,0,0); }
        .btn-publish:hover { background: #f0e0e0; }
        .spinner { display: none; width: 16px; height: 16px; border: 2px solid rgba(97,0,0,0.3); border-top-color: rgb(97,0,0); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        #form-layout { max-width: 700px; margin: 32px auto; padding: 0 24px 40px; display: flex; flex-direction: column; gap: 16px; }
        .form-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .form-row { display: flex; gap: 16px; }
        .form-row .form-card { flex: 1; }
        .form-card label { display: block; font-size: 12px; font-weight: bold; color: rgb(97,0,0); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .form-card input, .form-card textarea { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-family: Arial, sans-serif; resize: vertical; transition: border-color 0.2s; }
        .form-card input:focus, .form-card textarea:focus { outline: none; border-color: rgb(97,0,0); }
        @media (max-width: 600px) { .form-row { flex-direction: column; } #form-layout { padding: 0 16px 32px; } }
    </style>
</head>
<body>
    <div id="topbar">
        <h1>📅 Nouvel événement</h1>
        <div class="topbar-actions">
            <button class="btn btn-ghost" onclick="location.href='admin.html'">Abandonner</button>
            <button class="btn btn-publish" onclick="saveEvent()">
                <span id="save-label">Publier</span>
                <span class="spinner" id="save-spinner"></span>
            </button>
        </div>
    </div>
    <div id="form-layout">
        <div class="form-card">
            <label>Titre *</label>
            <input type="text" id="titleInput" placeholder="Ex : CITO Printemps 2026…" maxlength="120">
        </div>
        <div class="form-row">
            <div class="form-card">
                <label>Date *</label>
                <input type="date" id="dateInput">
            </div>
            <div class="form-card">
                <label>Heure (optionnel)</label>
                <input type="time" id="timeInput">
            </div>
        </div>
        <div class="form-card">
            <label>Lieu *</label>
            <input type="text" id="locationInput" placeholder="Ex : Parc de la Victoire, Cherbourg">
        </div>
        <div class="form-card">
            <label>Description *</label>
            <textarea id="descriptionInput" rows="6" placeholder="Décrivez l'événement…"></textarea>
        </div>
        <div class="form-card">
            <label>Lien externe (optionnel)</label>
            <input type="url" id="linkInput" placeholder="https://www.geocaching.com/…">
        </div>
    </div>
    <script type="module" src="assets/js/ui.js"></script>
    <script type="module" src="assets/js/addEvent.js"></script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add public/addEvent.html
git commit -m "feat: addEvent.html — formulaire créer/modifier événement"
```

---

## Task 5 — addEvent.js

**Files:**
- Create: `public/assets/js/addEvent.js`

- [ ] **Créer le fichier**

```js
import { auth, db } from './firebase-init.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

const editId = new URLSearchParams(location.search).get('id')
const isEdit = !!editId
const eventId = isEdit ? editId : crypto.randomUUID()

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = 'login.html'; return }
  if (isEdit) await loadEvent()
})

async function loadEvent() {
  try {
    const snap = await getDoc(doc(db, 'events', editId))
    if (!snap.exists()) { alert('Événement introuvable.'); location.href = 'admin.html'; return }
    const e = snap.data()
    document.getElementById('titleInput').value       = e.title       ?? ''
    document.getElementById('locationInput').value    = e.location    ?? ''
    document.getElementById('descriptionInput').value = e.description ?? ''
    document.getElementById('timeInput').value        = e.time        ?? ''
    document.getElementById('linkInput').value        = e.link        ?? ''
    if (e.date) {
      const d = e.date.toDate()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const j = String(d.getDate()).padStart(2, '0')
      document.getElementById('dateInput').value = `${y}-${m}-${j}`
    }
    document.getElementById('save-label').textContent = 'Mettre à jour'
    document.querySelector('#topbar h1').textContent  = '📅 Modifier l\'événement'
  } catch (e) {
    console.error(e); alert('Erreur lors du chargement.')
  }
}

window.saveEvent = async () => {
  const title       = document.getElementById('titleInput').value.trim()
  const dateStr     = document.getElementById('dateInput').value
  const lieu        = document.getElementById('locationInput').value.trim()
  const description = document.getElementById('descriptionInput').value.trim()
  const time        = document.getElementById('timeInput').value  || null
  const link        = document.getElementById('linkInput').value.trim() || null

  if (!title)       { alert('Le titre est requis.');       document.getElementById('titleInput').focus();       return }
  if (!dateStr)     { alert('La date est requise.');       document.getElementById('dateInput').focus();        return }
  if (!lieu)        { alert('Le lieu est requis.');        document.getElementById('locationInput').focus();    return }
  if (!description) { alert('La description est requise.');document.getElementById('descriptionInput').focus(); return }

  const label   = document.getElementById('save-label')
  const spinner = document.getElementById('save-spinner')
  label.style.display   = 'none'
  spinner.style.display = 'inline-block'

  try {
    const [y, m, j] = dateStr.split('-').map(Number)
    const date = Timestamp.fromDate(new Date(y, m - 1, j))
    const data = { title, date, location: lieu, description, time, link }
    if (!isEdit) data.createdAt = serverTimestamp()
    await setDoc(doc(db, 'events', eventId), data, { merge: isEdit })
    location.href = 'admin.html'
  } catch (err) {
    console.error(err); alert('Erreur lors de la sauvegarde.')
    label.style.display   = 'inline'
    spinner.style.display = 'none'
  }
}
```

- [ ] **Commit**

```bash
git add public/assets/js/addEvent.js
git commit -m "feat: addEvent.js — CRUD événements Firestore"
```

---

## Task 6 — admin.html + admin.js — section événements

**Files:**
- Modify: `public/admin.html`
- Modify: `public/assets/js/admin.js`

- [ ] **admin.html — ajouter la section Événements après la section Actualités**

Après le bloc `</div>` fermant la section Actualités (le dernier `</div>` avant `</div>` de `#dashboard`), ajouter :

```html
        <!-- Liste des events -->
        <div class="dash-section">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--primary-light);">
                <h2 style="margin:0;border:none;padding:0;">Événements</h2>
                <a href="addEvent.html" class="btn-primary" style="font-size:14px;padding:8px 18px;">+ Nouvel événement</a>
            </div>
            <div id="eventsList"></div>
        </div>
```

- [ ] **admin.js — ajouter import deleteDoc si absent, loadEvents, deleteEvent**

En haut du fichier, l'import Firestore existant est :
```js
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'
```
`deleteDoc` est déjà présent. Ajouter `Timestamp` n'est pas nécessaire ici.

- [ ] **admin.js — appeler loadEvents dans loadDashboard**

Remplacer :
```js
async function loadDashboard() {
  await Promise.all([loadVisits(), loadNews()])
}
```
Par :
```js
async function loadDashboard() {
  await Promise.all([loadVisits(), loadNews(), loadEvents()])
}
```

- [ ] **admin.js — ajouter les fonctions loadEvents et deleteEvent à la fin du fichier**

```js
async function loadEvents() {
  const container = document.getElementById('eventsList')
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')))
    if (snap.empty) {
      container.innerHTML = '<p id="no-news-admin">Aucun événement.</p>'
      return
    }
    snap.forEach(d => {
      const e    = d.data()
      const date = e.date?.toDate?.()
      const dateStr = date
        ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''
      const item = document.createElement('div')
      item.className = 'news-admin-item'
      item.innerHTML = `
        <div class="news-admin-info">
          <div class="news-admin-title">${e.title}</div>
          <div class="news-admin-date">${dateStr}${e.location ? ' · ' + e.location : ''}</div>
        </div>
        <div class="news-admin-actions">
          <a href="addEvent.html?id=${d.id}" class="btn-view">Modifier</a>
          <button class="btn-delete" data-id="${d.id}">Supprimer</button>
        </div>
      `
      item.querySelector('.btn-delete').addEventListener('click', () => deleteEvent(d.id, item))
      container.appendChild(item)
    })
  } catch (e) {
    console.error('Erreur events :', e)
    container.innerHTML = '<p id="no-news-admin">Erreur lors du chargement.</p>'
  }
}

async function deleteEvent(id, element) {
  if (!confirm('Supprimer cet événement définitivement ?')) return
  try {
    await deleteDoc(doc(db, 'events', id))
    element.remove()
  } catch (e) {
    console.error('Erreur suppression event :', e)
    alert('Erreur lors de la suppression.')
  }
}
```

- [ ] **Commit**

```bash
git add public/admin.html public/assets/js/admin.js
git commit -m "feat: section Événements dans le dashboard admin"
```

---

## Task 7 — accueil.html + accueil.js + style.css — section events

**Files:**
- Modify: `public/accueil.html`
- Modify: `public/assets/js/accueil.js`
- Modify: `public/assets/css/style.css`

- [ ] **accueil.html — ajouter section #Events entre #Assos et #Boutique**

Avant le bloc `<div id="Boutique">`, insérer :

```html
    <div id="Events" style="display:none">
        <div class="HoriSepLine"></div>
        <h1>Événements à venir</h1>
        <div class="HoriSepLine"></div>
        <div class="events-accueil-grid" id="events-accueil-list"></div>
        <div class="events-cta">
            <a href="events.html">Voir tous les événements <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
    </div>

```

- [ ] **style.css — ajouter styles events accueil à la fin (avant le @media)**

```css
/* --- EVENTS ACCUEIL --- */
#Events { padding-bottom: 30px; }
.events-accueil-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
.event-accueil-card { background: white; border-radius: 12px; padding: 20px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.event-accueil-card:hover { border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.event-accueil-date { color: var(--primary-color); font-weight: bold; font-size: 14px; text-transform: capitalize; margin-bottom: 6px; }
.event-accueil-title { font-size: 16px; font-weight: bold; color: #222; margin-bottom: 4px; }
.event-accueil-location { font-size: 13px; color: #888; }
.events-cta { text-align: center; margin-top: 8px; }
.events-cta a { display: inline-block; padding: 10px 28px; background: var(--primary-color); color: white; border-radius: 25px; font-size: 15px; font-weight: bold; text-decoration: none; transition: opacity 0.2s; }
.events-cta a:hover { opacity: 0.85; }
```

- [ ] **accueil.js — ajouter import getDocs, orderBy si absents et appel loadUpcomingEvents**

En tête du fichier, l'import existant est déjà :
```js
import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'
```
Tout est déjà importé.

Dans `document.addEventListener('DOMContentLoaded', ...)`, ajouter `loadUpcomingEvents()` :

Remplacer :
```js
document.addEventListener('DOMContentLoaded', () => {
  loadNews()
  trackVisit()
})
```
Par :
```js
document.addEventListener('DOMContentLoaded', () => {
  loadNews()
  trackVisit()
  loadUpcomingEvents()
})
```

- [ ] **accueil.js — ajouter la fonction loadUpcomingEvents à la fin du fichier**

```js
async function loadUpcomingEvents() {
  try {
    const now  = new Date()
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')))
    const upcoming = snap.docs
      .map(d => ({ id: d.id, ...d.data(), dateObj: d.data().date?.toDate?.() }))
      .filter(e => e.dateObj && e.dateObj >= now)
      .slice(0, 3)

    if (upcoming.length === 0) return

    const section   = document.getElementById('Events')
    const container = document.getElementById('events-accueil-list')
    section.style.display = 'block'

    upcoming.forEach(event => {
      const d       = event.dateObj
      const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      const card    = document.createElement('div')
      card.className = 'event-accueil-card'
      card.onclick   = () => location.href = 'events.html'
      card.innerHTML = `
        <div class="event-accueil-date">📅 ${dateStr}${event.time ? ' à ' + event.time : ''}</div>
        <div class="event-accueil-title">${event.title}</div>
        <div class="event-accueil-location">📍 ${event.location}</div>
      `
      container.appendChild(card)
    })
  } catch (e) {
    console.error('Erreur events accueil :', e)
  }
}
```

- [ ] **Commit**

```bash
git add public/accueil.html public/assets/js/accueil.js public/assets/css/style.css
git commit -m "feat: section Événements à venir sur la page d'accueil"
```

---

## Task 8 — ui.js — bouton Événements dans le header visiteurs

**Files:**
- Modify: `public/assets/js/ui.js`

- [ ] **Ajouter le bouton "Événements" dans le header visiteurs**

Remplacer :
```js
        <button class="header_button" onclick="location.href='accueil.html'">Accueil</button>
        <button class="header_button" onclick="window.__scrollTo('Assos')">Qui sommes nous ?</button>
        <button class="header_button" onclick="location.href='mailto:Gcncotentin@gmail.com'">Nous Contacter</button>
        <button class="header_button" onclick="location.href='login.html'">Connexion</button>
```
Par :
```js
        <button class="header_button" onclick="location.href='accueil.html'">Accueil</button>
        <button class="header_button" onclick="window.__scrollTo('Assos')">Qui sommes nous ?</button>
        <button class="header_button" onclick="location.href='events.html'">Événements</button>
        <button class="header_button" onclick="location.href='mailto:Gcncotentin@gmail.com'">Nous Contacter</button>
        <button class="header_button" onclick="location.href='login.html'">Connexion</button>
```

- [ ] **Commit + push final**

```bash
git add public/assets/js/ui.js
git commit -m "feat: lien Événements dans le header visiteurs"
git push
```
