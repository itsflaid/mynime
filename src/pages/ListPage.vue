<template>
  <main class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:px-8">
    <section class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-pink-500 font-jakarta">Library</p>
        <h1 class="mt-2 text-4xl font-extrabold leading-tight text-zinc-900 font-jakarta md:text-5xl">Curated Journey</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Semua catatan anime kamu. Bisa difilter status, terus pilih mode detailed kalau lagi niat baca catatan, atau compact kalau cuma mau scroll poster kayak katalog dosa waktu luang.
        </p>
      </div>

      <div class="flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          @click="viewMode = option.value"
          class="rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-widest transition-all font-jakarta"
          :class="viewMode === option.value ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-900'"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="setStatus(tab.value)"
        class="rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest transition-all font-jakarta"
        :class="activeStatus === tab.value ? 'border-pink-300 bg-pink-50 text-pink-600' : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 hover:text-zinc-900'"
      >
        {{ tab.label }}
        <span class="ml-1 opacity-60">{{ countByStatus(tab.value) }}</span>
      </button>
    </section>

    <section v-if="store.loading" class="grid gap-4">
      <div v-for="n in 5" :key="n" class="h-40 animate-pulse rounded-3xl bg-zinc-100" />
    </section>

    <section v-else-if="filteredAnime.length === 0" class="rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center">
      <div class="text-4xl">📭</div>
      <h2 class="mt-3 text-xl font-extrabold text-zinc-900 font-jakarta">Belum ada anime di filter ini</h2>
      <p class="mt-2 text-sm text-zinc-400">Klik Add Anime dulu. Jangan cuma bikin sistemnya, isi datanya juga, lah kocak.</p>
    </section>

    <section v-else-if="viewMode === 'detailed'" class="grid gap-4">
      <AnimeCard
        v-for="anime in filteredAnime"
        :key="anime.id"
        :anime="anime"
        mode="detailed"
        @click="goDetail"
      />
    </section>

    <section v-else class="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <AnimeCard
        v-for="anime in filteredAnime"
        :key="anime.id"
        :anime="anime"
        mode="compact"
        @click="goDetail"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AnimeCard from '../components/AnimeCard.vue'
import { useAnimeStore } from '../stores/anime'
import type { Anime, AnimeStatus } from '../types'

const route = useRoute()
const router = useRouter()
const store = useAnimeStore()

const statuses: AnimeStatus[] = ['completed', 'watching', 'watchlist', 'onhold', 'dropped']
type StatusFilter = AnimeStatus | 'all'

const tabs: { label: string; value: StatusFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Watching', value: 'watching' },
  { label: 'Watchlist', value: 'watchlist' },
  { label: 'On Hold', value: 'onhold' },
  { label: 'Dropped', value: 'dropped' },
]

const viewOptions = [
  { label: 'Detailed', value: 'detailed' as const },
  { label: 'Compact', value: 'compact' as const },
]

const viewMode = ref<'detailed' | 'compact'>('detailed')
const activeStatus = ref<StatusFilter>(normalizeStatus(route.query.status))

onMounted(() => {
  if (!store.animeList.length) store.fetchAll()
})

watch(
  () => route.query.status,
  value => {
    activeStatus.value = normalizeStatus(value)
  }
)

const filteredAnime = computed(() => {
  const list = activeStatus.value === 'all'
    ? store.animeList
    : store.animeList.filter(anime => anime.status === activeStatus.value)

  return [...list].sort(sortAnime)
})

function sortAnime(a: Anime, b: Anime) {
  const aDate = a.completed_at || a.created_at
  const bDate = b.completed_at || b.created_at
  return new Date(bDate).getTime() - new Date(aDate).getTime()
}

function normalizeStatus(value: unknown): StatusFilter {
  const raw = Array.isArray(value) ? value[0] : value
  return statuses.includes(raw as AnimeStatus) ? (raw as AnimeStatus) : 'all'
}

function setStatus(status: StatusFilter) {
  activeStatus.value = status
  router.replace({ path: '/list', query: status === 'all' ? {} : { status } })
}

function countByStatus(status: StatusFilter) {
  if (status === 'all') return store.animeList.length
  return store.animeList.filter(anime => anime.status === status).length
}

function goDetail(anime: Anime) {
  router.push(`/anime/${anime.id}`)
}
</script>
