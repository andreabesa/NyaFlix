import React, { useEffect } from 'react'
import { onAuthChange } from '../lib/firebase'
import { fetchUserProfile } from '../lib/firestoreService'
import { useStore } from '../store/useStore'

export default function AuthProvider({ children }) {
  const { setFirebaseUser, setAuthReady, setUser, setTheme, initFirestoreSync, stopFirestoreSync } = useStore()

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)
      setAuthReady(true)

      if (fbUser) {
        // Load profile from Firestore
        try {
          const profile = await fetchUserProfile(fbUser.uid)
          if (profile) {
            setUser({
              username: profile.username || fbUser.displayName || 'Otaku',
              bio:      profile.bio      || '',
              avatar:   profile.avatar   || fbUser.photoURL || null,
              joinDate: profile.joinDate || new Date().toISOString(),
            })
            if (profile.theme) setTheme(profile.theme)
          } else {
            // First login — seed profile from Firebase auth
            setUser({
              username: fbUser.displayName || 'Otaku',
              avatar:   fbUser.photoURL    || null,
            })
          }
        } catch (e) {
          console.error('Error loading profile:', e)
        }
        // Start real-time collection sync
        initFirestoreSync(fbUser.uid)
      } else {
        // Logged out — stop listener
        stopFirestoreSync()
      }
    })

    return unsub
  }, [])

  return children
}
