import { auth, db } from './firebase-init.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'
import { doc, setDoc, getDoc, getDocs, query, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'
import { uploadToCloudinary } from './cloudinary.js'

const editId = new URLSearchParams(location.search).get('id')
const isEdit = !!editId

let newsId = isEdit ? editId : crypto.randomUUID()
let coverImgUrl = ''
let sectionCount = 0
let draftSaved = false

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = 'login.html'; return }
  if (isEdit) await loadExistingNews()
})

async function loadExistingNews() {
  try {
    const snap = await getDoc(doc(db, 'news', editId))
    if (!snap.exists()) { alert('Article introuvable.'); location.href = 'admin.html'; return }

    const news = snap.data()

    // Titre et résumé
    document.getElementById('TitreInput').value = news.title ?? ''
    document.getElementById('ResumeInput').value = news.resume ?? ''
    document.getElementById('TitreInput').dispatchEvent(new Event('input'))
    document.getElementById('ResumeInput').dispatchEvent(new Event('input'))

    // Cover image
    if (news.coverImg) {
      coverImgUrl = news.coverImg
      const preview = document.getElementById('cover-preview')
      preview.innerHTML = `<img src="${news.coverImg}" alt="cover">`
    }

    // Sections
    for (const section of (news.sections ?? [])) {
      addSection(section.type ?? 'TextOnly')
      const card = document.querySelector(`.section-card[data-id="${sectionCount}"]`)
      if (!card) continue

      // Contenu texte
      if (section.content && card._quill) {
        card._quill.root.innerHTML = section.content
      }

      // Image existante
      if (section.imgUrl) {
        card.dataset.imgUrl = section.imgUrl
        const preview = card.querySelector(`#img-preview-${sectionCount}`)
        if (preview) preview.innerHTML = `<img src="${section.imgUrl}" alt="">`
      }
    }

    // Adapter les boutons et le titre selon le statut
    if (news.status === 'draft') {
      document.getElementById('publish-label').textContent = 'Publier'
    } else {
      document.getElementById('btn-draft').style.display = 'none'
      document.getElementById('btn-preview').onclick = () => window.open(`news.html?id=${newsId}`, '_blank')
      document.getElementById('publish-label').textContent = 'Mettre à jour'
    }
    document.querySelector('#topbar h1').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Modifier l'actualité`

  } catch (e) {
    console.error('Erreur chargement article :', e)
    alert('Erreur lors du chargement de l\'article.')
  }
}

const QUILL_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link', 'blockquote', 'code-block'],
  ['clean']
]

function createQuill(container) {
  return new Quill(container, {
    theme: 'snow',
    placeholder: 'Rédigez votre contenu ici…',
    modules: { toolbar: QUILL_TOOLBAR }
  })
}

// ── COVER IMAGE ─────────────────────────────────────────────────────────────

window.uploadCover = async (input) => {
  if (!input.files?.[0]) return
  const loading = document.getElementById('cover-loading')
  const preview = document.getElementById('cover-preview')
  loading.style.display = 'block'
  try {
    coverImgUrl = await uploadToCloudinary(input.files[0], `gncotentin/${newsId}`)
    preview.innerHTML = `<img src="${coverImgUrl}" alt="cover">`
  } catch (e) {
    console.error(e)
    alert("Erreur lors de l'upload de la couverture.")
  } finally {
    loading.style.display = 'none'
    input.value = ''
  }
}

// ── SECTIONS ─────────────────────────────────────────────────────────────────

window.addSection = (type = 'ImgOnLeft') => {
  sectionCount++
  const id = sectionCount
  const container = document.getElementById('sections-container')

  const card = document.createElement('div')
  card.className = 'section-card'
  card.dataset.id = id
  card.dataset.type = type
  card.dataset.imgUrl = ''

  const imgLeft  = type === 'ImgOnLeft'
  const textOnly = type === 'TextOnly'

  card.innerHTML = `
    <div class="section-header">
      <div class="section-type">
        ${textOnly ? `<span style="font-size:13px;color:#888;font-weight:bold;">TEXTE SEUL</span>` : `
          <button class="type-btn ${imgLeft ? 'active' : ''}" onclick="setType(${id}, 'ImgOnLeft', this)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:4px"><polyline points="15 18 9 12 15 6"/></svg>Image gauche</button>
          <button class="type-btn" onclick="setType(${id}, 'TextOnly', this)">Texte seul</button>
          <button class="type-btn ${!imgLeft ? 'active' : ''}" onclick="setType(${id}, 'ImgOnRight', this)">Image droite<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-left:4px"><polyline points="9 18 15 12 9 6"/></svg></button>
        `}
      </div>
      <button class="section-delete" onclick="removeSection(${id})" title="Supprimer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="section-body" id="body-${id}">
      ${imgLeft ? imgPanel(id) : ''}
      <div class="section-text"><div class="quill-wrap" id="editor-${id}"></div></div>
      ${(!imgLeft && !textOnly) ? imgPanel(id) : ''}
    </div>
  `

  container.appendChild(card)

  card._quill = createQuill(card.querySelector(`#editor-${id}`))

  setupImgUpload(card, id)
}

