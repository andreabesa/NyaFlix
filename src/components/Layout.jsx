import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import useAuthStore from "../store/authStore";
import {
  Home,
  Search,
  BookMarked,
  Calendar,
  User,
  Tv2,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import "./Layout.css";

const NAV = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/search", icon: Search, label: "Buscar" },
  { to: "/collection", icon: BookMarked, label: "Colección" },
  { to: "/calendar", icon: Calendar, label: "Calendario" },
  { to: "/profile", icon: User, label: "Perfil" },
];

const THEMES = [
  { id: "dark", label: "Oscuro", icon: "🌙" },
  { id: "light", label: "Claro", icon: "☀️" },
  { id: "amoled", label: "AMOLED", icon: "⚫" },
];

export default function Layout({ children }) {
  const { theme, setTheme } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const navigate = useNavigate();
  const storeUser = useStore((s) => s.user);
  const { user: firebaseUser, logout } = useAuthStore();

  return (
    <div className="layout">
      {/* ── TOP NAV ── */}
      <nav className="navbar">
        <button className="nav-burger" onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
        </button>
        <NavLink to="/" className="nav-logo">
          <Tv2 size={22} />
          <span>
            Nya<strong>Flix</strong>
          </span>
        </NavLink>
        <div className="nav-links">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
        // Dentro de nav-right, reemplaza todo lo que hay por esto:
        <div className="nav-right">
          {/* Theme picker — igual que antes */}
          <div className="theme-picker">
            <button
              className="theme-btn"
              onClick={() => setThemeOpen((o) => !o)}
            >
              <span>{THEMES.find((t) => t.id === theme)?.icon}</span>
              <ChevronDown size={13} />
            </button>
            {themeOpen && (
              <>
                <div
                  className="theme-backdrop"
                  onClick={() => setThemeOpen(false)}
                />
                <div className="theme-dropdown">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-option ${theme === t.id ? "active" : ""}`}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeOpen(false);
                      }}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Avatar + nombre + logout */}
          {user && (
            <div className="nav-user">
              <button
                className="nav-avatar"
                onClick={() => navigate("/profile")}
              >
                {firebaseUser?.photoURL ? (
                  <img src={firebaseUser.photoURL} alt="avatar" />
                ) : storeUser?.avatar ? (
                  <img src={storeUser.avatar} alt="avatar" />
                ) : (
                  <span>
                    {(storeUser?.username || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              <span
                className="nav-username"
                onClick={() => navigate("/profile")}
              >
                {storeUser?.username || firebaseUser?.displayName || "Perfil"}
              </span>
              <button
                className="nav-logout"
                onClick={logout}
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="nav-logo">
                <Tv2 size={20} />
                <span>
                  Nya<strong>Flix</strong>
                </span>
              </span>
              <button onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `drawer-item ${isActive ? "active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
            <div className="drawer-themes">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-option ${theme === t.id ? "active" : ""}`}
                  onClick={() => {
                    setTheme(t.id);
                    setMenuOpen(false);
                  }}
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
  );
}
