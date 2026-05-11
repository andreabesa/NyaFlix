import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Star, Plus, Check, Heart } from 'lucide-react'
import AddToListModal from './AddToListModal'
import './AnimeCard.css'

export default function AnimeCard({ anime, compact = false }) {
  const navigate = useNavigate()
  const { collection, toggleFavorite } = useStore()
  const [showAdd, setShowAdd] = useState(false)

  const entry = collection.find((a) => a.malId === anime.malId)
  const inList = !!entry

  function scoreClass(s) {
    if (!s) return ''
    if (s >= 8) return 'score-great'
    if (s >= 7) return 'score-good'
    if (s >= 5) return 'score-ok'
    return 'score-bad'
  }

  return (
    <>
      <div className={`anime-card ${compact ? 'compact' : ''}`}>
        {/* Image */}
        <div className="card-img-wrap" onClick={() => navigate(`/anime/${anime.malId}`)}>
          {anime.image
            ? <img src={anime.image} alt={anime.title} loading="lazy" />
            : <div className="card-img-placeholder"><span>📺</span></div>}
          {anime.score && (
            <div className={`card-score ${scoreClass(anime.score)}`}>
              <Star size={10} fill="currentColor" /> {anime.score}
            </div>
          )}
          {anime.airing && <div className="card-airing">EN EMISIÓN</div>}
          {inList && (
            <div className={`card-status-dot badge badge-${entry.listStatus}`}>
              {entry.listStatus === 'watching' ? 'Viendo' :
               entry.listStatus === 'completed' ? 'Completado' :
               entry.listStatus === 'plan' ? 'Pendiente' :
               entry.listStatus === 'paused' ? 'Pausado' : 'Abandonado'}
            </div>
          )}
          <div className="card-hover-overlay">
            <button
              className={`btn-add ${inList ? 'in-list' : ''}`}
              onClick={(e) => { e.stopPropagation(); setShowAdd(true) }}
            >
              {inList ? <Check size={15} /> : <Plus size={15} />}
              {inList ? 'En lista' : 'Añadir'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body" onClick={() => navigate(`/anime/${anime.malId}`)}>
          <p className="card-title">{anime.title}</p>
          {!compact && (
            <p className="card-meta">
              {anime.type}{anime.episodes ? ` · ${anime.episodes} eps` : ''}{anime.year ? ` · ${anime.year}` : ''}
            </p>
          )}
        </div>
      </div>

      {showAdd && (
        <AddToListModal anime={anime} entry={entry} onClose={() => setShowAdd(false)} />
      )}
    </>
  )
}
