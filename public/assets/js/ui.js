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
    .dropdown { padding-bottom: 8px; }
    .dropdown-content { display: none; position: absolute; right: 0; background-color: #f9f9f9; min-width: 180px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); z-index: 1000; border-radius: 8px; overflow: hidden; top: 100%; }
    .dropdown-content a { color: var(--primary-color); padding: 12px 16px; text-decoration: none; display: block; font-weight: bold; font-size: 14px; }
    .dropdown-content a:hover { background-color: #f0e8e8; }
    .dropdown:hover .dropdown-content { display: block; }

    /* Burger */
    #burger-btn { display: none; background: none; border: 2px solid rgba(255,255,255,0.7); color: white; border-radius: 8px; width: 44px; height: 44px; cursor: pointer; font-size: 22px; align-items: center; justify-content: center; flex-shrink: 0; }

    /* Mobile menu overlay */
    #mobile-menu { display: none; position: fixed; inset: 0; background: rgb(97,0,0); z-index: 9999; flex-direction: column; padding: 24px 28px; overflow-y: auto; }
    #mobile-menu.open { display: flex; }
    #mobile-menu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    #mobile-menu-logo { color: white; font-family: Impact, Arial, sans-serif; font-size: 22px; }
    #mobile-menu-close { background: none; border: 2px solid rgba(255,255,255,0.5); color: white; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; }
    #mobile-menu a { color: white; text-decoration: none; font-size: 20px; font-weight: bold; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.12); font-family: Arial, sans-serif; display: block; }
    #mobile-menu a:last-child { border-bottom: none; }
    #mobile-menu a:active { opacity: 0.7; }

    @media (max-width: 1100px) {
      .header_button { padding: 0 10px; font-size: 13px; }
      #MainTitle { font-size: clamp(16px, 2.5vw, 50px); }
    }
    @media (max-width: 900px) {
      .header_button { padding: 0 8px; font-size: 12px; height: 34px; }
      .header_element { gap: 6px; }
    }
    @media (max-width: 768px) {
      #header { height: auto; flex-direction: row; padding: 14px 20px; overflow: visible; }
      .header-left { height: auto; margin-bottom: 0; }
      #MainLogo { height: 52px; }
      #MainTitle { font-size: 17px; }
      .header_element { display: none; }
      #burger-btn { display: flex; }
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
        <button class="header_button logout-trigger">Déconnexion</button>
      ` : `
        <button class="header_button" onclick="location.href='accueil.html'">Accueil</button>
        <button class="header_button" onclick="location.href='events.html'">Événements</button>
        <div class="dropdown">
          <button class="header_button">Pages ▾</button>
          <div class="dropdown-content">
            <a href="news-list.html">Actualités</a>
            <a href="galerie.html">Galerie</a>
          </div>
        </div>
        <button class="header_button" onclick="location.href='contact.html'">Nous Contacter</button>
        <button class="header_button" onclick="location.href='login.html'">Connexion</button>
      `}
    </div>
    <button id="burger-btn" onclick="document.getElementById('mobile-menu').classList.add('open')">☰</button>
  </div>

  <!-- Menu mobile -->
  <div id="mobile-menu">
    <div id="mobile-menu-header">
      <span id="mobile-menu-logo">GN Cotentin</span>
      <button id="mobile-menu-close" onclick="document.getElementById('mobile-menu').classList.remove('open')">×</button>
    </div>
    ${isAdmin ? `
      <a href="accueil.html">Accueil</a>
      <a href="news-list.html">Actualités</a>
      <a href="events.html">Événements</a>
      <a href="galerie.html">Galerie</a>
      <a href="admin.html">Dashboard</a>
      <a href="addNews.html">+ Nouvelle actualité</a>
      <a href="addEvent.html">+ Nouvel événement</a>
      <a href="addGalerie.html">+ Nouvel album</a>
      <a href="#" class="logout-trigger">Déconnexion</a>
    ` : `
      <a href="accueil.html">Accueil</a>
      <a href="events.html">Événements</a>
      <a href="news-list.html">Actualités</a>
      <a href="galerie.html">Galerie</a>
      <a href="contact.html">Nous Contacter</a>
      <a href="login.html">Connexion</a>
    `}
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
        <a href="news-list.html">Actualités</a>
        <a href="events.html">Événements</a>
        <a href="galerie.html">Galerie</a>
        <a href="contact.html">Nous contacter</a>
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
    document.querySelectorAll('.logout-trigger').forEach(el => {
      el.addEventListener('click', async e => {
        e.preventDefault()
        await signOut(auth)
        location.href = 'accueil.html'
      })
    })
  }
})
