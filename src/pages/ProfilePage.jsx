import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { User, Edit3, Save, Star, BookMarked, Play, Check, Clock, X, Download, Upload, Heart } from 'lucide-react'
import './ProfilePage.css'

const THEMES = [
  { id: 'dark',   label: 'Oscuro',  preview: ['#0d0f18', '#7c6ff5', '#141720'] },
  { id: 'light',  label: 'Claro',   preview: ['#f4f5fb', '#6254e8', '#ffffff'] },
  { id: 'amoled', label: 'AMOLED',  preview: ['#000000', '#b09aff', '#111111'] },
]

export default function ProfilePage() {
  const { user, setUser, theme, setTheme, collection, getStats } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user.username, bio: user.bio })
  const fileRef = useRef()

  const stats = getStats()

  const favorites = collection.filter((a) => a.favorite)
  const recentActivity = [...collection]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)

  function saveProfile() {
    setUser(form)
    setEditing(false)
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUser({ avatar: ev.target.result })
    reader.readAsDataURL(file)
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'anitrack_backup.json'
    a.click()
  }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const r = new FileReader()
    r.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error()
        if (window.confirm(`¿Importar ${data.length} anime? Reemplazará tu colección.`)) {
          useStore.setState({ collection: data })
        }
      } catch { alert('Archivo inválido') }
    }
    r.readAsText(file)
    e.target.value = ''
  }

  const statusColors = {
    watching: 'var(--blue)', completed: 'var(--green)',
    plan: 'var(--text-muted)', paused: 'var(--amber)', dropped: 'var(--red)'
  }

  return (
    <div className="profile-page">
      {/* Profile header */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="avatar-wrap">
            <div className="avatar-big" onClick={() => fileRef.current.click()}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" />
                : <span>{user.username?.charAt(0).toUpperCase()}</span>}
              <div className="avatar-edit-overlay"><Edit3 size={16} /></div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
          <div className="profile-info">
            {editing ? (
              <div className="profile-edit-form">
                <input
                  className="profile-edit-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Nombre de usuario"
                />
                <input
                  className="profile-edit-input"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Bio..."
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-save-profile" onClick={saveProfile}><Save size={14} /> Guardar</button>
                  <button className="btn-cancel-profile" onClick={() => setEditing(false)}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{user.username}</h1>
                <p className="profile-bio">{user.bio}</p>
                <button className="btn-edit-profile" onClick={() => setEditing(true)}>
                  <Edit3 size={14} /> Editar perfil
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-body">
        {/* Stats */}
        <section className="profile-section">
          <h2>Estadísticas</h2>
          <div className="stats-grid">
            <div className="stat-big purple"><span>{stats.total}</span><small>Anime total</small></div>
            <div className="stat-big green"><span>{stats.episodes.toLocaleString()}</span><small>Episodios vistos</small></div>
            <div className="stat-big amber"><span>{stats.days}</span><small>Días consumidos</small></div>
            <div className="stat-big coral">
              <span>{stats.meanScore || '—'}</span>
              <small>Puntuación media</small>
            </div>
          </div>

          {/* Distribution bar */}
          {stats.total > 0 && (
            <div className="dist-section">
              <p className="dist-label">Distribución de lista</p>
              <div className="dist-bar">
                {[
                  { key: 'watching', label: 'Viendo' },
                  { key: 'completed', label: 'Completado' },
                  { key: 'plan', label: 'Pendiente' },
                  { key: 'paused', label: 'Pausado' },
                  { key: 'dropped', label: 'Abandonado' },
                ].map(({ key, label }) => {
                  const val = stats[key] || 0
                  const pct = stats.total ? (val / stats.total) * 100 : 0
                  return pct > 0 ? (
                    <div key={key} className="dist-seg" style={{ width: `${pct}%`, background: statusColors[key] }}
                      title={`${label}: ${val}`} />
                  ) : null
                })}
              </div>
              <div className="dist-legend">
                {[
                  { key: 'watching', label: 'Viendo' },
                  { key: 'completed', label: 'Completado' },
                  { key: 'plan', label: 'Pendiente' },
                  { key: 'paused', label: 'Pausado' },
                  { key: 'dropped', label: 'Abandonado' },
                ].map(({ key, label }) => stats[key] > 0 && (
                  <span key={key} className="dist-item">
                    <i style={{ background: statusColors[key] }} />
                    {label} ({stats[key]})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Themes */}
        <section className="profile-section">
          <h2>Tema de la interfaz</h2>
          <div className="themes-grid">
            {THEMES.map((t) => (
              <button key={t.id} className={`theme-card ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}>
                <div className="theme-preview">
                  <div style={{ background: t.preview[0], flex: 3, display: 'flex', alignItems: 'center', padding: '8px' }}>
                    <div style={{ width: 40, height: 6, background: t.preview[1], borderRadius: 3 }} />
                  </div>
                  <div style={{ background: t.preview[2], flex: 1 }} />
                </div>
                <span>{t.label}</span>
                {theme === t.id && <Check size={14} className="theme-check" />}
              </button>
            ))}
          </div>
        </section>

        {/* Favorites */}
        {favorites.length > 0 && (
          <section className="profile-section">
            <h2><Heart size={16} /> Favoritos</h2>
            <div className="favs-grid">
              {favorites.map((a) => (
                <div key={a.id} className="fav-card">
                  {a.image && <img src={a.image} alt={a.title} />}
                  <p>{a.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <section className="profile-section">
            <h2><Clock size={16} /> Actividad reciente</h2>
            <div className="activity-list">
              {recentActivity.map((a) => (
                <div key={a.id} className="activity-item">
                  {a.image && <img src={a.image} alt={a.title} />}
                  <div>
                    <p className="activity-title">{a.title}</p>
                    <div className={`badge badge-${a.listStatus}`} style={{ fontSize: 10, marginTop: 3 }}>
                      {a.listStatus === 'watching' ? 'Viendo' :
                       a.listStatus === 'completed' ? 'Completado' :
                       a.listStatus === 'plan' ? 'Pendiente' :
                       a.listStatus === 'paused' ? 'Pausado' : 'Abandonado'}
                    </div>
                  </div>
                  {a.userScore && (
                    <span className="activity-score">
                      <Star size={12} fill="currentColor" /> {a.userScore}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Data management */}
        <section className="profile-section">
          <h2>Gestión de datos</h2>
          <div className="data-actions">
            <button className="data-btn export" onClick={exportData}>
              <Download size={16} /> Exportar colección (JSON)
            </button>
            <label className="data-btn import">
              <Upload size={16} /> Importar colección
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
            </label>
          </div>
          <p className="data-note">Los datos se guardan en el navegador (localStorage). Exporta regularmente para no perderlos.</p>
        </section>
      </div>
    </div>
  )
}
