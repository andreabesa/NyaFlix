import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Trash2, Save } from 'lucide-react'
import './AddToListModal.css'

const STATUS_OPTIONS = [
  { value: 'watching',  label: '▶ Viendo',     cls: 'watching' },
  { value: 'completed', label: '✓ Completado',  cls: 'completed' },
  { value: 'plan',      label: '+ Pendiente',   cls: 'plan' },
  { value: 'paused',    label: '⏸ Pausado',    cls: 'paused' },
  { value: 'dropped',   label: '✕ Abandonado', cls: 'dropped' },
]

export default function AddToListModal({ anime, entry, onClose }) {
  const { addAnime, updateAnime, removeAnime } = useStore()

  const [status, setStatus]     = useState(entry?.listStatus || 'plan')
  const [eps, setEps]           = useState(entry?.watchedEps ?? 0)
  const [score, setScore]       = useState(entry?.userScore ?? '')
  const [notes, setNotes]       = useState(entry?.notes ?? '')
  const [startDate, setStart]   = useState(entry?.startDate?.slice(0,10) ?? '')
  const [finishDate, setFinish] = useState(entry?.finishDate?.slice(0,10) ?? '')

  function save() {
    if (entry) {
      updateAnime(entry.id, {
        listStatus: status,
        watchedEps: Number(eps) || 0,
        userScore: score !== '' ? Number(score) : null,
        notes,
        startDate: startDate || null,
        finishDate: finishDate || null,
      })
    } else {
      addAnime(anime, status)
      // update immediately after add
      const store = useStore.getState()
      const newEntry = store.collection.find((a) => a.malId === anime.malId)
      if (newEntry) {
        updateAnime(newEntry.id, {
          watchedEps: Number(eps) || 0,
          userScore: score !== '' ? Number(score) : null,
          notes,
          startDate: startDate || null,
          finishDate: finishDate || null,
        })
      }
    }
    onClose()
  }

  function remove() {
    if (entry && window.confirm('¿Eliminar de tu colección?')) {
      removeAnime(entry.id)
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="add-modal">
        <div className="add-modal-header">
          <div className="add-modal-anime">
            {anime.image && <img src={anime.image} alt={anime.title} />}
            <div>
              <p className="add-modal-title">{anime.title}</p>
              <p className="add-modal-sub">{anime.type}{anime.episodes ? ` · ${anime.episodes} eps` : ''}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Status tabs */}
        <div className="status-tabs">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              className={`status-tab status-tab-${s.cls} ${status === s.value ? 'active' : ''}`}
              onClick={() => setStatus(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="modal-fields">
          <div className="field-row">
            <div className="field-group">
              <label>Episodios vistos</label>
              <div className="eps-input">
                <input type="number" min="0" max={anime.episodes || 9999} value={eps}
                  onChange={(e) => setEps(e.target.value)} />
                {anime.episodes && <span>/ {anime.episodes}</span>}
              </div>
            </div>
            <div className="field-group">
              <label>Tu puntuación</label>
              <select value={score} onChange={(e) => setScore(e.target.value)}>
                <option value="">Sin puntuar</option>
                {[10,9,8,7,6,5,4,3,2,1].map((n) => (
                  <option key={n} value={n}>{n} — {
                    n===10?'Obra maestra':n===9?'Genial':n===8?'Muy bueno':
                    n===7?'Bueno':n===6?'Bien':n===5?'Regular':
                    n===4?'Malo':n===3?'Muy malo':n===2?'Horrible':'Basura'
                  }</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Fecha inicio</label>
              <input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Fecha fin</label>
              <input type="date" value={finishDate} onChange={(e) => setFinish(e.target.value)} />
            </div>
          </div>

          <div className="field-group full">
            <label>Notas</label>
            <textarea rows={2} placeholder="Notas personales..." value={notes}
              onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          {entry && (
            <button className="btn-remove" onClick={remove}><Trash2 size={15} /> Eliminar</button>
          )}
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={save}><Save size={15} /> Guardar</button>
        </div>
      </div>
    </div>
  )
}
