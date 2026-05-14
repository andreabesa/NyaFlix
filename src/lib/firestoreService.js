// ══════════════════════════════════════════════
//  ANITRACK — Firestore Service
//  Toda la lógica de lectura/escritura en Firestore
// ══════════════════════════════════════════════
import {
  doc, collection, setDoc, getDoc, updateDoc,
  deleteDoc, getDocs, writeBatch, onSnapshot,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── COLLECTION PATH ────────────────────────────
// /users/{uid}/collection/{animeId}
const userRef   = (uid)             => doc(db, 'users', uid)
const colRef    = (uid)             => collection(db, 'users', uid, 'collection')
const animeRef  = (uid, animeId)    => doc(db, 'users', uid, 'collection', String(animeId))

// ─── USER PROFILE ────────────────────────────────

export async function saveUserProfile(uid, profile) {
  await setDoc(userRef(uid), {
    username:   profile.username  || 'Otaku',
    bio:        profile.bio       || '',
    avatar:     profile.avatar    || null,
    theme:      profile.theme     || 'dark',
    updatedAt:  serverTimestamp(),
  }, { merge: true })
}

export async function fetchUserProfile(uid) {
  const snap = await getDoc(userRef(uid))
  return snap.exists() ? snap.data() : null
}

// ─── COLLECTION SYNC ─────────────────────────────

/** Escucha en tiempo real la colección del usuario.
 *  Llama a `callback(entries[])` cada vez que cambia Firestore.
 *  Devuelve la función unsubscribe. */
export function subscribeCollection(uid, callback) {
  const q = query(colRef(uid), orderBy('addedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(entries)
  })
}

/** Guarda o actualiza una entrada */
export async function upsertEntry(uid, entry) {
  const ref = animeRef(uid, entry.id)
  await setDoc(ref, {
    ...entry,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/** Elimina una entrada */
export async function deleteEntry(uid, entryId) {
  await deleteDoc(animeRef(uid, entryId))
}

/** Importación masiva — usa batch para eficiencia.
 *  Sube un array de entries en lotes de 500. */
export async function importCollection(uid, entries) {
  const BATCH_SIZE = 400
  let count = 0

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = entries.slice(i, i + BATCH_SIZE)

    chunk.forEach(entry => {
      const ref = animeRef(uid, entry.id)
      batch.set(ref, {
        ...entry,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    })

    await batch.commit()
    count += chunk.length
  }
  return count
}

/** Descarga toda la colección una sola vez (para export) */
export async function fetchCollection(uid) {
  const snap = await getDocs(colRef(uid))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Borra toda la colección del usuario */
export async function clearCollection(uid) {
  const snap = await getDocs(colRef(uid))
  const BATCH_SIZE = 400
  const ids = snap.docs.map(d => d.id)

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    ids.slice(i, i + BATCH_SIZE).forEach(id => {
      batch.delete(animeRef(uid, id))
    })
    await batch.commit()
  }
}
