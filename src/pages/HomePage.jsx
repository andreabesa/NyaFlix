import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getCurrentSeason } from '../lib/api'
import AnimeCard from '../components/AnimeCard'
import { TrendingUp, Star, BookMarked, Calendar, Play } from 'lucide-react'
import './HomePage.css'

export default function HomePage() {
  const { user, collection, getStats } = useStore()
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const stats = getStats()

  const watching = collection.filter((a) => a.listStatus === 'watching').slice(0, 6)

  useEffect(() => {
    getCurrentSeason()
      .then((data) => setTrending(data.slice(0, 12)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home-page">
      {/* Hero banner */}
      <div className="home-hero">
        <div className="hero-content">
          <p className="hero-greeting">Bienvenido de nuevo,</p>
          <h1 className="hero-name">{user.username}</h1>
          <div className="hero-stats">
            <div className="hstat"><span>{stats.total}</span><small>Anime</small></div>
            <div className="hstat"><span>{stats.episodes.toLocaleString()}</span><small>Episodios</small></div>
            <div className="hstat"><span>{stats.days}</span><small>Días</small></div>
            {stats.meanScore && <div className="hstat"><span>{stats.meanScore}</span><small>Media</small></div>}
          </div>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={() => navigate('/search')}>
              <TrendingUp size={16} /> Descubrir
            </button>
            <button className="hero-btn secondary" onClick={() => navigate('/collection')}>
              <BookMarked size={16} /> Mi colección
            </button>
          </div>
        </div>
        <div className="hero-decoration">
          {trending.slice(0,3).map((a) => a.image && (
            <img key={a.malId} src={a.image} alt={a.title} className="hero-float-img" />
          ))}
        </div>
      </div>

      <div className="home-body">
        {/* Continue watching */}
        {watching.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2><Play size={18} /> Continuar viendo</h2>
              <button onClick={() => navigate('/collection/watching')}>Ver todo</button>
            </div>
            <div className="continue-list">
              {watching.map((entry) => (
                <div key={entry.id} className="continue-card" onClick={() => navigate(`/anime/${entry.malId}`)}>
                  <div className="continue-img">
                    {entry.image && <img src={entry.image} alt={entry.title} />}
                  </div>
                  <div className="continue-info">
                    <p className="continue-title">{entry.title}</p>
                    <p className="continue-sub">{entry.watchedEps || 0}/{entry.episodes || '?'} eps</p>
                    <div className="continue-bar">
                      <div className="continue-fill" style={{ width: entry.episodes ? `${Math.min(100, (entry.watchedEps/entry.episodes)*100)}%` : '0%' }} />
                    </div>
                    {entry.airingDay && <p className="continue-airing">📅 {entry.airingDay}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending this season */}
        <section className="home-section">
          <div className="section-header">
            <h2><TrendingUp size={18} /> Temporada actual</h2>
            <button onClick={() => navigate('/search')}>Ver más</button>
          </div>
          {loading ? (
            <div className="card-grid">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio:'2/3', borderRadius:'10px' }} />
              ))}
            </div>
          ) : (
            <div className="card-grid">
              {trending.map((anime) => <AnimeCard key={anime.malId} anime={anime} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
