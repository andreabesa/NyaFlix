// ══════════════════════════════════════════════
//  ANITRACK — Firebase Configuration
//  Rellena las variables en src/config/firebase.env.js
//  o directamente aquí con tus credenciales.
// ══════════════════════════════════════════════
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

// ─── TUS CREDENCIALES DE FIREBASE ───────────────
// Ve a https://console.firebase.google.com
// → Crea proyecto → Añade app web → Copia la config
const firebaseConfig = {
  apiKey: "AIzaSyBfzVHmq5dTTgymig8p4r_9bSa3SOvp2Ks",
  authDomain: "nyaflix-392c5.firebaseapp.com",
  projectId: "nyaflix-392c5",
  storageBucket: "nyaflix-392c5.firebasestorage.app",
  messagingSenderId: "196130991624",
  appId: "1:196130991624:web:c5642f053c71a1ade12bbd",
  measurementId: "G-DTVGFFN1E1"
}

const app  = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// ─── AUTH HELPERS ────────────────────────────────

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function registerWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  return result.user
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}
