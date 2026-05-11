import React, { useState, useEffect, useCallback } from 'react'
import { searchAnime, getGenres } from '../lib/api'
import AnimeCard from '../components/AnimeCard'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import './SearchPage.css'

const TYPES    = ['TV','Movie','OVA','ONA','Special','Music']
const STATUSES = [
  { value: 'airing',      label: 'En emisión' },
  { value: 'complete',    label: 'Finalizado' },
  { value: 'upcoming',    label: 'Próximamente' },
]
const ORDERS = [
  { value: 'score',      label: 'Puntuación' },
  { value: 'popularity', label: 'Popularidad' },
  { value: 'rank',       label: 'Ranking' },
  { value: 'title',      label: 'Título' },
  { value: 'start_date', label: 'Fecha' },
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i)

export default function SearchPage() {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)
  const [genres,   setGenres]   = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [selGenres, setSelGenres] = useState([])
  const [selYear,   setSelYear]   = useState('')
  const [selStatus, setSelStatus] = useState('')
  const [selType,   setSelType]   = useState('')
  const [orderBy,   setOrderBy]   = useState('score')

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {})
    doSearch(1, true)
  }, [])

  const doSearch = useCallback(async (p = 1, replace = false) => {
    setLoading(true)
    try {
      const genreIds = selGenres.join(',')
      const { results: data, pagination } = await searchAnime({
        query,
        page: p,
        genres: genreIds || undefined,
        year: selYear || undefined,
        status: selStatus || undefined,
        type: selType || undefined,
        orderBy,
        sort: 'desc',
      })
      setResults((prev) => replace ? data : [...prev, ...data])
      setHasMore(pagination?.has_next_page ?? false)
      setPage(p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, selGenres, selYear, selStatus, selType, orderBy])

  function handleSearch(e) {
    e?.preventDefault()
    doSearch(1, true)
  }

  function toggleGenre(id) {
    setSelGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  function clearFilters() {
    setSelGenres([]); setSelYear(''); setSelStatus(''); setSelType(''); setOrderBy('score')
  }

  const activeFilters = selGenres.length + (selYear?1:0) + (selStatus?1:0) + (selType?1:0)

  return (
    <div className="search-page">
      {/* Search bar */}
      <div className="search-hero">
        <h1>Buscar anime</h1>
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Título, género, estudio..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" className="clear-query" onClick={() => { setQuery(''); doSearch(1, true) }}>
                <X size={15} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-search">Buscar</button>
          <button
            type="button"
            className={`btn-filters ${showFilters ? 'active' : ''} ${activeFilters > 0 ? 'has-active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
          </button>
        </form>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            {/* Type */}
            <div className="filter-group">
              <label>Tipo</label>
              <div className="chip-list">
                {TYPES.map((t) => (
                  <button key={t} className={`chip ${selType===t?'active':''}`}
                    onClick={() => setSelType(selType===t?'':t)}>{t}</button>
                ))}
              </div>
            </div>
            {/* Status */}
            <div className="filter-group">
              <label>Estado</label>
              <div className="chip-list">
                {STATUSES.map((s) => (
                  <button key={s.value} className={`chip ${selStatus===s.value?'active':''}`}
                    onClick={() => setSelStatus(selStatus===s.value?'':s.value)}>{s.label}</button>
                ))}
              </div>
            </div>
            {/* Year */}
            <div className="filter-group">
              <label>Año</label>
              <select value={selYear} onChange={(e) => setSelYear(e.target.value)} className="filter-select">
                <option value="">Todos los años</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* Order */}
            <div className="filter-group">
              <label>Ordenar por</label>
              <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className="filter-select">
                {ORDERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Genres */}
          <div className="filter-group">
            <label>Géneros</label>
            <div className="chip-list wrap">
              {genres.slice(0, 30).map((g) => (
                <button key={g.mal_id}
                  className={`chip ${selGenres.includes(g.mal_id)?'active':''}`}
                  onClick={() => toggleGenre(g.mal_id)}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn-clear" onClick={clearFilters}>Limpiar filtros</button>
            <button className="btn-apply" onClick={() => { doSearch(1, true); setShowFilters(false) }}>
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="search-results-area">
        {results.length === 0 && !loading ? (
          <div className="empty-results">
            <span>🔍</span>
            <p>No se encontraron resultados. Prueba otros filtros.</p>
          </div>
        ) : (
          <>
            <div className="results-grid">
              {results.map((anime) => (
                <AnimeCard key={anime.malId} anime={anime} />
              ))}
              {loading && Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio:'2/3', borderRadius:'10px' }} />
              ))}
            </div>
            {hasMore && !loading && (
              <div className="load-more">
                <button onClick={() => doSearch(page + 1, false)}>
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
