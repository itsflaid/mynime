<template>
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-7 flex flex-col gap-5 shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h2 class="font-bold text-xl text-zinc-900 font-jakarta">Tambah Anime</h2>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors text-sm">✕</button>
      </div>

      <!-- Search -->
      <div class="relative">
        <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Cari Anime</label>
        <div class="relative">
          <input
            v-model="query"
            @input="onSearch"
            placeholder="Ketik judul anime..."
            class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-pink-400 transition-colors font-jakarta"
          />
          <div v-if="searching" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <!-- Dropdown -->
        <div v-if="showDrop && results.length" class="absolute top-full left-0 right-0 bg-white border border-zinc-200 rounded-xl mt-1 z-50 overflow-hidden shadow-lg">
          <div
            v-for="a in results" :key="a.mal_id"
            @click="pick(a)"
            class="flex gap-3 px-3 py-2.5 cursor-pointer hover:bg-pink-50 border-b border-zinc-50 last:border-0 transition-colors"
          >
            <img :src="a.images?.jpg?.small_image_url" class="w-8 h-12 object-cover rounded-md flex-shrink-0" />
            <div>
              <div class="text-sm font-medium text-zinc-900 font-jakarta">{{ a.title }}</div>
              <div class="text-xs text-zinc-400">{{ a.type }} · {{ a.episodes ? a.episodes + ' ep' : '?' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected preview -->
      <div v-if="selected" class="flex gap-3 bg-pink-50 border border-pink-200 rounded-xl p-3 items-center">
        <img :src="selected.poster" class="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-pink-600 uppercase tracking-widest mb-1">✓ Terpilih</div>
          <div class="text-sm font-bold text-zinc-900 font-jakarta">{{ selected.title }}</div>
        </div>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Status</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(val, key) in STATUS_CONFIG" :key="key"
            @click="form.status = key as AnimeStatus"
            :style="form.status === key ? { background: val.bg, color: val.text, borderColor: val.color + '88' } : {}"
            class="px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 text-zinc-400 hover:border-zinc-300 transition-all font-jakarta"
          >
            {{ val.label }}
          </button>
        </div>
      </div>

      <!-- Completed fields -->
      <template v-if="form.status === 'completed'">
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Tanggal</label>
            <input type="date" v-model="form.date" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-pink-400 transition-colors" />
          </div>
          <div class="w-28">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Jam</label>
            <input type="time" v-model="form.time" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-pink-400 transition-colors" />
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Rate (1–10)</label>
          <input type="number" min="1" max="10" step="0.5" v-model="form.rate" placeholder="cth: 8.5"
            class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-pink-400 transition-colors" />
        </div>
      </template>

      <!-- Notes -->
      <div>
        <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Catatan</label>
        <textarea v-model="form.notes" placeholder="Kesan, komentar, spoiler bebas..." rows="3"
          class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-pink-400 transition-colors resize-none leading-relaxed font-jakarta" />
      </div>

      <!-- Save -->
      <button
        @click="save"
        :disabled="!selected || saving"
        class="w-full py-3 rounded-xl text-sm font-bold font-jakarta transition-all"
        :class="selected ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-sm shadow-pink-200' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'"
      >
        {{ saving ? 'Menyimpan...' : 'Simpan ke MyNime' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAnimeStore } from '../stores/anime'
import type { AnimeStatus } from '../types'

const emit = defineEmits<{ close: []; added: [id: string] }>()

const STATUS_CONFIG: Record<AnimeStatus, { label: string; bg: string; text: string; color: string }> = {
  completed: { label: 'Completed', bg: '#fce4f0', text: '#c41574', color: '#e91e8c' },
  watching:  { label: 'Watching',  bg: '#ede9fe', text: '#6d28d9', color: '#7c3aed' },
  watchlist: { label: 'Watchlist', bg: '#e0f2fe', text: '#0369a1', color: '#0891b2' },
  onhold:    { label: 'On Hold',   bg: '#fef3c7', text: '#b45309', color: '#d97706' },
  dropped:   { label: 'Dropped',   bg: '#fee2e2', text: '#b91c1c', color: '#dc2626' },
}

const store = useAnimeStore()
const query = ref('')
const results = ref<any[]>([])
const showDrop = ref(false)
const searching = ref(false)
const saving = ref(false)
const selected = ref<{ title: string; poster: string } | null>(null)
let debTimer: ReturnType<typeof setTimeout>

const form = reactive({
  status: 'watchlist' as AnimeStatus,
  date: '',
  time: '',
  rate: '',
  notes: '',
})

function onSearch() {
  selected.value = null
  if (query.value.length < 2) { results.value = []; showDrop.value = false; return }
  clearTimeout(debTimer)
  debTimer = setTimeout(async () => {
    searching.value = true
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query.value)}&limit=6&sfw=true`)
      const d = await res.json()
      results.value = d.data || []
      showDrop.value = true
    } catch { results.value = [] }
    searching.value = false
  }, 500)
}

function pick(a: any) {
  selected.value = { title: a.title, poster: a.images?.jpg?.image_url || '' }
  query.value = a.title
  showDrop.value = false
}

async function save() {
  if (!selected.value || saving.value) return
  saving.value = true
  const payload = {
    title: selected.value.title,
    poster: selected.value.poster,
    status: form.status,
    rate: form.rate ? parseFloat(form.rate) : null,
    notes: form.notes || null,
    completed_at: form.status === 'completed' && form.date
      ? new Date(`${form.date}T${form.time || '00:00'}`).toISOString()
      : null,
  }
  const { data, error } = await store.addAnime(payload)
  saving.value = false
  if (!error && data) emit('added', data.id)
}
</script>