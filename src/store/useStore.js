// src/store/useStore.js
import { create } from "zustand";
import { saveCollection, saveProfile, loadUserData } from "./firestoreService";

export const useStore = create((set, get) => ({
  user: { username: "Otaku", bio: "", avatar: "" },
  theme: localStorage.getItem("theme") || "dark",
  collection: [],
  _userId: null,

  // Llamar al hacer login para cargar datos desde Firestore
  loadFromFirestore: async (firebaseUser) => {
    const uid = firebaseUser.uid;
    set({ _userId: uid });
    const data = await loadUserData(uid);
    if (data) {
      if (data.collection) set({ collection: data.collection });
      if (data.profile) set({ user: data.profile });
    }
  },

  setUser: async (updates) => {
    const newUser = { ...get().user, ...updates };
    set({ user: newUser });
    const uid = get()._userId;
    if (uid) await saveProfile(uid, newUser);
  },

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },

  addToCollection: async (anime) => {
    const exists = get().collection.find((a) => a.id === anime.id);
    let newCollection;
    if (exists) {
      newCollection = get().collection.map((a) =>
        a.id === anime.id ? { ...a, ...anime, updatedAt: Date.now() } : a
      );
    } else {
      newCollection = [...get().collection, { ...anime, updatedAt: Date.now() }];
    }
    set({ collection: newCollection });
    const uid = get()._userId;
    if (uid) await saveCollection(uid, newCollection);
  },

  removeFromCollection: async (animeId) => {
    const newCollection = get().collection.filter((a) => a.id !== animeId);
    set({ collection: newCollection });
    const uid = get()._userId;
    if (uid) await saveCollection(uid, newCollection);
  },

  updateInCollection: async (animeId, updates) => {
    const newCollection = get().collection.map((a) =>
      a.id === animeId ? { ...a, ...updates, updatedAt: Date.now() } : a
    );
    set({ collection: newCollection });
    const uid = get()._userId;
    if (uid) await saveCollection(uid, newCollection);
  },

  getStats: () => {
    const c = get().collection;
    const episodes = c.reduce((s, a) => s + (a.watchedEps || 0), 0);
    const scores = c.filter((a) => a.userScore).map((a) => a.userScore);
    return {
      total: c.length,
      episodes,
      days: Math.floor((episodes * 24) / 60 / 24),
      meanScore: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null,
      watching: c.filter((a) => a.listStatus === "watching").length,
      completed: c.filter((a) => a.listStatus === "completed").length,
      plan: c.filter((a) => a.listStatus === "plan").length,
      paused: c.filter((a) => a.listStatus === "paused").length,
      dropped: c.filter((a) => a.listStatus === "dropped").length,
    };
  },
}));