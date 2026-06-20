import { auth } from './firebase-init.js'
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

function buildHeader(isAdmin) {
  return `
  <style>
    :root { --primary-color: rgb(97,0,0); --text-white: #fff; }
    #header { background-color: var(--primary-color); height: 120px; padding: 0 5vh; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2vh; font-family: Arial, sans-serif; overflow: visible; }
    .header-left { display: flex; align-items: center; height: 100%; min-width: 0; }
    #MainLogo { height: 90%; width: auto; flex-shrink: 0; }
    #MainTitle { color: var(--text-white); margin: 0; font-size: clamp(18px, 3vw, 50px); padding-left: 20px; font-family: Impact, 'Arial Narrow Bold', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header_element { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .header_button { height: 40px; padding: 0 20px; background-color: var(--primary-color); border: 2px solid white; border-radius: 20px; color: white; font-size: 16px; cursor: pointer; transition: 0.3s; font-family: Arial, sans-serif; white-space: nowrap; }
    .header_button:hover { background-color: white; color: var(--primary-color); }
    .dropdown { position: relative; display: inline-block; }
    .dropdown-content { display: none; position: absolute; right: 0; background-color: #f9f9f9; min-width: 160px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); z-index: 1000; border-radius: 5px; overflow: hidden; }
    .dropdown-content a { color: var(--primary-color); padding: 12px 16px; text-decoration: none; display: block; font-weight: bold; }
    .dropdown-content a:hover { background-color: #ddd; }
    .dropdown:hover .dropdown-content { display: block; }
    @media (max-width: 1100px) {
      .header_button { padding: 0 10px; font-size: 13px; }
      #MainTitle { font-size: clamp(16px, 2.5vw, 50px); }
    }
    @media (max-width: 900px) {
      .header_button { padding: 0 8px; font-size: 12px; height: 34px; }
      .header_element { gap: 6px; }
    }
    @media (max-width: 768px) {
      #header { height: auto; flex-direction: column; padding: 15px; overflow: visible; }
      .header-left { width: 100%; justify-content: center; margin-bottom: 15px; }
      #MainLogo { height: 60px; }
      #MainTitle { font-size: 20px; margin-left: 10px; }
      .header_element { width: 100%; flex-wrap: wrap; justify-content: center; }
    }
  </style>
  <div id="header">
    <div class="header-left">
      <img src="assets/img/ui/viking.png" id="MainLogo" alt="Logo">
      <p id="MainTitle">Les Géocacheurs Normands</p>
    </div>
    <div class="header_element">
      ${isAdmin ? `
        <button class="header_button" onclick="location.href='accueil.html'">Accueil</button>
        <button class="header_button" onclick="location.href='news-list.html'">Actualités</button>
        <button class="header_button" onclick="location.href='events.html'">Événements</button>
        <button class="header_button" onclick="location.href='admin.html'">Dashboard</button>
        <div class="dropdown">
          <button class="header_button">+ Nouveau ▾</button>
          <div class="dropdown-content">
            <a href="addNews.html">Nouvelle actualité</a>
            <a href="addEvent.html">Nouvel événement</a>
            <a href="addGalerie.html">Nouvel album</a>
          </div>
        </div>
        <button class="header_button" id="logoutLink">Déconnexion</button>
      ` : `
        <button class="header_button" onclick="location.href='accueil.html'">Accueil</button>
        <button class="header_button" onclick="location.href='news-list.html'">Actualités</button>
        <button class="header_button" onclick="location.href='events.html'">Événements</button>
        <button class="header_button" onclick="location.href='galerie.html'">Galerie</button>
        <button class="header_button" onclick="location.href='contact.html'">Nous Contacter</button>
        <button class="header_button" onclick="location.href='login.html'">Connexion</button>
      `}
    </div>
  </div>`
}

function buildFooter() {
  return `
  <style>
    body { display: flex !important; flex-direction: column !important; min-height: 100vh !important; }
  </style>
  <style>
    .footer-container { background-color: rgb(97,0,0); color: white; padding: 40px 20px; font-family: Arial, sans-serif; margin-top: auto; border-top: 5px solid white; }
    .footer-content { display: flex; justify-content: space-around; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; }
    .footer-section { flex: 1; padding: 10px; min-width: 250px; }
    .footer-section h3 { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px; color: white !important; text-transform: uppercase; letter-spacing: 1px; }
    .footer-section p, .footer-section a { font-size: 16px; color: #f1f1f1; text-decoration: none; display: block; margin-bottom: 8px; }
    .footer-section a:hover { color: rgb(235,215,205); text-decoration: underline; }
    .footer-bottom { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 14px; color: white; }
    @media (max-width: 768px) { .footer-content { flex-direction: column; align-items: center; } }
  </style>
  <footer class="footer-container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Les Géocacheurs Normands</h3>
        <p>Association loi 1901 dédiée à la promotion du géocaching dans le Cotentin.</p>
      </div>
      <div class="footer-section">
        <h3>Liens Utiles</h3>
        <a href="accueil.html">Accueil</a>
        <a href="mailto:Gcncotentin@gmail.com">Nous contacter</a>
        <a href="login.html">Espace Admin</a>
      </div>
      <div class="footer-section">
        <h3>Informations Légales</h3>
        <a href="mentions.html">Mentions Légales</a>
        <a href="https://www.helloasso.com/associations/les-geocacheurs-normands-du-cotentin" target="_blank">Adhérer via HelloAsso</a>
      </div>
    </div>
    <div class="footer-bottom">&copy; ${new Date().getFullYear()} Les Géocacheurs Normands du Cotentin.</div>
  </footer>`
}

window.__scrollTo = (id, offset = 0) => {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + offset, behavior: 'smooth' })
}

onAuthStateChanged(auth, user => {
  document.body.insertAdjacentHTML('afterbegin', buildHeader(!!user))
  document.body.insertAdjacentHTML('beforeend', buildFooter())
  if (user) {
    document.getElementById('logoutLink')?.addEventListener('click', async e => {
      e.preventDefault()
      await signOut(auth)
      location.href = 'accueil.html'
    })
  }
})
