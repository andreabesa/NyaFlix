import React, { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { BarChart2, Star, Clock, Tv2, TrendingUp, Heart } from 'lucide-react'
import './StatsPage.css'

export default function StatsPage() {
  const { collection } = useStore()

  const stats = useMemo(() => {
    if (!collection.length) return null
    const statusCounts = { watching:0, completed:0, plan:0, paused:0, dropped:0 }
    collection.forEach(a => { if (statusCounts[a.listStatus] !== undefined) statusCounts[a.listStatus]++ })
    const totalEps = collection.reduce((s,a) => s+(a.watchedEps||0), 0)
    const scored = collection.filter(a => a.userScore)
    const meanScore = scored.length ? +(scored.reduce((s,a)=>s+a.userScore,0)/scored.length).toFixed(2) : null

    // Score distribution
    const scoreDist = Array.from({length:10},(_,i)=>({score:i+1,count:0}))
    scored.forEach(a => { const idx=Math.round(a.userScore)-1; if(idx>=0&&idx<10) scoreDist[idx].count++ })

    // Genre distribution
    const genreMap = {}
    collection.forEach(a => a.genres?.forEach(g => { genreMap[g]=(genreMap[g]||0)+1 }))
    const topGenres = Object.entries(genreMap).sort((a,b)=>b[1]-a[1]).slice(0,10)

    // Year distribution
    const yearMap = {}
    collection.forEach(a => { if(a.year) yearMap[a.year]=(yearMap[a.year]||0)+1 })
    const yearDist = Object.entries(yearMap).sort((a,b)=>a[0]-b[0]).slice(-15)

    // Type dist
    const typeMap = {}
    collection.forEach(a => { if(a.type) typeMap[a.type]=(typeMap[a.type]||0)+1 })

    const favorites = collection.filter(a => a.favorite)
    const topScored = [...collection].filter(a=>a.userScore).sort((a,b)=>b.userScore-a.userScore).slice(0,5)

    return { statusCounts, totalEps, meanScore, scoreDist, topGenres, yearDist, typeMap, favorites, topScored, total: collection.length }
  }, [collection])

  if (!stats) return (
    <div className="stats-page"><div className="stats-empty"><BarChart2 size={64}/><h2>Sin datos aún</h2><p>Añade anime a tu colección para ver tus estadísticas.</p></div></div>
  )

  const statusColors = { watching:'var(--blue)', completed:'var(--green)', plan:'var(--text-muted)', paused:'var(--amber)', dropped:'var(--red)' }
  const statusLabels = { watching:'Viendo', completed:'Completado', plan:'Pendiente', paused:'Pausado', dropped:'Abandonado' }
  const maxGenre = stats.topGenres[0]?.[1] || 1
  const maxYear = Math.max(...stats.yearDist.map(([,v])=>v), 1)
  const maxScore = Math.max(...stats.scoreDist.map(d=>d.count), 1)

  return (
    <div className="stats-page">
      <div className="stats-hero">
        <BarChart2 size={24}/>
        <div>
          <h1>Estadísticas</h1>
          <p>Tu historial de anime en números</p>
        </div>
      </div>

      <div className="stats-body">
        {/* Big numbers */}
        <div className="stats-grid-4">
          <div className="stat-big-card purple"><span>{stats.total}</span><small>Anime total</small></div>
          <div className="stat-big-card green"><span>{stats.totalEps.toLocaleString()}</span><small>Episodios vistos</small></div>
          <div className="stat-big-card amber"><span>{(stats.totalEps*24/1440).toFixed(1)}</span><small>Días consumidos</small></div>
          <div className="stat-big-card pink"><span>{stats.meanScore||'—'}</span><small>Puntuación media</small></div>
        </div>

        <div className="stats-row-2">
          {/* Status donut */}
          <div className="stats-card">
            <h3>Estado de lista</h3>
            <div className="status-dist-bar">
              {Object.entries(stats.statusCounts).map(([k,v]) => v>0 && (
                <div key={k} className="status-dist-seg" style={{width:`${(v/stats.total)*100}%`, background: statusColors[k]}} title={`${statusLabels[k]}: ${v}`}/>
              ))}
            </div>
            <div className="status-dist-legend">
              {Object.entries(stats.statusCounts).map(([k,v]) => v>0 && (
                <div key={k} className="sdl-item">
                  <div className="sdl-dot" style={{background:statusColors[k]}}/>
                  <span>{statusLabels[k]}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Type distribution */}
          <div className="stats-card">
            <h3>Tipo de anime</h3>
            <div className="type-list">
              {Object.entries(stats.typeMap).sort((a,b)=>b[1]-a[1]).map(([type,count]) => (
                <div key={type} className="type-row">
                  <span className="type-name">{type}</span>
                  <div className="type-bar-wrap">
                    <div className="type-bar-fill" style={{width:`${(count/stats.total)*100}%`}}/>
                  </div>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score distribution */}
        <div className="stats-card">
          <h3><Star size={14}/> Distribución de puntuaciones</h3>
          <div className="score-dist">
            {stats.scoreDist.map(({score,count}) => (
              <div key={score} className="score-bar-col">
                <div className="score-bar-fill" style={{height:`${maxScore>0?(count/maxScore)*100:0}%`}}/>
                <span className="score-label">{score}</span>
                {count > 0 && <span className="score-count">{count}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Genre chart */}
        <div className="stats-card">
          <h3>Top géneros</h3>
          <div className="genre-chart">
            {stats.topGenres.map(([genre,count]) => (
              <div key={genre} className="genre-row">
                <span className="genre-name">{genre}</span>
                <div className="genre-bar-wrap">
                  <div className="genre-bar-fill" style={{width:`${(count/maxGenre)*100}%`}}/>
                </div>
                <span className="genre-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Year chart */}
        {stats.yearDist.length > 0 && (
          <div className="stats-card">
            <h3><TrendingUp size={14}/> Anime por año</h3>
            <div className="year-chart">
              {stats.yearDist.map(([year,count]) => (
                <div key={year} className="year-col">
                  <div className="year-bar" style={{height:`${(count/maxYear)*100}%`}}/>
                  <span className="year-label">{year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats-row-2">
          {/* Top rated */}
          {stats.topScored.length > 0 && (
            <div className="stats-card">
              <h3><Star size={14}/> Mejor valorados</h3>
              <div className="top-list">
                {stats.topScored.map((a,i) => (
                  <div key={a.id} className="top-item">
                    <span className="top-rank">#{i+1}</span>
                    {a.image && <img src={a.image} alt={a.title}/>}
                    <div className="top-info">
                      <p>{a.title}</p>
                      <span>{a.year}</span>
                    </div>
                    <span className="top-score score-great">{a.userScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {stats.favorites.length > 0 && (
            <div className="stats-card">
              <h3><Heart size={14}/> Favoritos</h3>
              <div className="fav-grid-small">
                {stats.favorites.map(a => (
                  <div key={a.id} className="fav-small">
                    {a.image && <img src={a.image} alt={a.title}/>}
                    <p>{a.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
