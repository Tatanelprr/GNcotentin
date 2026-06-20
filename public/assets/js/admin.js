import { auth, db } from './firebase-init.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

onAuthStateChanged(auth, user => {
  if (!user) { location.href = 'login.html'; return }
  loadDashboard()
})

async function loadDashboard() {
  await Promise.all([loadVisits(), loadNews(), loadEvents(), loadGalerie()])
}

async function loadVisits() {
  try {
    const snap = await getDocs(query(collection(db, 'visits'), orderBy('__name__', 'asc')))
    const visitsByDay = {}
    snap.forEach(d => { visitsByDay[d.id] = d.data().count ?? 0 })

    const today = new Date().toISOString().slice(0, 10)
    const labels = [], values = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const day = d.toISOString().slice(0, 10)
      labels.push(day.slice(5))
      values.push(visitsByDay[day] ?? 0)
    }

    const total = values.reduce((a, b) => a + b, 0)
    const avg = values.filter(v => v > 0).length > 0
      ? Math.round(total / values.filter(v => v > 0).length)
      : 0

    document.getElementById('kpi-today').textContent = visitsByDay[today] ?? 0
    document.getElementById('kpi-total').textContent = total
    document.getElementById('kpi-avg').textContent = avg

    const ctx = document.getElementById('visitsChart').getContext('2d')
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Visites',
          data: values,
          fill: true,
          borderColor: 'rgb(97,0,0)',
          backgroundColor: 'rgba(97,0,0,0.1)',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    })
  } catch (e) {
    console.error('Erreur visites :', e)
  }
}

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

async function loadEvents() {
  const container = document.getElementById('eventsList')
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')))
    if (snap.empty) {
      container.innerHTML = '<p id="no-news-admin">Aucun événement.</p>'
      return
    }
    snap.forEach(d => {
      const e       = d.data()
      const date    = e.date?.toDate?.()
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

async function deleteNews(id, element) {
  if (!confirm('Supprimer cette actualité définitivement ?')) return
  try {
    await deleteDoc(doc(db, 'news', id))
    element.remove()
    const current = parseInt(document.getElementById('kpi-news').textContent) || 0
    document.getElementById('kpi-news').textContent = Math.max(0, current - 1)
  } catch (e) {
    console.error('Erreur suppression :', e)
    alert('Erreur lors de la suppression.')
  }
}
