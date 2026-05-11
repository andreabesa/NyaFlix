// ── Jikan v4 API (MyAnimeList) ──
const BASE = 'https://api.jikan.moe/v4'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJSON(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url)
      if (res.status === 429) {
        await delay(1500 * (i + 1))
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      if (i === retries) throw e
      await delay(800)
    }
  }
}

// Search anime
export async function searchAnime({ query, page = 1, genres, year, status, type, orderBy, sort }) {
  const params = new URLSearchParams({ q: query || '', page, limit: 20, sfw: true })
  if (genres) params.set('genres', genres)
  if (year) params.set('start_date', `${year}-01-01`)
  if (status) params.set('status', status)
  if (type) params.set('type', type)
  if (orderBy) params.set('order_by', orderBy)
  if (sort) params.set('sort', sort)
  const data = await fetchJSON(`${BASE}/anime?${params}`)
  return {
    results: data.data?.map(normalizeAnime) ?? [],
    pagination: data.pagination,
  }
}

// Get anime by ID
export async function getAnimeById(id) {
  const data = await fetchJSON(`${BASE}/anime/${id}/full`)
  return data.data ? normalizeAnime(data.data) : null
}

// Get seasonal anime
export async function getSeasonal(year, season) {
  const data = await fetchJSON(`${BASE}/seasons/${year}/${season}`)
  return data.data?.map(normalizeAnime) ?? []
}

// Get current season airing
export async function getCurrentSeason() {
  const data = await fetchJSON(`${BASE}/seasons/now?limit=25`)
  return data.data?.map(normalizeAnime) ?? []
}

// Get anime characters
export async function getAnimeCharacters(id) {
  const data = await fetchJSON(`${BASE}/anime/${id}/characters`)
  return data.data ?? []
}

// Get all genres
export async function getGenres() {
  const data = await fetchJSON(`${BASE}/genres/anime`)
  return data.data ?? []
}

// Normalize raw Jikan anime to our format
export function normalizeAnime(a) {
  // broadcast day from broadcast.day_of_week or broadcast.string
  let airingDay = a.broadcast?.day || null
  let airingTime = a.broadcast?.time || null

  return {
    malId: a.mal_id,
    title: a.title_english || a.title,
    titleJp: a.title,
    image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
    banner: null,
    episodes: a.episodes || null,
    type: a.type || 'TV',
    status: a.status || null,  // "Currently Airing", "Finished Airing", "Not yet aired"
    year: a.year || a.aired?.prop?.from?.year || null,
    season: a.season || null,
    score: a.score || null,
    scoredBy: a.scored_by || 0,
    rank: a.rank || null,
    popularity: a.popularity || null,
    genres: a.genres?.map((g) => g.name) ?? [],
    themes: a.themes?.map((t) => t.name) ?? [],
    demographics: a.demographics?.map((d) => d.name) ?? [],
    studios: a.studios?.map((s) => s.name) ?? [],
    source: a.source || null,
    duration: a.duration || null,
    rating: a.rating || null,
    synopsis: a.synopsis || null,
    trailer: a.trailer?.url || null,
    airingDay,
    airingTime,
    broadcast: a.broadcast?.string || null,
    airing: a.airing ?? false,
    aired: a.aired?.string || null,
  }
}

export const SEASONS = ['winter', 'spring', 'summer', 'fall']
export const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAY_ES = { Monday:'Lunes', Tuesday:'Martes', Wednesday:'Miércoles', Thursday:'Jueves', Friday:'Viernes', Saturday:'Sábado', Sunday:'Domingo' }
