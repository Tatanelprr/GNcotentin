import { auth, db } from './firebase-init.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'

const editId  = new URLSearchParams(location.search).get('id')
const isEdit  = !!editId
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
  } catch (err) {
    console.error(err); alert('Erreur lors du chargement.')
  }
}

window.saveEvent = async () => {
  const title       = document.getElementById('titleInput').value.trim()
  const dateStr     = document.getElementById('dateInput').value
  const lieu        = document.getElementById('locationInput').value.trim()
  const description = document.getElementById('descriptionInput').value.trim()
  const time        = document.getElementById('timeInput').value.trim()  || null
  const link        = document.getElementById('linkInput').value.trim()  || null

  if (!title)       { alert('Le titre est requis.');        document.getElementById('titleInput').focus();        return }
  if (!dateStr)     { alert('La date est requise.');        document.getElementById('dateInput').focus();         return }
  if (!lieu)        { alert('Le lieu est requis.');         document.getElementById('locationInput').focus();     return }
  if (!description) { alert('La description est requise.'); document.getElementById('descriptionInput').focus(); return }

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
