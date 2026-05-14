// src/store/authStore.js
import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useStore } from "./useStore";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  init: () => {
    onAuthStateChanged(auth, async (user) => {
      set({ user, loading: false });
      if (user) {
        await useStore.getState().loadFromFirestore(user);
      }
    });
  },

  loginWithEmail: async (email, password) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      set({ error: e.message });
    }
  },

  registerWithEmail: async (email, password) => {
    set({ error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      set({ error: e.message });
    }
  },

  loginWithGoogle: async () => {
    set({ error: null });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      set({ error: e.message });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
    useStore.setState({ collection: [], user: { username: "Otaku", bio: "", avatar: "" } });
  },
}));

export default useAuthStore;