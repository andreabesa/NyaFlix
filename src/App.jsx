import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CollectionPage from './pages/CollectionPage'
import CalendarPage from './pages/CalendarPage'
import AnimePage from './pages/AnimePage'
import ProfilePage from './pages/ProfilePage'
import { auth, db } from "./firebase";

export default function App() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/collection/:status" element={<CollectionPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/anime/:id" element={<AnimePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
