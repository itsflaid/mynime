<template>
  <main class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-7 md:px-8">
    <section>
      <p class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-pink-500">Personal Archive</p>
      <h1 class="mt-2 text-4xl font-extrabold leading-tight text-zinc-900 md:text-5xl">Curated Journey</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Semua catatan anime kamu. Filter berdasarkan status, lalu pilih tampilan detailed untuk membaca catatan atau compact untuk menjelajah koleksi.
      </p>
    </section>

    <section class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 md:hidden"
        :aria-expanded="showMobileFilters"
        @click="showMobileFilters = !showMobileFilters"
      >
        <span class="flex items-center gap-2">
          <SlidersHorizontal :size="16" :stroke-width="1.8" class="text-pink-500" />
          Filter: {{ activeTabLabel }}
          <span class="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] text-pink-600">{{ countByStatus(activeStatus) }}</span>
        </span>
        <ChevronDown
          :size="16"
          :stroke-width="1.8"
          class="transition-transform"
          :class="{ 'rotate-180': showMobileFilters }"
        />
      </button>

      <div class="hidden flex-wrap gap-2 md:flex">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest transition-all"
          :class="activeStatus === tab.value
            ? 'border-pink-300 bg-pink-50 text-pink-600'
            : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 hover:text-zinc-900'"
          @click="setStatus(tab.value)"
        >
          {{ tab.label }}
          <span class="ml-1 opacity-60">{{ countByStatus(tab.value) }}</span>
        </button>
      </div>

      <div class="flex w-fit flex-shrink-0 rounded-full bg-pink-50 p-1">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          type="button"
          class="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-all"
          :class="viewMode === option.value
            ? 'bg-white text-pink-700 shadow-[0_3px_12px_rgba(233,30,140,0.12)]'
            : 'text-zinc-500 hover:text-pink-700'"
          @click="viewMode = option.value"
        >
          <List v-if="option.value === 'detailed'" :size="14" :stroke-width="1.8" />
          <Grid2X2 v-else :size="14" :stroke-width="1.8" />
          {{ option.label }}
        </button>
      </div>
    </section>

    <section v-if="showMobileFilters" class="-mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm md:hidden">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors"
        :class="activeStatus === tab.value
          ? 'border-pink-200 bg-pink-50 text-pink-600'
          : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'"
        @click="setStatus(tab.value)"
      >
        {{ tab.label }}
        <span class="text-[10px] opacity-60">{{ countByStatus(tab.value) }}</span>
      </button>
    </section>

    <section v-if="store.loading" class="grid gap-5 lg:grid-cols-2">
      <div v-for="n in 4" :key="n" class="h-[290px] animate-pulse rounded-2xl bg-zinc-100" />
    </section>

    <section v-else-if="filteredAnime.length === 0" class="rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center">
      <Inbox :size="40" :stroke-width="1.5" class="mx-auto text-zinc-300" />
      <h2 class="mt-3 text-xl font-extrabold text-zinc-900">Belum ada anime di filter ini</h2>
      <p class="mt-2 text-sm text-zinc-400">Tambahkan anime untuk mulai mengisi personal archive kamu.</p>
    </section>

    <section v-else-if="viewMode === 'detailed'" class="grid gap-5 lg:grid-cols-2">
      <AnimeCard
        v-for="anime in filteredAnime"
        :key="anime.id"
        :anime="anime"
        mode="detailed"
        @click="goDetail"
      />
    </section>

    <section v-else class="grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5 xl:grid-cols-6">
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
import { ChevronDown, Grid2X2, Inbox, List, SlidersHorizontal } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import AnimeCard from '../components/AnimeCard.vue'
import { useAnimeStore } from '../stores/anime'
import type { Anime, AnimeStatus } from '../types'

type StatusFilter = AnimeStatus | 'all'
type ViewMode = 'detailed' | 'compact'

const route = useRoute()
const router = useRouter()
const store = useAnimeStore()
const statuses: AnimeStatus[] = ['completed', 'watching', 'watchlist', 'onhold', 'dropped']
const tabs: { label: string; value: StatusFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Watching', value: 'watching' },
  { label: 'Watchlist', value: 'watchlist' },
  { label: 'On Hold', value: 'onhold' },
  { label: 'Dropped', value: 'dropped' },
]
const viewOptions: { label: string; value: ViewMode }[] = [
  { label: 'Detailed', value: 'detailed' },
  { label: 'Compact', value: 'compact' },
]

const viewMode = ref<ViewMode>('detailed')
const activeStatus = ref<StatusFilter>(normalizeStatus(route.query.status))
const showMobileFilters = ref(false)

onMounted(() => {
  if (!store.animeList.length) store.fetchAll()
})

watch(
  () => route.query.status,
  value => {
    activeStatus.value = normalizeStatus(value)
  },
)

const filteredAnime = computed(() => {
  const list = activeStatus.value === 'all'
    ? store.animeList
    : store.animeList.filter(anime => anime.status === activeStatus.value)

  return [...list].sort(sortAnime)
})

const activeTabLabel = computed(() =>
  tabs.find(tab => tab.value === activeStatus.value)?.label ?? 'Semua',
)

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
  showMobileFilters.value = false
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
