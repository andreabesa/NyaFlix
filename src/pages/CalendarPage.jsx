import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { DAY_ES, DAY_ORDER } from '../lib/api'
import { Calendar, Tv2, Clock } from 'lucide-react'
import './CalendarPage.css'

export default function CalendarPage() {
  const { collection } = useStore()
  const navigate = useNavigate()

  // Only "watching" + airing anime
  const airing = collection.filter(
    (a) => a.listStatus === 'watching' && a.airing
  )

  // Group by day
  const byDay = useMemo(() => {
    const map = {}
    DAY_ORDER.forEach((d) => { map[d] = [] })
    map['Unknown'] = []

    airing.forEach((a) => {
      const day = a.airingDay || 'Unknown'
      const key = DAY_ORDER.includes(day) ? day : 'Unknown'
      map[key].push(a)
    })
    return map
  }, [airing])

  // Today's day
  const todayIndex = new Date().getDay() // 0=Sun
  const todayEN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][todayIndex]

  // Non-airing but watching
  const nonAiring = collection.filter(
    (a) => a.listStatus === 'watching' && !a.airing
  )

  return (
    <div className="calendar-page">
      <div className="cal-header">
        <div className="cal-title">
          <Calendar size={22} />
          <div>
            <h1>Calendario de emisión</h1>
            <p>Animes en emisión de tu lista de "Viendo"</p>
          </div>
        </div>
        <div className="cal-summary">
          <span><strong>{airing.length}</strong> en emisión</span>
          <span><strong>{nonAiring.length}</strong> sin horario</span>
        </div>
      </div>

      {airing.length === 0 && nonAiring.length === 0 ? (
        <div className="cal-empty">
          <Calendar size={64} />
          <h3>Sin anime en emisión</h3>
          <p>Añade animes con estado "Viendo" que estén actualmente en emisión para verlos aquí.</p>
          <button onClick={() => navigate('/search')}>Buscar anime</button>
        </div>
      ) : (
        <div className="cal-body">
          {/* Week grid */}
          <div className="cal-grid">
            {DAY_ORDER.map((day) => {
              const items = byDay[day]
              const isToday = day === todayEN
              return (
                <div key={day} className={`cal-day ${isToday ? 'today' : ''}`}>
                  <div className="cal-day-header">
                    <span className="cal-day-name">{DAY_ES[day] || day}</span>
                    {isToday && <span className="today-badge">HOY</span>}
                    <span className="cal-day-count">{items.length}</span>
                  </div>
                  <div className="cal-day-items">
                    {items.length === 0 ? (
                      <div className="cal-day-empty">Sin episodios</div>
                    ) : items.map((a) => (
                      <div key={a.id} className="cal-item" onClick={() => navigate(`/anime/${a.malId}`)}>
                        <div className="cal-item-img">
                          {a.image
                            ? <img src={a.image} alt={a.title} loading="lazy" />
                            : <span>📺</span>}
                        </div>
                        <div className="cal-item-info">
                          <p className="cal-item-title">{a.title}</p>
                          {a.airingTime && (
                            <p className="cal-item-time">
                              <Clock size={10} /> {a.airingTime} JST
                            </p>
                          )}
                          <p className="cal-item-eps">
                            Ep {(a.watchedEps || 0) + 1}{a.episodes ? `/${a.episodes}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Non-airing watching */}
          {nonAiring.length > 0 && (
            <div className="cal-section">
              <h3><Tv2 size={16} /> Viendo (sin horario definido)</h3>
              <div className="cal-notime-list">
                {nonAiring.map((a) => (
                  <div key={a.id} className="cal-notime-item" onClick={() => navigate(`/anime/${a.malId}`)}>
                    {a.image && <img src={a.image} alt={a.title} />}
                    <div>
                      <p>{a.title}</p>
                      <span>{a.watchedEps || 0}{a.episodes ? `/${a.episodes}` : ''} eps · {a.status || 'Sin info'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
