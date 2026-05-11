import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import useAuthStore from "../store/authStore";
import {
  Home, Search, BookMarked, Calendar, User, Sun, Moon,
  Tv2, Menu, X, Star, Heart, ChevronDown, Layers
} from 'lucide-react'
import './Layout.css'

const NAV = [
  { to: '/',           icon: Home,       label: 'Inicio' },
  { to: '/search',     icon: Search,     label: 'Buscar' },
  { to: '/collection', icon: BookMarked, label: 'Colección' },
  { to: '/calendar',   icon: Calendar,   label: 'Calendario' },
  { to: '/profile',    icon: User,       label: 'Perfil' },
]

const THEMES = [
  { id: 'dark',   label: 'Oscuro',  icon: '🌙' },
  { id: 'light',  label: 'Claro',   icon: '☀️' },
  { id: 'amoled', label: 'AMOLED',  icon: '⚫' },
]

function Header() {
  const { user, logout } = useAuthStore();

   return (
    <header>
      {/* ... tu header existente ... */}
      {user && (
        <div className="user-info">
          <img src={user.photoURL || "/default-avatar.png"} alt="avatar" width="32" style={{borderRadius:"50%"}} />
          <span>{user.displayName || user.email}</span>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      )}
    </header>
  );
}

export default function Layout({ children }) {
  const { user, theme, setTheme } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="layout">
      {/* ── TOP NAV ── */}
      <nav className="navbar">
        <button className="nav-burger" onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
        </button>

        <NavLink to="/" className="nav-logo">
          <Tv2 size={22} />
          <span>Nya<strong>Flix</strong></span>
        </NavLink>

        <div className="nav-links">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          {/* Theme picker */}
          <div className="theme-picker">
            <button className="theme-btn" onClick={() => setThemeOpen((o) => !o)}>
              <span>{THEMES.find((t) => t.id === theme)?.icon}</span>
              <ChevronDown size={13} />
            </button>
            {themeOpen && (
              <>
                <div className="theme-backdrop" onClick={() => setThemeOpen(false)} />
                <div className="theme-dropdown">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-option ${theme === t.id ? 'active' : ''}`}
                      onClick={() => { setTheme(t.id); setThemeOpen(false) }}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Avatar */}
          <button className="nav-avatar" onClick={() => navigate('/profile')}>
            {user.avatar
              ? <img src={user.avatar} alt={user.username} />
              : <span>{user.username?.charAt(0).toUpperCase()}</span>}
          </button>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="nav-logo"><Tv2 size={20} /> <span>Ani<strong>Track</strong></span></span>
              <button onClick={() => setMenuOpen(false)}><X size={20} /></button>
            </div>
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
            <div className="drawer-themes">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-option ${theme === t.id ? 'active' : ''}`}
                  onClick={() => { setTheme(t.id); setMenuOpen(false) }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE ── */}
      <main className="page">{children}</main>
    </div>
  )
}
