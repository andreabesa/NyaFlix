import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnimeById } from '../lib/api'
import { useStore } from '../store/useStore'
import AddToListModal from '../components/AddToListModal'
import { ArrowLeft, Star, Play, BookMarked, Heart, ExternalLink, Plus, Pencil } from 'lucide-react'
import './AnimePage.css'

export default function AnimePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { collection, toggleFavorite } = useStore()
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const entry = collection.find((a) => a.malId === Number(id))

  useEffect(() => {
    setLoading(true)
    getAnimeById(id)
      .then(setAnime)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  function scoreColor(s) {
    if (!s) return ''
    if (s >= 8) return 'score-great'
    if (s >= 7) return 'score-good'
    if (s >= 5) return 'score-ok'
    return 'score-bad'
  }

  if (loading) {
    return (
      <div className="anime-page-loading">
        <div className="skeleton" style={{ height: 300, borderRadius: 0 }} />
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 32, width: 300, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 200, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
        </div>
      </div>
    )
  }

  if (!anime) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
      <p>No se encontró el anime.</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 16, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Volver</button>
    </div>
  )

  return (
    <div className="anime-page fade-in">
      {/* Banner / Hero */}
      <div className="ap-hero" style={{ backgroundImage: anime.image ? `url(${anime.image})` : undefined }}>
        <div className="ap-hero-overlay" />
        <div className="ap-hero-content">
          <button className="ap-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Volver
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ap-main">
        {/* Poster column */}
        <div className="ap-poster-col">
          <div className="ap-poster">
            {anime.image
              ? <img src={anime.image} alt={anime.title} />
              : <div className="ap-poster-ph">📺</div>}
          </div>

          {/* List actions */}
          <button className="ap-list-btn" onClick={() => setShowModal(true)}>
            {entry ? <><Pencil size={15} /> Editar lista</> : <><Plus size={15} /> Añadir a lista</>}
          </button>

          {entry && (
            <button
              className={`ap-fav-btn ${entry.favorite ? 'active' : ''}`}
              onClick={() => toggleFavorite(entry.id)}
            >
              <Heart size={15} fill={entry.favorite ? 'currentColor' : 'none'} />
              {entry.favorite ? 'Quitar favorito' : 'Favorito'}
            </button>
          )}

          {/* Quick stats */}
          <div className="ap-quick-stats">
            {anime.score && (
              <div className="aq-stat">
                <span className={scoreColor(anime.score)}><Star size={14} fill="currentColor" /> {anime.score}</span>
                <small>Nota MAL</small>
              </div>
            )}
            {anime.rank && (
              <div className="aq-stat">
                <span>#{anime.rank}</span>
                <small>Ranking</small>
              </div>
            )}
            {anime.popularity && (
              <div className="aq-stat">
                <span>#{anime.popularity}</span>
                <small>Popularidad</small>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="ap-info-list">
            {[
              { label: 'Formato', value: anime.type },
              { label: 'Episodios', value: anime.episodes ?? '?' },
              { label: 'Estado', value: anime.status },
              { label: 'Temporada', value: anime.season && anime.year ? `${anime.season} ${anime.year}` : anime.year },
              { label: 'Emisión', value: anime.broadcast || anime.aired },
              { label: 'Duración', value: anime.duration },
              { label: 'Fuente', value: anime.source },
              { label: 'Rating', value: anime.rating },
            ].filter((i) => i.value).map(({ label, value }) => (
              <div key={label} className="ap-info-row">
                <span className="ap-info-label">{label}</span>
                <span className="ap-info-value">{value}</span>
              </div>
            ))}
          </div>

          {anime.studios?.length > 0 && (
            <div className="ap-section-mini">
              <p className="ap-mini-label">Estudios</p>
              <div className="ap-tags">
                {anime.studios.map((s) => <span key={s} className="ap-tag">{s}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Content column */}
        <div className="ap-content-col">
          <h1 className="ap-title">{anime.title}</h1>
          {anime.titleJp && anime.titleJp !== anime.title && (
            <p className="ap-title-jp">{anime.titleJp}</p>
          )}

          {/* Badges */}
          <div className="ap-badges">
            {anime.airing && <span className="ap-badge airing">EN EMISIÓN</span>}
            {entry && (
              <span className={`badge badge-${entry.listStatus}`}>
                {entry.listStatus === 'watching' ? 'Viendo' :
                 entry.listStatus === 'completed' ? 'Completado' :
                 entry.listStatus === 'plan' ? 'Pendiente' :
                 entry.listStatus === 'paused' ? 'Pausado' : 'Abandonado'}
              </span>
            )}
          </div>

          {/* My entry summary */}
          {entry && (
            <div className="ap-my-entry">
              <div className="my-entry-grid">
                <div>
                  <small>Mi puntuación</small>
                  <strong className={scoreColor(entry.userScore)}>{entry.userScore || '—'}</strong>
                </div>
                <div>
                  <small>Progreso</small>
                  <strong>{entry.watchedEps || 0}/{anime.episodes || '?'} eps</strong>
                </div>
                {entry.notes && (
                  <div className="my-entry-notes">
                    <small>Notas</small>
                    <p>{entry.notes}</p>
                  </div>
                )}
              </div>
              {anime.episodes && (
                <div className="ap-progress-bar">
                  <div className="ap-progress-fill" style={{
                    width: `${Math.min(100, ((entry.watchedEps || 0) / anime.episodes) * 100)}%`
                  }} />
                </div>
              )}
            </div>
          )}

          {/* Synopsis */}
          {anime.synopsis && (
            <div className="ap-section">
              <h3>Sinopsis</h3>
              <p className="ap-synopsis">{anime.synopsis}</p>
            </div>
          )}

          {/* Genres & themes */}
          {(anime.genres?.length > 0 || anime.themes?.length > 0) && (
            <div className="ap-section">
              <h3>Géneros y temáticas</h3>
              <div className="ap-tags">
                {[...anime.genres, ...anime.themes].map((g) => (
                  <span key={g} className="ap-tag genre">{g}</span>
                ))}
              </div>
            </div>
          )}

          {/* Trailer */}
          {anime.trailer && (
            <div className="ap-section">
              <h3>Tráiler</h3>
              <a href={anime.trailer} target="_blank" rel="noopener noreferrer" className="ap-trailer-link">
                <Play size={16} /> Ver tráiler en YouTube <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* MAL link */}
          <div className="ap-section">
            <a
              href={`https://myanimelist.net/anime/${anime.malId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ap-mal-link"
            >
              <ExternalLink size={14} /> Ver en MyAnimeList
            </a>
          </div>
        </div>
      </div>

      {showModal && (
        <AddToListModal anime={anime} entry={entry} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
