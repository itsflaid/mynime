<template>
  <main class="mx-auto max-w-6xl px-5 py-8 md:px-8">
    <button
      @click="router.back()"
      class="mb-6 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900 font-jakarta"
    >
      ← Back
    </button>

    <section v-if="loading" class="grid gap-6 md:grid-cols-[280px_1fr]">
      <div class="aspect-[2/3] animate-pulse rounded-3xl bg-zinc-100" />
      <div class="h-96 animate-pulse rounded-3xl bg-zinc-100" />
    </section>

    <section v-else-if="!anime" class="rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center">
      <div class="text-4xl">🫥</div>
      <h1 class="mt-3 text-2xl font-extrabold text-zinc-900 font-jakarta">Anime tidak ditemukan</h1>
      <p class="mt-2 text-sm text-zinc-400">Entah datanya hilang, id-nya salah, atau Supabase lagi ngambek kayak WiFi kos.</p>
      <RouterLink to="/list" class="mt-5 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white">Balik ke List</RouterLink>
    </section>

    <template v-else>
      <section class="grid gap-7 md:grid-cols-[300px_1fr]">
        <div class="relative overflow-hidden rounded-[2rem] bg-zinc-100 shadow-xl shadow-pink-100/60">
          <img :src="anime.poster" :alt="anime.title" class="aspect-[2/3] h-full w-full object-cover" />
          <div v-if="anime.top10rank" class="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-sm font-extrabold text-white shadow-lg shadow-pink-500/30">
            #{{ anime.top10rank }}
          </div>
        </div>

        <div class="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <div class="flex flex-wrap items-center gap-3">
            <StatusBadge :status="anime.status" />
            <span v-if="anime.rate" class="rounded-full bg-zinc-900 px-3 py-1 text-xs font-extrabold text-white">
              <span class="text-pink-400">★</span> {{ anime.rate }}/10
            </span>
          </div>

          <h1 class="mt-5 text-3xl font-extrabold leading-tight text-zinc-900 font-jakarta md:text-5xl">
            {{ anime.title }}
          </h1>

          <div class="mt-6 grid gap-3 text-sm text-zinc-500 sm:grid-cols-2">
            <div class="rounded-2xl bg-zinc-50 p-4">
              <div class="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-jakarta">Completed At</div>
              <div class="mt-1 font-bold text-zinc-800">{{ formatDateTime(anime.completed_at) }}</div>
            </div>
            <div class="rounded-2xl bg-zinc-50 p-4">
              <div class="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-jakarta">Created At</div>
              <div class="mt-1 font-bold text-zinc-800">{{ formatDateTime(anime.created_at) }}</div>
            </div>
          </div>

          <div class="mt-6 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 p-5">
            <div class="text-[10px] font-extrabold uppercase tracking-widest text-pink-500 font-jakarta">Notes</div>
            <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
              {{ anime.notes || 'Belum ada catatan. Nanti UI udah cakep tapi datanya kosong, itu namanya dekorasi database, hadeh.' }}
            </p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button
              v-if="anime.status === 'completed'"
              @click="showRewatchForm = !showRewatchForm"
              class="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm shadow-pink-200 transition-opacity hover:opacity-90 font-jakarta"
            >
              {{ showRewatchForm ? 'Tutup Form' : '+ Rewatch' }}
            </button>
            <button
              @click="router.push('/list')"
              class="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-extrabold text-zinc-500 transition-colors hover:text-zinc-900 font-jakarta"
            >
              Lihat Semua
            </button>
          </div>
        </div>
      </section>

      <section v-if="showRewatchForm" class="mt-7 rounded-[2rem] border border-pink-200 bg-white p-6 shadow-sm shadow-pink-100/60">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-pink-500 font-jakarta">Rewatch Log</p>
            <h2 class="mt-1 text-2xl font-extrabold text-zinc-900 font-jakarta">Tambah Rewatch</h2>
          </div>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-[1fr_140px_120px]">
          <div>
            <label class="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-jakarta">Tanggal</label>
            <input v-model="rewatchForm.date" type="date" class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400" />
          </div>
          <div>
            <label class="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-jakarta">Jam</label>
            <input v-model="rewatchForm.time" type="time" class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400" />
          </div>
          <div>
            <label class="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-jakarta">Rate</label>
            <input v-model="rewatchForm.rate" type="number" min="1" max="10" step="0.5" placeholder="8.5" class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400" />
          </div>
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-jakarta">Notes</label>
          <textarea v-model="rewatchForm.notes" rows="3" placeholder="Kesan rewatch kali ini..." class="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-pink-400" />
        </div>

        <div v-if="errorMessage" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {{ errorMessage }}
        </div>

        <button
          @click="saveRewatch"
          :disabled="savingRewatch"
          class="mt-5 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 font-jakarta"
        >
          {{ savingRewatch ? 'Menyimpan...' : 'Simpan Rewatch' }}
        </button>
      </section>

      <section class="mt-10">
        <div class="mb-5 flex items-end justify-between gap-4">
          <div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-pink-500 font-jakarta">History</p>
            <h2 class="mt-1 text-2xl font-extrabold text-zinc-900 font-jakarta">Rewatch Cards</h2>
          </div>
          <span class="text-sm font-bold text-zinc-400">{{ sortedRewatches.length }} log</span>
        </div>

        <div v-if="sortedRewatches.length" class="grid gap-4 md:grid-cols-2">
          <RewatchCard
            v-for="(rewatch, idx) in sortedRewatches"
            :key="rewatch.id"
            :rewatch="rewatch"
            :index="sortedRewatches.length - idx"
          />
        </div>

        <div v-else class="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
          Belum ada rewatch. Kalau nanti nonton ulang, masukin sini biar histori hidup, bukan cuma poster doang yang cosplay aplikasi.
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RewatchCard from '../components/RewatchCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useAnimeStore } from '../stores/anime'
import type { Anime, Rewatch } from '../types'

