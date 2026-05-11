import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_USER = {
  username: 'Otaku',
  avatar: null,
  bio: 'Amante del anime 🎌',
  joinDate: new Date().toISOString(),
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── USER ──
      user: DEFAULT_USER,
      setUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),

      // ── THEME ──
      theme: 'dark',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },

      // ── COLLECTION ──
      // entry: { id, malId, title, titleEn, image, banner, episodes, type, status, year, genres, score(MAL), season, airingDay, airingTime, broadcast }
      collection: [],

      addAnime: (anime, listStatus) => {
        const existing = get().collection.find((a) => a.malId === anime.malId)
        if (existing) return false
        const entry = {
          id: `at_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          ...anime,
          listStatus,       // watching | completed | plan | paused | dropped
          watchedEps: 0,
          userScore: null,
          notes: '',
          startDate: listStatus === 'watching' ? new Date().toISOString() : null,
          finishDate: null,
          addedAt: Date.now(),
          updatedAt: Date.now(),
          favorite: false,
          tags: [],
        }
        set((s) => ({ collection: [entry, ...s.collection] }))
        return true
      },

      updateAnime: (id, data) => {
        set((s) => ({
          collection: s.collection.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: Date.now() } : a
          ),
        }))
      },

      removeAnime: (id) => {
        set((s) => ({ collection: s.collection.filter((a) => a.id !== id) }))
      },

      toggleFavorite: (id) => {
        set((s) => ({
          collection: s.collection.map((a) =>
            a.id === id ? { ...a, favorite: !a.favorite } : a
          ),
        }))
      },

      // ── STATS ──
      getStats: () => {
        const col = get().collection
        const totalEps = col.reduce((s, a) => s + (a.watchedEps || 0), 0)
        const scored = col.filter((a) => a.userScore)
        return {
          total: col.length,
          watching: col.filter((a) => a.listStatus === 'watching').length,
          completed: col.filter((a) => a.listStatus === 'completed').length,
          plan: col.filter((a) => a.listStatus === 'plan').length,
          paused: col.filter((a) => a.listStatus === 'paused').length,
          dropped: col.filter((a) => a.listStatus === 'dropped').length,
          episodes: totalEps,
          days: +(totalEps * 24 / 1440).toFixed(1),
          meanScore: scored.length
            ? +(scored.reduce((s, a) => s + a.userScore, 0) / scored.length).toFixed(1)
            : null,
          favorites: col.filter((a) => a.favorite).length,
        }
      },
    }),
    {
      name: 'anitrack-store-v3',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)
