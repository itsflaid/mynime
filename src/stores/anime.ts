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
    addAnime, updateAnime, deleteAnime,
    addRewatch, deleteRewatch,
  }
})