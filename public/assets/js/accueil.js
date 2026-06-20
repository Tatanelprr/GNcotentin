import { db } from './firebase-init.js'
import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

document.addEventListener('DOMContentLoaded', () => {
  loadNews()
  trackVisit()
  loadUpcomingEvents()
})

async function trackVisit() {
  try {
    const { doc, setDoc, increment, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js')
    const today = new Date().toISOString().slice(0, 10)
    await setDoc(doc(db, 'visits', today), { count: increment(1), updatedAt: serverTimestamp() }, { merge: true })
  } catch (e) { /* silencieux */ }
}

let newsIds = []

function buildCard(news, index, cssClass = '') {
  const card = document.createElement('div')
  if (cssClass) card.className = cssClass
  card.innerHTML = `
    <div class="Info" style="cursor:pointer" onclick="window.sendToPage(${index})">
      <div class="News_Content">
        <div class="News_Text">
          <h3 class="News_Title">${news.title}</h3>
          <p class="News_Resume">${news.resume}</p>
        </div>
      </div>
    </div>
  `
  const info = card.querySelector('.Info')

  if (news.coverImg) {
    info.style.backgroundImage = `url("${news.coverImg}")`
    info.style.backgroundSize = 'cover'
    info.style.backgroundPosition = 'center'
    getAverageColor(news.coverImg).then(c => {
      info.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`
    })
  }

  return card
}

async function loadNews() {
  const newsEl = document.getElementById('News')
  const cta    = document.getElementById('news-cta')

  try {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(4))
    const snap = await getDocs(q)
    const allDocs = snap.docs.filter(d => d.data().status !== 'draft')
    const hasMore = allDocs.length > 3
    const newsList = allDocs.slice(0, 3).map(d => ({ id: d.id, ...d.data() }))
    newsIds = newsList.map(n => n.id)

    const count = newsList.length
    if (count === 0) return

    newsEl.className = `news-count-${Math.min(count, 3)}`

    if (count === 1) {
      newsEl.appendChild(buildCard(newsList[0], 0))

    } else if (count === 2) {
      newsList.forEach((n, i) => newsEl.appendChild(buildCard(n, i)))

    } else {
      // 3 news : une grande à gauche + 2 petites à droite
      const mainCard = buildCard(newsList[0], 0)
      mainCard.className = 'info-main'
      mainCard.querySelector('.Info').style.height = '100%'

      const sec = document.createElement('div')
      sec.className = 'info-secondary'
      sec.appendChild(buildCard(newsList[1], 1).querySelector('.Info'))
      sec.appendChild(buildCard(newsList[2], 2).querySelector('.Info'))

      newsEl.appendChild(mainCard)
      newsEl.appendChild(sec)
    }

    // Bouton "Voir toutes" uniquement s'il y a plus de 3 news
    if (hasMore) cta.style.display = 'block'

  } catch (err) {
    console.error('Erreur chargement news :', err)
  }
}

window.sendToPage = (index) => {
  if (newsIds[index]) location.href = `news.html?id=${newsIds[index]}`
}

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

function getAverageColor(imagePath) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imagePath
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = canvas.height = 50
      ctx.drawImage(img, 0, 0, 50, 50)
      const data = ctx.getImageData(0, 0, 50, 50).data
      let r = 0, g = 0, b = 0
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2] }
      const px = data.length / 4
      resolve({ r: Math.round(r/px), g: Math.round(g/px), b: Math.round(b/px) })
    }
    img.onerror = () => resolve({ r: 200, g: 200, b: 200 })
  })
}
