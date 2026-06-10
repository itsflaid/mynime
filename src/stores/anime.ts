import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { Anime, Rewatch } from '../types'

export const useAnimeStore = defineStore('anime', () => {
  const animeList = ref<Anime[]>([])
  const loading = ref(false)

  // ── FETCH ALL ──────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('completed_at', { ascending: false, nullsFirst: false })
    if (!error && data) animeList.value = data
    loading.value = false
  }

  // ── FETCH SINGLE + REWATCHES ───────────────────────────
  async function fetchOne(id: string): Promise<Anime | null> {
    const { data, error } = await supabase
      .from('anime')
      .select('*, rewatches(*)')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  }

  // ── ADD ANIME ──────────────────────────────────────────
  async function addAnime(payload: Omit<Anime, 'id' | 'created_at' | 'rewatches'>) {
    const { data, error } = await supabase
      .from('anime')
      .insert(payload)
      .select()
      .single()
    if (!error && data) animeList.value.unshift(data)
    return { data, error }
  }

  // ── UPDATE ANIME ───────────────────────────────────────
  async function updateAnime(id: string, payload: Partial<Anime>) {
    const { data, error } = await supabase
      .from('anime')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      const idx = animeList.value.findIndex(a => a.id === id)
      if (idx !== -1) animeList.value[idx] = { ...animeList.value[idx], ...data }
    }
    return { data, error }
  }

  // ── DELETE ANIME ───────────────────────────────────────
  async function deleteAnime(id: string) {
    const { error } = await supabase.from('anime').delete().eq('id', id)
    if (!error) animeList.value = animeList.value.filter(a => a.id !== id)
    return { error }
  }

  async function updateTop10Rank(animeId: string, newRank: number | null) {
    if (newRank !== null && (!Number.isInteger(newRank) || newRank < 1 || newRank > 10)) {
      return { error: new Error('Top 10 rank harus berupa angka 1 sampai 10.') }
    }

    const { data: rankedAnime, error: fetchError } = await supabase
      .from('anime')
      .select('id, top10rank')
      .not('top10rank', 'is', null)
      .order('top10rank', { ascending: true })

    if (fetchError) return { error: fetchError }

    const updates: { id: string; top10rank: number | null }[] = []

    if (newRank !== null) {
      for (const item of rankedAnime ?? []) {
        if (item.id === animeId || item.top10rank === null || item.top10rank < newRank) continue
        updates.push({
          id: item.id,
          top10rank: item.top10rank >= 10 ? null : item.top10rank + 1,
        })
      }
    }

    updates.push({ id: animeId, top10rank: newRank })

    const results = await Promise.all(
      updates.map(update =>
        supabase
          .from('anime')
          .update({ top10rank: update.top10rank })
          .eq('id', update.id),
      ),
    )
    const updateError = results.find(result => result.error)?.error

    if (updateError) return { error: updateError }

    await fetchAll()
    return { error: null }
  }

  // ── ADD REWATCH ────────────────────────────────────────
  async function addRewatch(payload: Omit<Rewatch, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('rewatches')
      .insert(payload)
      .select()
      .single()
    return { data, error }
  }

  // ── DELETE REWATCH ─────────────────────────────────────
  async function deleteRewatch(id: string) {
    const { error } = await supabase.from('rewatches').delete().eq('id', id)
    return { error }
  }

  return {
    animeList, loading,
    fetchAll, fetchOne,
    addAnime, updateAnime, deleteAnime, updateTop10Rank,
    addRewatch, deleteRewatch,
  }
})