function imgPanel(id) {
  return `
    <div class="section-img-panel" id="img-panel-${id}">
      <div class="section-img-preview" id="img-preview-${id}" onclick="document.getElementById('img-input-${id}').click()">
        Cliquez pour ajouter une image
      </div>
      <input type="file" id="img-input-${id}" accept="image/*" style="display:none">
      <button class="section-upload-btn" onclick="document.getElementById('img-input-${id}').click()">Uploader</button>
      <button class="section-upload-btn" style="background:white;color:rgb(97,0,0);border:2px solid rgb(97,0,0);margin-top:4px;" onclick="pickSectionFromMedia(${id})">Bibliothèque</button>
    </div>
  `
}

function setupImgUpload(card, id) {
  const input = card.querySelector(`#img-input-${id}`)
  if (!input) return
  input.addEventListener('change', async () => {
    if (!input.files?.[0]) return
    const preview = card.querySelector(`#img-preview-${id}`)
    preview.textContent = 'Upload…'
    try {
      const url = await uploadToCloudinary(input.files[0], `gncotentin/${newsId}`)
      card.dataset.imgUrl = url
      preview.innerHTML = `<img src="${url}" alt="">`
    } catch (e) {
      console.error(e)
      preview.textContent = 'Erreur upload'
    }
    input.value = ''
  })
}

window.setType = (id, type, btn) => {
  const card = document.querySelector(`.section-card[data-id="${id}"]`)
  if (!card) return
  card.dataset.type = type
  card.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')

  const body = card.querySelector(`#body-${id}`)
  const quillContent = card._quill.root.innerHTML
  const imgUrl = card.dataset.imgUrl

  const textWrap = `<div class="section-text"><div class="quill-wrap" id="editor-${id}"></div></div>`
  if (type === 'TextOnly') {
    body.innerHTML = textWrap
  } else if (type === 'ImgOnLeft') {
    body.innerHTML = imgPanel(id) + textWrap
  } else {
    body.innerHTML = textWrap + imgPanel(id)
  }

  card._quill = createQuill(body.querySelector(`#editor-${id}`))
  card._quill.root.innerHTML = quillContent
  card.dataset.imgUrl = imgUrl

  const preview = body.querySelector(`#img-preview-${id}`)
  if (imgUrl) preview.innerHTML = `<img src="${imgUrl}" alt="">`

  setupImgUpload(card, id)
}

window.removeSection = (id) => {
  document.querySelector(`.section-card[data-id="${id}"]`)?.remove()
}

// ── MÉDIATHÈQUE ──────────────────────────────────────────────────────────────

let mediaCache = null
let mediaCallback = null

window.openMediaPicker = async (callback) => {
  mediaCallback = callback
  const modal = document.getElementById('media-modal')
  const grid  = document.getElementById('media-grid')
  modal.style.display = 'flex'

  if (mediaCache) { renderMediaGrid(grid, mediaCache); return }

  grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">Chargement…</p>'
  try {
    const snap = await getDocs(query(collection(db, 'news')))
    const urls = new Set()
    snap.forEach(d => {
      const n = d.data()
      if (n.coverImg) urls.add(n.coverImg)
      ;(n.sections ?? []).forEach(s => { if (s.imgUrl) urls.add(s.imgUrl) })
    })
    mediaCache = [...urls]
    renderMediaGrid(grid, mediaCache)
  } catch (e) {
    grid.innerHTML = '<p style="color:#c00;text-align:center;padding:40px;grid-column:1/-1;">Erreur de chargement</p>'
  }
}

function renderMediaGrid(grid, urls) {
  if (urls.length === 0) {
    grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">Aucune image disponible</p>'
    return
  }
  grid.innerHTML = ''
  urls.forEach(url => {
    const img = document.createElement('img')
    img.src = url
    img.style.cssText = 'width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;cursor:pointer;border:3px solid transparent;transition:border-color 0.15s;'
    img.onmouseover = () => { img.style.borderColor = 'rgb(97,0,0)' }
    img.onmouseout  = () => { img.style.borderColor = 'transparent' }
    img.onclick = () => { mediaCallback?.(url); closeMediaPicker() }
    grid.appendChild(img)
  })
}

