import { db } from './firebase-init.js'
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id')
  if (!id) { showError('Actualité introuvable.'); return }

  try {
    const snap = await getDoc(doc(db, 'news', id))
    if (!snap.exists()) { showError('Cette actualité n\'existe pas ou a été supprimée.'); return }

    const news = snap.data()
    const date = news.createdAt?.toDate?.()
    const dateStr = date
      ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : ''

    document.title = news.title + ' – GN Cotentin'
    const bc = document.getElementById('breadcrumb-title')
    if (bc) bc.textContent = news.title.length > 40 ? news.title.slice(0, 40) + '…' : news.title

    // Meta dynamiques pour le SEO et le partage
    const url = location.href
    setMeta('description', news.resume)
    setOG('title', news.title + ' – GN Cotentin')
    setOG('description', news.resume)
    setOG('url', url)
    setOG('image', news.coverImg || 'https://gncotentin.web.app/assets/img/ui/GNLogo.jpg')
    document.querySelector('link[rel="canonical"]')?.remove()
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'; canonical.href = url
    document.head.appendChild(canonical)

    // Hero avec image de couverture
    if (news.coverImg) {
      const hero = document.getElementById('news-hero')
      hero.style.display = 'block'
      hero.innerHTML = `
        <img src="${news.coverImg}" alt="${news.title}">
        <div id="news-hero-overlay">
          ${dateStr ? `<span class="news-date">${dateStr}</span>` : ''}
          <h1>${news.title}</h1>
          ${news.resume ? `<p class="news-resume">${news.resume}</p>` : ''}
        </div>
      `
    } else {
      // Pas d'image : header rouge
      const header = document.getElementById('news-header-no-img')
      header.style.display = 'block'
      header.innerHTML = `
        ${dateStr ? `<div class="news-date">${dateStr}</div>` : ''}
        <h1>${news.title}</h1>
        ${news.resume ? `<p class="news-resume">${news.resume}</p>` : ''}
      `
    }

    // Sections
    const container = document.getElementById('NewsContainer')
    const sections = news.sections ?? []

    sections.forEach((item, i) => {

      const section = document.createElement('div')
      section.className = `news-section ${item.type ?? 'TextOnly'}`

      const content = document.createElement('div')
      content.className = 'section-content'
      content.innerHTML = item.content ?? ''

      if (item.type === 'ImgOnLeft' || item.type === 'ImgOnRight') {
        const imgWrap = document.createElement('div')
        imgWrap.className = 'section-img'
        if (item.imgUrl) {
          const img = document.createElement('img')
          img.src = item.imgUrl
          img.alt = ''
          img.loading = 'lazy'
          imgWrap.appendChild(img)
        }
        section.appendChild(imgWrap)
        section.appendChild(content)
      } else {
        section.appendChild(content)
      }

      container.appendChild(section)
    })

    // Boutons de partage
    const shareSection = document.getElementById('share-section')
    const fbBtn = document.getElementById('share-facebook')
    const waBtn = document.getElementById('share-whatsapp')
    fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(news.title + ' ' + url)}`
    shareSection.style.display = 'flex'

  } catch (e) {
    console.error('Erreur chargement news :', e)
    showError('Erreur lors du chargement de l\'actualité.')
  }
})

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
  el.content = content
}
function setOG(prop, content) {
  let el = document.querySelector(`meta[property="og:${prop}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', `og:${prop}`); document.head.appendChild(el) }
  el.content = content
}

function showError(msg) {
  document.getElementById('NewsContainer').innerHTML = `<div id="news-error"><p>${msg}</p><a href="news-list.html" style="color:rgb(97,0,0)">Retour aux actualités</a></div>`
}
