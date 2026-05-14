// src/store/firestoreService.js
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Guardar colección completa
export async function saveCollection(userId, collection) {
  await setDoc(doc(db, "users", userId), { collection }, { merge: true });
}

// Guardar perfil (username, bio, avatar, theme)
export async function saveProfile(userId, profile) {
  await setDoc(doc(db, "users", userId), { profile }, { merge: true });
}

// Cargar datos del usuario
export async function loadUserData(userId) {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? snap.data() : null;
}