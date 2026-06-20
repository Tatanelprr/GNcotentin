import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

const firebaseConfig = {
  apiKey: "AIzaSyCJ-jO8Pop27MZvB_QPklqx5_J2-QtXoSQ",
  authDomain: "gncotentin.firebaseapp.com",
  projectId: "gncotentin",
  storageBucket: "gncotentin.firebasestorage.app",
  messagingSenderId: "481454748651",
  appId: "1:481454748651:web:e6476aa75528fa3891dfae",
  measurementId: "G-XWMR33VXRG"
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db   = getFirestore(app)
export const auth = getAuth(app)
