import { db } from './firebase-init.js'
import { collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('newsList')

  try {
    const snap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc')))

    if (snap.empty) {
      container.innerHTML = '<p id="no-news">Aucune actualité pour le moment.</p>'
      return
    }

    snap.docs.filter(d => d.data().status !== 'draft').forEach(d => {
      const news = d.data()
      const date = news.createdAt?.toDate?.()
      const dateStr = date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

      const card = document.createElement('div')
      card.className = 'news-card'
      card.onclick = () => location.href = `news.html?id=${d.id}`

      card.innerHTML = `
        <img class="news-card-img" src="${news.coverImg || ''}" alt="${news.title}" onerror="this.style.display='none'">
        <div class="news-card-body">
          <p class="news-card-title">${news.title}</p>
          <p class="news-card-resume">${news.resume}</p>
          <span class="news-card-date">${dateStr}</span>
        </div>
      `
      container.appendChild(card)
    })
  } catch (e) {
    console.error('Erreur chargement news :', e)
    container.innerHTML = '<p id="no-news">Erreur lors du chargement des actualités.</p>'
  }
})
