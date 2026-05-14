import React, { useState } from 'react'
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase'
import { X, Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function clearError() { setError('') }

  async function handleGoogle() {
    setLoading(true); setError('')
    try {
      await loginWithGoogle()
      onClose()
    } catch (e) {
      setError(friendlyError(e.code))
    } finally { setLoading(false) }
  }

  async function handleEmail(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password)
      } else {
        if (!name.trim()) { setError('Escribe tu nombre de usuario'); setLoading(false); return }
        await registerWithEmail(email, password, name.trim())
      }
      onClose()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally { setLoading(false) }
  }

  function friendlyError(code) {
    const map = {
      'auth/user-not-found':      'No existe ninguna cuenta con ese email.',
      'auth/wrong-password':      'Contraseña incorrecta.',
      'auth/email-already-in-use':'Ya existe una cuenta con ese email.',
      'auth/weak-password':       'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-email':       'El email no es válido.',
      'auth/popup-closed-by-user':'Ventana cerrada. Inténtalo de nuevo.',
      'auth/network-request-failed':'Error de red. Comprueba tu conexión.',
      'auth/too-many-requests':   'Demasiados intentos. Espera un momento.',
    }
    return map[code] || 'Ocurrió un error. Inténtalo de nuevo.'
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <div className="auth-modal-header">
          <div className="auth-logo">🎌 AniTrack</div>
          <button className="auth-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login'    ? 'active' : ''} onClick={() => { setMode('login');    clearError() }}>Iniciar sesión</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); clearError() }}>Crear cuenta</button>
        </div>

        <div className="auth-body">
          {/* Google */}
          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>

          <div className="auth-divider"><span>o con email</span></div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleEmail} className="auth-form">
            {mode === 'register' && (
              <div className="auth-field">
                <User size={16} className="field-icon" />
                <input type="text" placeholder="Nombre de usuario" value={name}
                  onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </div>
            )}
            <div className="auth-field">
              <Mail size={16} className="field-icon" />
              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="auth-field">
              <Lock size={16} className="field-icon" />
              <input type={showPass ? 'text' : 'password'} placeholder="Contraseña" value={password}
                onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              <button type="button" className="show-pass" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? <Loader size={16} className="spin" /> : null}
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-note">
            Al continuar aceptas que tus datos se guardan en Firebase Firestore
            y se sincronizan entre dispositivos.
          </p>
        </div>
      </div>
    </div>
  )
}
