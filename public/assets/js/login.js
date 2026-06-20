import { auth } from './firebase-init.js'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

const AUTH_DOMAIN = 'gncotentin.local'
const usernameToEmail = username => `${username.toLowerCase().trim()}@${AUTH_DOMAIN}`

onAuthStateChanged(auth, user => {
  if (user) location.href = 'admin.html'
})

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault()
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  try {
    await signInWithEmailAndPassword(auth, usernameToEmail(username), password)
    location.href = 'admin.html'
  } catch {
    document.getElementById('errorMsg').style.display = 'block'
  }
})
