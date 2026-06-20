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
      opt.value          = d.id
      opt.textContent    = d.data().title
      opt.dataset.title  = d.data().title
      opt.dataset.dateMs = (d.data().date?.seconds ?? 0) * 1000
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
    const urls     = await Promise.all(files.map(f => uploadToCloudinary(f, folder)))
    const albumRef = doc(db, 'galerie', currentAlbumId)
    const existing = await getDoc(albumRef)

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
