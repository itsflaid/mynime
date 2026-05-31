export type AnimeStatus = 'watching' | 'completed' | 'watchlist' | 'onhold' | 'dropped'

export interface Rewatch {
  id: string
  anime_id: string
  rate: number | null
  rewatched_at: string | null
  notes: string | null
  created_at: string
}

export interface Anime {
  id: string
  title: string
  poster: string
  status: AnimeStatus
  rate: number | null
  completed_at: string | null
  notes: string | null
  top10rank?: number | null
  created_at: string
  rewatches?: Rewatch[]
}