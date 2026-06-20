import { db } from './firebase-init.js'
import { collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

let allEvents   = []
let activeFilter = 'upcoming'
let rangeActive  = false

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')))
    allEvents = snap.docs.map(d => ({ id: d.id, ...d.data(), dateObj: d.data().date?.toDate?.() }))
  } catch (e) {
    console.error('Erreur chargement events :', e)
  }

  render()

  // Tabs
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activeFilter = btn.dataset.filter
      clearRange()
      render()
    })
  })

  // Filtrer par date
  document.getElementById('filter-apply').addEventListener('click', () => {
    const from = document.getElementById('filter-from').value
    const to   = document.getElementById('filter-to').value
    if (!from && !to) return
    rangeActive = true
    document.getElementById('filter-reset').style.display = 'inline-block'
    render()
  })

  // Réinitialiser
  document.getElementById('filter-reset').addEventListener('click', () => {
    clearRange()
    render()
  })
})

function clearRange() {
  rangeActive = false
  document.getElementById('filter-from').value = ''
  document.getElementById('filter-to').value   = ''
  document.getElementById('filter-reset').style.display = 'none'
}

function render() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcomingSection = document.getElementById('events-upcoming-section')
  const pastSection     = document.getElementById('events-past-section')
  const rangeSection    = document.getElementById('events-range-section')

  if (rangeActive) {
    upcomingSection.style.display = 'none'
    pastSection.style.display     = 'none'
    rangeSection.style.display    = 'block'

    const fromVal = document.getElementById('filter-from').value
    const toVal   = document.getElementById('filter-to').value
    const from    = fromVal ? new Date(fromVal) : null
    const to      = toVal   ? new Date(toVal + 'T23:59:59') : null

    const filtered = allEvents.filter(e => {
      if (!e.dateObj) return false
      if (from && e.dateObj < from) return false
      if (to   && e.dateObj > to)   return false
      return true
    })

    const label = [
      from ? 'Du ' + from.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
      to   ? 'au ' + to.toLocaleDateString('fr-FR',   { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    ].filter(Boolean).join(' ')

    document.getElementById('events-range-title').textContent = label || 'Résultats'
    renderList('events-range-list', filtered, false)
    return
  }

  rangeSection.style.display = 'none'

  const upcoming = allEvents.filter(e => e.dateObj && e.dateObj >= now)
  const past     = allEvents.filter(e => e.dateObj && e.dateObj < now).reverse()

  if (activeFilter === 'upcoming') {
    upcomingSection.style.display = 'block'
    pastSection.style.display     = 'none'
    renderList('events-upcoming-list', upcoming, false)
  } else if (activeFilter === 'past') {
    upcomingSection.style.display = 'none'
    pastSection.style.display     = 'block'
    renderList('events-past-list', past, true)
  } else {
    upcomingSection.style.display = 'block'
    pastSection.style.display     = upcoming.length > 0 && past.length > 0 ? 'block' : past.length > 0 ? 'block' : 'none'
    renderList('events-upcoming-list', upcoming, false)
    renderList('events-past-list', past, true)
  }
}

function renderList(containerId, events, dimmed) {
  const container = document.getElementById(containerId)
  if (events.length === 0) {
    container.innerHTML = '<p class="events-empty">Aucun événement.</p>'
    return
  }
  container.innerHTML = ''
  events.forEach(event => {
    const d    = event.dateObj
    const item = document.createElement('div')
    item.className = 'event-list-item' + (dimmed ? ' dimmed' : '')

    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    item.innerHTML = `
      <div class="event-date-badge">
        <div class="day">${d.getDate()}</div>
        <div class="month">${MONTHS_SHORT[d.getMonth()]}</div>
        <div class="year">${d.getFullYear()}</div>
      </div>
      <div class="event-list-info">
        <p class="event-list-title">${event.title}</p>
        <p class="event-list-meta">📅 ${dateStr}${event.time ? ' à ' + event.time : ''} &nbsp;·&nbsp; 📍 ${event.location}</p>
        ${event.description ? `<p class="event-list-desc">${event.description.replace(/\n/g, '<br>')}</p>` : ''}
        ${event.link ? `<a href="${event.link}" class="event-list-link" target="_blank" rel="noopener">Voir l'événement →</a>` : ''}
      </div>
    `
    container.appendChild(item)
  })
}