const route = useRoute()
const router = useRouter()
const store = useAnimeStore()

const anime = ref<Anime | null>(null)
const loading = ref(false)
const showRewatchForm = ref(false)
const savingRewatch = ref(false)
const errorMessage = ref('')

const rewatchForm = reactive({
  date: todayInput(),
  time: nowTimeInput(),
  rate: '',
  notes: '',
})

onMounted(loadAnime)
watch(() => route.params.id, loadAnime)

const sortedRewatches = computed(() => {
  const list = anime.value?.rewatches || []
  return [...list].sort((a, b) => new Date(b.rewatched_at || b.created_at).getTime() - new Date(a.rewatched_at || a.created_at).getTime())
})

async function loadAnime() {
  const id = route.params.id
  if (!id || Array.isArray(id)) return
  loading.value = true
  anime.value = await store.fetchOne(id)
  loading.value = false
}

async function saveRewatch() {
  if (!anime.value || savingRewatch.value) return
  errorMessage.value = ''

  if (!rewatchForm.date) {
    errorMessage.value = 'Tanggal wajib diisi. Mesin waktu belum masuk roadmap MVP.'
    return
  }

  savingRewatch.value = true
  const payload = {
    anime_id: anime.value.id,
    rate: rewatchForm.rate ? parseFloat(rewatchForm.rate) : null,
    rewatched_at: new Date(`${rewatchForm.date}T${rewatchForm.time || '00:00'}`).toISOString(),
    notes: rewatchForm.notes || null,
  }

  const { data, error } = await store.addRewatch(payload)
  savingRewatch.value = false

  if (error) {
    errorMessage.value = error.message || 'Gagal menyimpan rewatch.'
    return
  }

  if (data) {
    anime.value.rewatches = [...(anime.value.rewatches || []), data as Rewatch]
    rewatchForm.rate = ''
    rewatchForm.notes = ''
    rewatchForm.date = todayInput()
    rewatchForm.time = nowTimeInput()
    showRewatchForm.value = false
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function formatDateTime(value: string | null) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '-'
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()} · ${hh}:${mm}`
}

function todayInput() {
  const dt = new Date()
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function nowTimeInput() {
  const dt = new Date()
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
}
</script>
