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
        : `<div class="album-cover-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="12" cy="14" r="3.5"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></div>
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
    document.title = `${album.eventTitle} – Galerie GN Cotentin`
    document.getElementById('nav-label').textContent      = album.eventTitle
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