window.closeMediaPicker = () => {
  document.getElementById('media-modal').style.display = 'none'
  mediaCallback = null
}

window.pickCoverFromMedia = () => {
  openMediaPicker(url => {
    coverImgUrl = url
    document.getElementById('cover-preview').innerHTML = `<img src="${url}" alt="cover">`
  })
}

window.pickSectionFromMedia = (id) => {
  const card    = document.querySelector(`.section-card[data-id="${id}"]`)
  const preview = card?.querySelector(`#img-preview-${id}`)
  if (!card || !preview) return
  openMediaPicker(url => {
    card.dataset.imgUrl = url
    preview.innerHTML  = `<img src="${url}" alt="">`
  })
}

// ── BROUILLON / PRÉVISUALISATION ─────────────────────────────────────────────

async function saveAsDraft() {
  const title   = document.getElementById('TitreInput').value.trim()
  const resume  = document.getElementById('ResumeInput').value.trim()
  const sections = Array.from(document.querySelectorAll('.section-card')).map(card => ({
    type:    card.dataset.type,
    content: card._quill?.root.innerHTML ?? '',
    imgUrl:  card.dataset.imgUrl || null
  }))
  const data = { title, resume, coverImg: coverImgUrl, sections, status: 'draft' }
  if (!isEdit && !draftSaved) data.createdAt = serverTimestamp()
  await setDoc(doc(db, 'news', newsId), data, { merge: true })
  draftSaved = true
  if (!isEdit) history.replaceState(null, '', `?id=${newsId}`)
}

window.saveDraft = async () => {
  if (!document.getElementById('TitreInput').value.trim()) {
    alert('Le titre est requis.'); document.getElementById('TitreInput').focus(); return
  }
  const label   = document.getElementById('draft-label')
  const spinner = document.getElementById('draft-spinner')
  label.style.display   = 'none'
  spinner.style.display = 'inline-block'
  try {
    await saveAsDraft()
    location.href = 'admin.html'
  } catch (e) {
    console.error(e); alert('Erreur lors de la sauvegarde du brouillon.')
    label.style.display   = 'inline'
    spinner.style.display = 'none'
  }
}

window.previewDraft = async () => {
  if (!document.getElementById('TitreInput').value.trim()) {
    alert('Le titre est requis.'); document.getElementById('TitreInput').focus(); return
  }
  const label   = document.getElementById('preview-label')
  const spinner = document.getElementById('preview-spinner')
  label.style.display   = 'none'
  spinner.style.display = 'inline-block'
  try {
    await saveAsDraft()
    window.open(`news.html?id=${newsId}`, '_blank')
  } catch (e) {
    console.error(e); alert('Erreur lors de la prévisualisation.')
  } finally {
    label.style.display   = 'inline'
    spinner.style.display = 'none'
  }
}

// ── PUBLICATION ──────────────────────────────────────────────────────────────

window.GiveUpNews = () => {
  if (confirm('Abandonner la création de cette actualité ?')) location.href = 'admin.html'
}

window.sendNewsFromDivs = async () => {
  const title  = document.getElementById('TitreInput').value.trim()
  const resume = document.getElementById('ResumeInput').value.trim()

  if (!title)  { alert('Le titre est requis.'); document.getElementById('TitreInput').focus(); return }
  if (!resume) { alert('Le résumé est requis.'); document.getElementById('ResumeInput').focus(); return }

  const label   = document.getElementById('publish-label')
  const spinner = document.getElementById('publish-spinner')
  label.style.display   = 'none'
  spinner.style.display = 'inline-block'

  const sections = Array.from(document.querySelectorAll('.section-card')).map(card => ({
    type:   card.dataset.type,
    content: card._quill?.root.innerHTML ?? '',
    imgUrl:  card.dataset.imgUrl || null
  }))

  try {
    const data = { title, resume, coverImg: coverImgUrl, sections, status: 'published' }
    if (!isEdit && !draftSaved) data.createdAt = serverTimestamp()
    await setDoc(doc(db, 'news', newsId), data, { merge: true })
    location.href = 'admin.html'
  } catch (e) {
    console.error(e)
    alert("Erreur lors de la publication.")
    label.style.display   = 'inline'
    spinner.style.display = 'none'
  }
}
