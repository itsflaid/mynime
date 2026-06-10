<template>
  <main class="mx-auto max-w-6xl px-5 py-8 md:px-8">
    <button
      @click="router.back()"
      class="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900 font-jakarta"
    >
      <ArrowLeft :size="14" :stroke-width="1.8" />
      Back
    </button>

    <section v-if="loading" class="grid gap-6 md:grid-cols-[280px_1fr]">
      <div class="aspect-[2/3] animate-pulse rounded-3xl bg-zinc-100" />
      <div class="h-96 animate-pulse rounded-3xl bg-zinc-100" />
    </section>

    <section v-else-if="!anime" class="rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center">
      <CircleOff :size="40" :stroke-width="1.5" class="mx-auto text-zinc-300" />
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
            <span v-if="anime.rate" class="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-xs font-extrabold text-white">
              <Star :size="12" :stroke-width="1.8" class="text-pink-400" />
              {{ anime.rate }}/10
            </span>
          </div>

          <h1 class="mt-5 text-3xl font-extrabold leading-tight text-zinc-900 font-jakarta md:text-5xl">
            {{ anime.title }}
          </h1>

          <div v-if="showEditForm" class="mt-6 rounded-2xl border border-pink-200 bg-pink-50/40 p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-widest text-pink-500">Edit Anime</p>
                <p class="mt-1 text-xs text-zinc-400">Judul dan poster tetap dikunci.</p>
              </div>
              <button
                type="button"
                aria-label="Tutup form edit"
                class="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-400 transition-colors hover:text-zinc-900"
                @click="cancelEdit"
              >
                <X :size="14" :stroke-width="1.8" />
              </button>
            </div>

            <div class="mt-5">
              <span class="edit-label">Status</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="status in editStatuses"
                  :key="status.value"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                  :class="editForm.status === status.value
                    ? 'border-pink-300 bg-pink-100 text-pink-700'
                    : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300'"
                  @click="editForm.status = status.value"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label for="edit-rate" class="edit-label">Rate (1-10)</label>
                <input
                  id="edit-rate"
                  v-model="editForm.rate"
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  placeholder="Kosongkan jika belum ada"
                  class="edit-input"
                />
              </div>
              <div>
                <label for="edit-top10" class="edit-label">Top 10 Rank</label>
                <select id="edit-top10" v-model="editForm.top10rank" class="edit-input">
                  <option value="">Tidak masuk Top 10</option>
                  <option v-for="rank in 10" :key="rank" :value="String(rank)">Rank {{ rank }}</option>
                </select>
              </div>
            </div>

            <div v-if="editForm.status === 'completed'" class="mt-4 grid gap-4 sm:grid-cols-[1fr_140px]">
              <div>
                <label for="edit-date" class="edit-label">Tanggal Selesai</label>
                <input id="edit-date" v-model="editForm.date" type="date" class="edit-input" />
              </div>
              <div>
                <label for="edit-time" class="edit-label">Jam</label>
                <input id="edit-time" v-model="editForm.time" type="time" class="edit-input" />
              </div>
            </div>

            <div class="mt-4">
              <label for="edit-notes" class="edit-label">Notes</label>
              <textarea
                id="edit-notes"
                v-model="editForm.notes"
                rows="4"
                placeholder="Catatan tentang anime ini..."
                class="edit-input resize-none leading-relaxed"
              />
            </div>

            <p v-if="editError" class="mt-3 text-xs font-semibold text-red-600">{{ editError }}</p>

            <div class="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                :disabled="savingEdit"
                class="rounded-xl bg-pink-500 px-5 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                @click="saveEdit"
              >
                {{ savingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
              <button
                type="button"
                :disabled="savingEdit"
                class="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-extrabold text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-60"
                @click="cancelEdit"
              >
                Batal
              </button>
            </div>
          </div>

          <template v-else>
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

            <div class="mt-6 rounded-3xl bg-pink-50 p-5">
              <div class="text-[10px] font-extrabold uppercase tracking-widest text-pink-500 font-jakarta">Notes</div>
              <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                {{ anime.notes || 'Belum ada catatan untuk anime ini.' }}
              </p>
            </div>
          </template>

          <div v-if="!showEditForm" class="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Top 10</div>
                <div v-if="anime.top10rank !== null && anime.top10rank !== undefined" class="mt-2 flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-[#fce4f0] px-3 py-1.5 text-xs font-extrabold text-[#c41574]">
                    <Star :size="14" :stroke-width="1.8" />
                    Top #{{ anime.top10rank }}
                  </span>
                  <button
                    type="button"
                    aria-label="Edit Top 10 rank"
                    class="rounded-lg border border-zinc-200 p-2 text-zinc-400 transition-colors hover:border-pink-200 hover:text-pink-600"
                    @click="openTop10Editor"
                  >
                    <Pencil :size="14" :stroke-width="1.8" />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus dari Top 10"
                    class="rounded-lg border border-zinc-200 p-2 text-zinc-400 transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="savingTop10"
                    @click="removeFromTop10"
                  >
                    <X :size="14" :stroke-width="1.8" />
                  </button>
                </div>
              </div>

              <button
                v-if="(anime.top10rank === null || anime.top10rank === undefined) && !showTop10Editor"
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-pink-600"
                @click="openTop10Editor"
              >
                <Star :size="15" :stroke-width="1.8" />
                Tambah ke Top 10
              </button>
            </div>

            <div v-if="showTop10Editor" class="mt-4 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-4">
              <div>
                <label for="top10-rank" class="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Rank 1-10
                </label>
                <input
                  id="top10-rank"
                  v-model.number="top10RankInput"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  class="w-24 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-bold text-zinc-900 outline-none transition-colors focus:border-pink-400"
                />
              </div>
              <button
                type="button"
                :disabled="savingTop10"
                class="rounded-xl bg-pink-500 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                @click="saveTop10Rank"
              >
                {{ savingTop10 ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button
                type="button"
                :disabled="savingTop10"
                class="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-extrabold text-zinc-500 transition-colors hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                @click="cancelTop10Editor"
              >
                Batal
              </button>
            </div>

            <p v-if="top10Error" class="mt-3 text-xs font-semibold text-red-600">
              {{ top10Error }}
            </p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button
              v-if="!showEditForm"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-5 py-3 text-sm font-extrabold text-pink-600 transition-colors hover:bg-pink-50"
              @click="openEditForm"
            >
              <Pencil :size="15" :stroke-width="1.8" />
              Edit Anime
            </button>
            <button
              v-if="anime.status === 'completed'"
              @click="showRewatchForm = !showRewatchForm"
              class="rounded-xl bg-pink-500 px-5 py-3 text-sm font-extrabold text-white shadow-sm shadow-pink-200 transition-colors hover:bg-pink-600 font-jakarta"
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
import { ArrowLeft, CircleOff, Pencil, Star, X } from '@lucide/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RewatchCard from '../components/RewatchCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useAnimeStore } from '../stores/anime'
import type { Anime, AnimeStatus, Rewatch } from '../types'

const route = useRoute()
const router = useRouter()
const store = useAnimeStore()

const anime = ref<Anime | null>(null)
const loading = ref(false)
const showRewatchForm = ref(false)
const savingRewatch = ref(false)
const errorMessage = ref('')
const showTop10Editor = ref(false)
const savingTop10 = ref(false)
const top10RankInput = ref<number | null>(null)
const top10Error = ref('')
const showEditForm = ref(false)
const savingEdit = ref(false)
const editError = ref('')

const editStatuses: { label: string; value: AnimeStatus }[] = [
  { label: 'Completed', value: 'completed' },
  { label: 'Watching', value: 'watching' },
  { label: 'Watchlist', value: 'watchlist' },
  { label: 'On Hold', value: 'onhold' },
  { label: 'Dropped', value: 'dropped' },
]

const editForm = reactive({
  status: 'watchlist' as AnimeStatus,
  rate: '',
  date: '',
  time: '',
  notes: '',
  top10rank: '',
})

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

function openTop10Editor() {
  top10RankInput.value = anime.value?.top10rank ?? 1
  top10Error.value = ''
  showTop10Editor.value = true
}

function cancelTop10Editor() {
  showTop10Editor.value = false
  top10Error.value = ''
}

async function saveTop10Rank() {
  if (!anime.value || savingTop10.value) return

  const rank = Number(top10RankInput.value)
  if (!Number.isInteger(rank) || rank < 1 || rank > 10) {
    top10Error.value = 'Rank harus berupa angka bulat dari 1 sampai 10.'
    return
  }

  await persistTop10Rank(rank)
}

async function removeFromTop10() {
  if (!anime.value || savingTop10.value) return
  await persistTop10Rank(null)
}

async function persistTop10Rank(rank: number | null) {
  if (!anime.value) return

  savingTop10.value = true
  top10Error.value = ''
  const { error } = await store.updateTop10Rank(anime.value.id, rank)

  if (error) {
    top10Error.value = error.message || 'Gagal memperbarui Top 10.'
    savingTop10.value = false
    return
  }

  anime.value = await store.fetchOne(anime.value.id)
  savingTop10.value = false
  showTop10Editor.value = false
}

function openEditForm() {
  if (!anime.value) return

  const completedAt = anime.value.completed_at ? new Date(anime.value.completed_at) : null
  editForm.status = anime.value.status
  editForm.rate = anime.value.rate?.toString() ?? ''
  editForm.date = completedAt ? formatDateInput(completedAt) : ''
  editForm.time = completedAt ? formatTimeInput(completedAt) : ''
  editForm.notes = anime.value.notes ?? ''
  editForm.top10rank = anime.value.top10rank?.toString() ?? ''
  editError.value = ''
  showTop10Editor.value = false
  showEditForm.value = true
}

function cancelEdit() {
  showEditForm.value = false
  editError.value = ''
}

async function saveEdit() {
  if (!anime.value || savingEdit.value) return

  const rate = editForm.rate ? Number(editForm.rate) : null
  if (rate !== null && (!Number.isFinite(rate) || rate < 1 || rate > 10)) {
    editError.value = 'Rate harus berada di antara 1 sampai 10.'
    return
  }

  if (editForm.status === 'completed' && !editForm.date) {
    editError.value = 'Tanggal selesai wajib diisi untuk status Completed.'
    return
  }

  const nextTop10Rank = editForm.top10rank ? Number(editForm.top10rank) : null
  const currentTop10Rank = anime.value.top10rank ?? null
  const completedAt = editForm.status === 'completed'
    ? new Date(`${editForm.date}T${editForm.time || '00:00'}`).toISOString()
    : null

  savingEdit.value = true
  editError.value = ''

  const { error } = await store.updateAnime(anime.value.id, {
    status: editForm.status,
    rate,
    completed_at: completedAt,
    notes: editForm.notes.trim() || null,
  })

  if (error) {
    editError.value = error.message || 'Gagal menyimpan perubahan anime.'
    savingEdit.value = false
    return
  }

  if (nextTop10Rank !== currentTop10Rank) {
    const { error: top10UpdateError } = await store.updateTop10Rank(anime.value.id, nextTop10Rank)
    if (top10UpdateError) {
      editError.value = top10UpdateError.message || 'Data anime tersimpan, tetapi Top 10 gagal diperbarui.'
      savingEdit.value = false
      return
    }
  }

  anime.value = await store.fetchOne(anime.value.id)
  savingEdit.value = false
  showEditForm.value = false
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

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.edit-label {
  @apply mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-zinc-400;
}

.edit-input {
  @apply w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-400;
}
</style>
