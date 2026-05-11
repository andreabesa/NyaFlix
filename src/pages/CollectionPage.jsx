import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Search, Grid, List, Star, ChevronDown, X } from 'lucide-react'
import AddToListModal from '../components/AddToListModal'
import './CollectionPage.css'

const LISTS = [
  { key: 'all',       label: 'Todo',        emoji: '📚' },
  { key: 'watching',  label: 'Viendo',      emoji: '▶️' },
  { key: 'completed', label: 'Completado',  emoji: '✅' },
  { key: 'plan',      label: 'Pendiente',   emoji: '🔖' },
  { key: 'paused',    label: 'Pausado',     emoji: '⏸️' },
  { key: 'dropped',   label: 'Abandonado',  emoji: '❌' },
]

const SORT_OPTIONS = [
  { value: 'addedAt', label: 'Fecha añadido' },
  { value: 'title',   label: 'Título A-Z' },
  { value: 'score',   label: 'Puntuación' },
  { value: 'rating',  label: 'Nota MAL' },
  { value: 'eps',     label: 'Episodios vistos' },
  { value: 'year',    label: 'Año' },
]

export default function CollectionPage() {
  const { status: urlStatus } = useParams()
  const navigate = useNavigate()
  const { collection, getStats } = useStore()

  const [activeList, setActiveList] = useState(urlStatus || 'all')
  const [viewMode,   setViewMode]   = useState('grid')
  const [query,      setQuery]      = useState('')
  const [sortBy,     setSortBy]     = useState('addedAt')
  const [editEntry,  setEditEntry]  = useState(null)

  // Filter state
  const [filterGenre, setFilterGenre] = useState('')
  const [filterYear,  setFilterYear]  = useState('')
  const [filterType,  setFilterType]  = useState('')

  const stats = getStats()

  // Compute all available genres/years from collection
  const allGenres = useMemo(() => {
    const s = new Set()
    collection.forEach((a) => a.genres?.forEach((g) => s.add(g)))
    return [...s].sort()
  }, [collection])

  const allYears = useMemo(() => {
    const s = new Set()
    collection.forEach((a) => { if (a.year) s.add(a.year) })
    return [...s].sort((a, b) => b - a)
  }, [collection])

  const allTypes = useMemo(() => {
    const s = new Set()
    collection.forEach((a) => { if (a.type) s.add(a.type) })
    return [...s].sort()
  }, [collection])

  const filtered = useMemo(() => {
    let list = activeList === 'all'
      ? [...collection]
      : collection.filter((a) => a.listStatus === activeList)

    if (query) list = list.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    if (filterGenre) list = list.filter((a) => a.genres?.includes(filterGenre))
    if (filterYear)  list = list.filter((a) => String(a.year) === filterYear)
    if (filterType)  list = list.filter((a) => a.type === filterType)

    list.sort((a, b) => {
      switch (sortBy) {
        case 'title':   return a.title.localeCompare(b.title, 'es')
        case 'score':   return (b.userScore || 0) - (a.userScore || 0)
        case 'rating':  return (b.score || 0) - (a.score || 0)
        case 'eps':     return (b.watchedEps || 0) - (a.watchedEps || 0)
        case 'year':    return (b.year || 0) - (a.year || 0)
        default:        return b.addedAt - a.addedAt
      }
    })
    return list
  }, [collection, activeList, query, filterGenre, filterYear, filterType, sortBy])

  function selectList(key) {
    setActiveList(key)
    navigate(key === 'all' ? '/collection' : `/collection/${key}`, { replace: true })
  }

  function scoreColor(s) {
    if (!s) return ''
    if (s >= 8) return 'score-great'
    if (s >= 7) return 'score-good'
    if (s >= 5) return 'score-ok'
    return 'score-bad'
  }

  const hasFilters = filterGenre || filterYear || filterType

  return (
    <div className="collection-page">
      {/* Sidebar */}
      <aside className="col-sidebar">
        <div className="col-user-stats">
          <p className="stat-title">Mi colección</p>
          <div className="mini-stats">
            <div><span>{stats.total}</span><small>Total</small></div>
            <div><span>{stats.episodes}</span><small>Eps</small></div>
            <div><span>{stats.days}</span><small>Días</small></div>
            {stats.meanScore && <div><span>{stats.meanScore}</span><small>Media</small></div>}
          </div>
        </div>

        {LISTS.map(({ key, label, emoji }) => (
          <button
            key={key}
            className={`col-list-item ${activeList === key ? 'active' : ''}`}
            onClick={() => selectList(key)}
          >
            <span>{emoji}</span>
            <span className="list-label">{label}</span>
            <span className="list-count">{key === 'all' ? stats.total : stats[key] || 0}</span>
          </button>
        ))}
      </aside>

      {/* Main area */}
      <div className="col-main">
        {/* Toolbar */}
        <div className="col-toolbar">
          <div className="col-search-wrap">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar en colección..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button className="clear-q" onClick={() => setQuery('')}><X size={13} /></button>}
          </div>

          {/* Filters */}
          <select className="toolbar-select" value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
            <option value="">Género</option>
            {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="toolbar-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">Año</option>
            {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="toolbar-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tipo</option>
            {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {hasFilters && (
            <button className="clear-filters-btn" onClick={() => { setFilterGenre(''); setFilterYear(''); setFilterType('') }}>
              <X size={13} /> Limpiar
            </button>
          )}

          <div className="toolbar-right">
            <select className="toolbar-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="view-btns">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Grid size={16} /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="results-count">{filtered.length} {filtered.length === 1 ? 'anime' : 'animes'}</p>

        {filtered.length === 0 ? (
          <div className="col-empty">
            <span>📭</span>
            <p>No hay anime en esta lista.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="col-grid">
            {filtered.map((entry) => (
              <div key={entry.id} className="col-card" onClick={() => setEditEntry(entry)}>
                <div className="col-card-img">
                  {entry.image
                    ? <img src={entry.image} alt={entry.title} loading="lazy" />
                    : <div className="col-card-ph">📺</div>}
                  {entry.userScore && (
                    <div className={`col-card-score ${scoreColor(entry.userScore)}`}>
                      <Star size={9} fill="currentColor" /> {entry.userScore}
                    </div>
                  )}
                  <div className={`col-card-status badge badge-${entry.listStatus}`}>
                    {entry.listStatus === 'watching' ? 'Viendo' :
                     entry.listStatus === 'completed' ? 'Completado' :
                     entry.listStatus === 'plan' ? 'Pendiente' :
                     entry.listStatus === 'paused' ? 'Pausado' : 'Abandonado'}
                  </div>
                </div>
                <p className="col-card-title">{entry.title}</p>
                <p className="col-card-sub">{entry.watchedEps || 0}{entry.episodes ? `/${entry.episodes}` : ''} eps</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="col-list-view">
            <div className="list-header-row">
              <span style={{flex:3}}>Anime</span>
              <span>Puntuación</span>
              <span>Progreso</span>
              <span>Tipo</span>
              <span>Año</span>
            </div>
            {filtered.map((entry) => (
              <div key={entry.id} className="col-list-row" onClick={() => setEditEntry(entry)}>
                <div className="list-row-info">
                  {entry.image && <img src={entry.image} alt={entry.title} />}
                  <div>
                    <p className="list-row-title">{entry.title}</p>
                    <div className={`badge badge-${entry.listStatus}`} style={{fontSize:'10px',marginTop:'4px'}}>
                      {entry.listStatus === 'watching' ? 'Viendo' :
                       entry.listStatus === 'completed' ? 'Completado' :
                       entry.listStatus === 'plan' ? 'Pendiente' :
                       entry.listStatus === 'paused' ? 'Pausado' : 'Abandonado'}
                    </div>
                    {entry.notes && <p className="list-row-notes">{entry.notes}</p>}
                  </div>
                </div>
                <span className={`list-row-score ${scoreColor(entry.userScore)}`}>
                  {entry.userScore ? <><Star size={12} fill="currentColor" /> {entry.userScore}</> : '—'}
                </span>
                <span className="list-row-eps">
                  {entry.watchedEps || 0}{entry.episodes ? `/${entry.episodes}` : ''} eps
                </span>
                <span className="list-row-type">{entry.type || '—'}</span>
                <span className="list-row-year">{entry.year || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editEntry && (
        <AddToListModal
          anime={editEntry}
          entry={editEntry}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  )
}
