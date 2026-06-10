<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="flex max-h-[92vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-pink-500">Personal Archive</p>
          <h2 class="mt-1 text-xl font-bold text-zinc-900">Tambah Anime</h2>
        </div>
        <button
          type="button"
          aria-label="Tutup modal"
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200"
          @click="emit('close')"
        >
          <X :size="16" :stroke-width="1.8" />
        </button>
      </div>

      <div class="grid grid-cols-2 rounded-xl bg-zinc-100 p-1">
        <button
          v-for="option in sourceOptions"
          :key="option.value"
          type="button"
          class="rounded-lg px-3 py-2 text-xs font-bold transition-all"
          :class="source === option.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-700'"
          @click="setSource(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="source === 'jikan'" class="relative">
        <label for="anime-search" class="field-label">Cari Anime</label>
        <div class="relative">
          <input
            id="anime-search"
            v-model.trim="query"
            type="search"
            autocomplete="off"
            placeholder="Ketik judul anime..."
            class="field-input pr-10"
            @input="onSearch"
          />
          <div
            v-if="searching"
            class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"
          />
        </div>

        <div
          v-if="showDrop"
          class="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          <button
            v-for="anime in results"
            :key="anime.mal_id"
            type="button"
            class="flex w-full gap-3 border-b border-zinc-100 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-pink-50"
            @click="pick(anime)"
          >
            <img
              :src="anime.images.jpg.small_image_url"
              :alt="anime.title"
              class="h-12 w-8 flex-shrink-0 rounded-md bg-zinc-100 object-cover"
            />
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold text-zinc-900">{{ anime.title }}</span>
              <span class="block text-xs text-zinc-400">
                {{ anime.type || 'Unknown type' }} · {{ anime.episodes ? `${anime.episodes} ep` : '? ep' }}
              </span>
            </span>
          </button>

          <p v-if="!results.length && !searching" class="px-4 py-5 text-center text-sm text-zinc-400">
            Tidak ditemukan di Jikan. Coba tab Tambah Manual.
          </p>
        </div>
      </div>

      <div v-else class="grid gap-4">
        <div>
          <label for="manual-title" class="field-label">Nama Anime</label>
          <input
            id="manual-title"
            v-model.trim="manual.title"
            type="text"
            placeholder="Contoh: Link Click"
            class="field-input"
          />
        </div>
        <div>
          <label for="manual-poster" class="field-label">URL Poster</label>
          <input
            id="manual-poster"
            v-model.trim="manual.poster"
            type="url"
            inputmode="url"
            placeholder="https://..."
            class="field-input"
          />
          <p class="mt-1.5 text-xs leading-relaxed text-zinc-400">
            Gunakan link gambar publik agar poster tetap tampil setelah aplikasi di-deploy.
          </p>
        </div>
      </div>

      <div
        v-if="selectedAnime"
        class="flex items-center gap-3 rounded-xl border border-pink-200 bg-pink-50 p-3"
      >
        <div class="h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          <img
            v-if="!posterError"
            :src="selectedAnime.poster"
            :alt="selectedAnime.title"
            class="h-full w-full object-cover"
            @error="posterError = true"
          />
          <div v-else class="flex h-full items-center justify-center px-1 text-center text-[9px] font-bold text-zinc-400">
            Poster gagal dimuat
          </div>
        </div>
        <div class="min-w-0">
          <div class="mb-1 text-[10px] font-bold uppercase tracking-widest text-pink-600">
            {{ source === 'manual' ? 'Preview Manual' : 'Terpilih' }}
          </div>
          <div class="truncate text-sm font-bold text-zinc-900">{{ selectedAnime.title }}</div>
        </div>
      </div>

      <div>
        <span class="field-label">Status</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(config, key) in STATUS_CONFIG"
            :key="key"
            type="button"
            class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-all hover:border-zinc-300"
            :style="form.status === key ? activeStatusStyle(config) : undefined"
            @click="form.status = key"
          >
            {{ config.label }}
          </button>
        </div>
      </div>

      <template v-if="form.status === 'completed'">
        <div class="flex gap-3">
          <div class="flex-1">
            <label for="completed-date" class="field-label">Tanggal</label>
            <input id="completed-date" v-model="form.date" type="date" class="field-input" />
          </div>
          <div class="w-28">
            <label for="completed-time" class="field-label">Jam</label>
            <input id="completed-time" v-model="form.time" type="time" class="field-input" />
          </div>
        </div>
        <div>
          <label for="anime-rate" class="field-label">Rate (1-10)</label>
          <input
            id="anime-rate"
            v-model="form.rate"
            type="number"
            min="1"
            max="10"
            step="0.5"
            placeholder="Contoh: 8.5"
            class="field-input"
          />
        </div>
      </template>

      <div>
        <label for="anime-notes" class="field-label">Catatan</label>
        <textarea
          id="anime-notes"
          v-model.trim="form.notes"
          rows="3"
          placeholder="Kesan, komentar, spoiler bebas..."
          class="field-input resize-none leading-relaxed"
        />
      </div>

      <p
        v-if="errorMessage"
        role="alert"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>

      <button
        type="button"
        :disabled="!canSave || saving"
        class="w-full rounded-xl py-3 text-sm font-bold transition-all"
        :class="canSave
          ? 'bg-pink-500 text-white shadow-sm shadow-pink-200 hover:bg-pink-600'
          : 'cursor-not-allowed bg-zinc-100 text-zinc-400'"
        @click="save"
      >
        {{ saving ? 'Menyimpan...' : 'Simpan ke MyNime' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { useAnimeStore } from '../stores/anime'
import type { AnimeStatus } from '../types'

type AnimeSource = 'jikan' | 'manual'

interface JikanAnime {
  mal_id: number
  title: string
  type: string | null
  episodes: number | null
  images: {
    jpg: {
      image_url: string
      small_image_url: string
    }
  }
}

interface SelectedAnime {
  title: string
  poster: string
}

interface StatusConfig {
  label: string
  bg: string
  text: string
  color: string
}

const emit = defineEmits<{ close: []; added: [id: string] }>()

const STATUS_CONFIG: Record<AnimeStatus, StatusConfig> = {
  completed: { label: 'Completed', bg: '#fce4f0', text: '#c41574', color: '#e91e8c' },
  watching: { label: 'Watching', bg: '#ede9fe', text: '#6d28d9', color: '#7c3aed' },
  watchlist: { label: 'Watchlist', bg: '#e0f2fe', text: '#0369a1', color: '#0891b2' },
  onhold: { label: 'On Hold', bg: '#fef3c7', text: '#b45309', color: '#d97706' },
  dropped: { label: 'Dropped', bg: '#fee2e2', text: '#b91c1c', color: '#dc2626' },
}

const sourceOptions: { label: string; value: AnimeSource }[] = [
  { label: 'Cari di Jikan', value: 'jikan' },
  { label: 'Tambah Manual', value: 'manual' },
]

const store = useAnimeStore()
const source = ref<AnimeSource>('jikan')
const query = ref('')
const results = ref<JikanAnime[]>([])
const selected = ref<SelectedAnime | null>(null)
const showDrop = ref(false)
const searching = ref(false)
const saving = ref(false)
const posterError = ref(false)
const errorMessage = ref('')
const manual = reactive({ title: '', poster: '' })
const form = reactive({
  status: 'watchlist' as AnimeStatus,
  date: '',
  time: '',
  rate: '',
  notes: '',
})

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let searchController: AbortController | undefined

const selectedAnime = computed<SelectedAnime | null>(() => {
  if (source.value === 'manual') {
    if (!manual.title || !manual.poster) return null
    return { title: manual.title, poster: manual.poster }
  }

  return selected.value
})

const canSave = computed(() => {
  const anime = selectedAnime.value
  if (!anime || !isValidHttpUrl(anime.poster)) return false
  return !form.rate || isValidRate(Number(form.rate))
})

watch(
  () => selectedAnime.value?.poster,
  () => {
    posterError.value = false
    errorMessage.value = ''
  },
)

onBeforeUnmount(cancelPendingSearch)

function setSource(nextSource: AnimeSource) {
  source.value = nextSource
  errorMessage.value = ''
  showDrop.value = false
  cancelPendingSearch()
}

function onSearch() {
  selected.value = null
  errorMessage.value = ''
  cancelPendingSearch()

  if (query.value.length < 2) {
    results.value = []
    showDrop.value = false
    return
  }

  debounceTimer = setTimeout(searchJikan, 500)
}

async function searchJikan() {
  searching.value = true
  searchController = new AbortController()

  try {
    const url = new URL('https://api.jikan.moe/v4/anime')
    url.searchParams.set('q', query.value)
    url.searchParams.set('limit', '6')
    url.searchParams.set('sfw', 'true')

    const response = await fetch(url, { signal: searchController.signal })
    if (!response.ok) throw new Error(`Jikan request failed with ${response.status}`)

    const payload = await response.json() as { data?: JikanAnime[] }
    results.value = payload.data ?? []
    showDrop.value = true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    results.value = []
    showDrop.value = true
    errorMessage.value = 'Pencarian Jikan sedang bermasalah. Kamu tetap bisa memakai Tambah Manual.'
  } finally {
    searching.value = false
  }
}

function pick(anime: JikanAnime) {
  selected.value = {
    title: anime.title,
    poster: anime.images.jpg.image_url,
  }
  query.value = anime.title
  showDrop.value = false
}

async function save() {
  const anime = selectedAnime.value
  if (!anime || saving.value) return

  errorMessage.value = validateForm(anime)
  if (errorMessage.value) return

  saving.value = true
  const { data, error } = await store.addAnime({
    title: anime.title,
    poster: anime.poster,
    status: form.status,
    rate: form.rate ? Number(form.rate) : null,
    notes: form.notes || null,
    completed_at: buildCompletedAt(),
  })
  saving.value = false

  if (error || !data) {
    errorMessage.value = error?.message || 'Anime gagal disimpan. Coba lagi beberapa saat.'
    return
  }

  emit('added', data.id)
}

function validateForm(anime: SelectedAnime) {
  if (!anime.title.trim()) return 'Nama anime wajib diisi.'
  if (!isValidHttpUrl(anime.poster)) return 'URL poster harus berupa link http atau https yang valid.'
  if (form.rate && !isValidRate(Number(form.rate))) return 'Rate harus berada di antara 1 sampai 10.'
  return ''
}

function buildCompletedAt() {
  if (form.status !== 'completed' || !form.date) return null
  return new Date(`${form.date}T${form.time || '00:00'}`).toISOString()
}

function isValidRate(rate: number) {
  return Number.isFinite(rate) && rate >= 1 && rate <= 10
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function activeStatusStyle(config: StatusConfig) {
  return {
    background: config.bg,
    color: config.text,
    borderColor: `${config.color}88`,
  }
}

function cancelPendingSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  searchController?.abort()
  debounceTimer = undefined
  searchController = undefined
}
</script>

<style scoped>
.field-label {
  @apply mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-400;
}

.field-input {
  @apply w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-400;
}
</style>
