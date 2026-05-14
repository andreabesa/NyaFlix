import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { parseMALExport, parseAniListExport } from '../lib/api'
import { logout } from '../lib/firebase'
import { Settings, Download, Upload, Trash2, CheckCircle, AlertCircle, FileText, LogOut } from 'lucide-react'
import './SettingsPage.css'

const THEMES = [
  { id:'dark',   label:'Oscuro',    icon:'🌙', desc:'Tema oscuro clásico' },
  { id:'light',  label:'Claro',     icon:'☀️', desc:'Fondo blanco limpio' },
  { id:'amoled', label:'AMOLED',    icon:'⚫', desc:'Negro puro, ideal para OLED' },
  { id:'sakura', label:'Sakura 🌸', icon:'🌸', desc:'Aesthetic rosa galaxia con degradado azul‑rosa' },
]

export default function SettingsPage() {
  const { collection, theme, setTheme, firebaseUser, bulkImport, clearAll } = useStore()
  const [importStatus, setImportStatus] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [importing, setImporting]       = useState(false)
  const malRef  = useRef()
  const alRef   = useRef()
  const jsonRef = useRef()

  function exportJSON() {
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type:'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'anitrack_backup.json'; a.click()
  }

  async function runImport(entries, source) {
    setImporting(true); setImportStatus(null)
    try {
      const added = await bulkImport(entries)
      const skipped = entries.length - added
      setImportStatus({ type:'success', msg:`✓ ${source}: ${added} añadidos${skipped?`, ${skipped} ya existentes`:''}.` })
    } catch(e) {
      setImportStatus({ type:'error', msg:`✗ Error al importar: ${e.message}` })
    } finally { setImporting(false) }
  }

  function readFile(file, parse) {
    const r = new FileReader()
    r.onload = async (ev) => {
      try {
        const entries = parse(ev.target.result)
        if (!entries.length) throw new Error('No se encontraron entradas')
        await runImport(entries, file.name)
      } catch(e) { setImportStatus({ type:'error', msg:`✗ Error: ${e.message}` }) }
    }
    r.readAsText(file)
  }

  function handleMAL(e)  { const f = e.target.files[0]; if(f) readFile(f, parseMALExport);         e.target.value='' }
  function handleAL(e)   { const f = e.target.files[0]; if(f) readFile(f, t => parseAniListExport(JSON.parse(t))); e.target.value='' }
  function handleJSON(e) {
    const f = e.target.files[0]; if(!f) return
    const r = new FileReader()
    r.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error('Formato inválido')
        await runImport(data, 'JSON')
      } catch(e) { setImportStatus({ type:'error', msg:`✗ Error: ${e.message}` }) }
    }
    r.readAsText(f); e.target.value=''
  }

  async function handleClear() {
    await clearAll()
    setConfirmClear(false)
    setImportStatus({ type:'success', msg:'✓ Colección eliminada.' })
  }

  const syncStatus = firebaseUser
    ? <span className="sync-on">☁ Sincronizado con Firebase ({firebaseUser.email})</span>
    : <span className="sync-off">⚠ Sin cuenta — los datos solo se guardan localmente</span>

  return (
    <div className="settings-page">
      <div className="settings-hero">
        <Settings size={24}/>
        <div>
          <h1>Opciones</h1>
          <p>Configura tu experiencia de AniTrack</p>
        </div>
        <div className="settings-sync">{syncStatus}</div>
      </div>

      <div className="settings-body">
        {/* Theme */}
        <section className="settings-section">
          <h2>🎨 Tema visual</h2>
          <div className="theme-cards">
            {THEMES.map(t => (
              <button key={t.id} className={`theme-card-big ${theme===t.id?'active':''}`} onClick={() => setTheme(t.id)}>
                <div className={`theme-preview-big theme-preview-${t.id}`}>
                  <div className="tpb-nav"/>
                  <div className="tpb-content">
                    <div className="tpb-card"/>
                    <div className="tpb-card tpb-card-2"/>
                  </div>
                </div>
                <div className="theme-card-label">
                  <span>{t.icon} {t.label}</span>
                  <small>{t.desc}</small>
                </div>
                {theme===t.id && <div className="theme-active-check"><CheckCircle size={18}/></div>}
              </button>
            ))}
          </div>
        </section>

        {/* Import */}
        <section className="settings-section">
          <h2>📥 Importar lista</h2>
          <p className="settings-desc">
            Importa tu colección desde MAL o AniList. Los duplicados se omiten automáticamente.
            {firebaseUser && ' Los datos se subirán a Firestore en tiempo real.'}
          </p>

          {importStatus && (
            <div className={`import-status ${importStatus.type}`}>
              {importStatus.type==='success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
              {importStatus.msg}
            </div>
          )}

          {importing && <div className="importing-bar"><div className="importing-fill"/></div>}

          <div className="import-cards">
            <div className="import-card">
              <div className="import-card-header">
                <div className="import-icon mal">MAL</div>
                <div>
                  <h4>MyAnimeList</h4>
                  <p>Perfil → Export → Animelist (XML)</p>
                </div>
              </div>
              <button className="btn-import" onClick={() => malRef.current.click()} disabled={importing}>
                <Upload size={15}/> Importar XML de MAL
              </button>
              <input ref={malRef} type="file" accept=".xml" style={{display:'none'}} onChange={handleMAL}/>
            </div>

            <div className="import-card">
              <div className="import-card-header">
                <div className="import-icon al">AL</div>
                <div>
                  <h4>AniList</h4>
                  <p>Perfil → Import/Export → Export (JSON)</p>
                </div>
              </div>
              <button className="btn-import al-btn" onClick={() => alRef.current.click()} disabled={importing}>
                <Upload size={15}/> Importar JSON de AniList
              </button>
              <input ref={alRef} type="file" accept=".json" style={{display:'none'}} onChange={handleAL}/>
            </div>

            <div className="import-card">
              <div className="import-card-header">
                <div className="import-icon json"><FileText size={18}/></div>
                <div>
                  <h4>Backup AniTrack</h4>
                  <p>Backup JSON exportado desde AniTrack</p>
                </div>
              </div>
              <button className="btn-import json-btn" onClick={() => jsonRef.current.click()} disabled={importing}>
                <Upload size={15}/> Importar backup JSON
              </button>
              <input ref={jsonRef} type="file" accept=".json" style={{display:'none'}} onChange={handleJSON}/>
            </div>
          </div>
        </section>

        {/* Export */}
        <section className="settings-section">
          <h2>📤 Exportar datos</h2>
          <p className="settings-desc">Descarga tu colección en JSON para hacer backup.</p>
          <button className="btn-export" onClick={exportJSON}>
            <Download size={16}/> Exportar colección ({collection.length} animes)
          </button>
        </section>

        {/* Firebase info */}
        {firebaseUser && (
          <section className="settings-section">
            <h2>☁ Firebase</h2>
            <div className="firebase-info">
              <div className="fi-row"><span>Cuenta</span><strong>{firebaseUser.email}</strong></div>
              <div className="fi-row"><span>UID</span><code>{firebaseUser.uid}</code></div>
              <div className="fi-row"><span>Anime guardados</span><strong>{collection.length}</strong></div>
              <div className="fi-row"><span>Sync</span><strong style={{color:'var(--green)'}}>● Activo</strong></div>
            </div>
            <button className="btn-logout-settings" onClick={logout}>
              <LogOut size={15}/> Cerrar sesión
            </button>
          </section>
        )}

        {/* Danger zone */}
        <section className="settings-section danger-zone">
          <h2>⚠️ Zona peligrosa</h2>
          <p className="settings-desc">Estas acciones son irreversibles.{firebaseUser && ' Se borrarán también de Firestore.'}</p>
          {!confirmClear ? (
            <button className="btn-danger-big" onClick={() => setConfirmClear(true)}>
              <Trash2 size={16}/> Eliminar toda la colección
            </button>
          ) : (
            <div className="confirm-clear">
              <p>¿Estás seguro? Se eliminarán <strong>{collection.length} animes</strong>.</p>
              <div className="confirm-actions">
                <button onClick={() => setConfirmClear(false)}>Cancelar</button>
                <button className="btn-confirm-delete" onClick={handleClear}><Trash2 size={14}/> Sí, eliminar todo</button>
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section className="settings-section">
          <h2>ℹ️ Sobre AniTrack</h2>
          <div className="about-card">
            <p><strong>AniTrack</strong> — Tu gestor personal de anime</p>
            <p>API: <a href="https://jikan.moe" target="_blank" rel="noopener noreferrer">Jikan v4</a> (MyAnimeList). Base de datos: Firebase Firestore.</p>
            <p>Los datos se sincronizan automáticamente al iniciar sesión con Google o email.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
