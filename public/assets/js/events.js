import { db } from './firebase-init.js'
import { collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

const MONTHS_FR    = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

let allEvents    = []
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

  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay()
  const startOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

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
    if (currentMonth === 0) { currentMonth = 11; currentYear-- } else currentMonth--
    selectedDay = null
    renderCalendar(); renderMonthList(); hideDetail()
  }
  document.getElementById('next-month').onclick = () => {
    if (currentMonth === 11) { currentMonth = 0; currentYear++ } else currentMonth++
    selectedDay = null
    renderCalendar(); renderMonthList(); hideDetail()
  }
}

function selectDay(day) {
  selectedDay = day
  renderCalendar()
  const events = allEvents.filter(e =>
    e.dateObj &&
    e.dateObj.getFullYear() === currentYear &&
    e.dateObj.getMonth() === currentMonth &&
    e.dateObj.getDate() === day
  )
  if (events.length > 0) showDetail(events[0])
}

function showDetail(event) {
  const d       = event.dateObj
  const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const detail  = document.getElementById('event-detail')
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
