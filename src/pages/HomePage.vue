<template>
  <main class="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-8 sm:px-7 sm:py-12 md:px-8">
    <section class="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="flex min-h-[360px] flex-col justify-center rounded-[2rem] border border-zinc-200 bg-white p-7 sm:p-10 lg:p-12">
        <div class="flex w-fit items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-pink-600">
          <Archive :size="13" :stroke-width="1.8" />
          Personal Archive
        </div>
        <h1 class="mt-7 max-w-xl text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] text-zinc-950 sm:text-6xl lg:text-7xl">
          Stories worth
          <span class="text-pink-500">remembering.</span>
        </h1>
        <p class="mt-6 max-w-lg text-sm leading-7 text-zinc-500 sm:text-base">
          Sekedar catatan anime yg udah ditonton ataupun masih watchlist.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink
            to="/list"
            class="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-pink-600"
          >
            Jelajahi Koleksi
            <ArrowRight :size="16" :stroke-width="1.8" />
          </RouterLink>
          <span class="text-xs font-semibold text-zinc-400">{{ store.animeList.length }} Anime tersimpan</span>
        </div>
      </div>

      <div class="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 text-white">
        <img
          v-if="featuredAnime"
          :src="featuredAnime.poster"
          :alt="featuredAnime.title"
          class="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div class="absolute inset-0 bg-zinc-950/55" />

        <div class="relative flex h-full min-h-[360px] flex-col justify-between p-7 sm:p-9">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-[0.22em] text-pink-300">Archive Snapshot</p>
              <h2 class="mt-2 text-2xl font-bold">{{ featuredAnime ? 'Latest memory' : 'Your collection' }}</h2>
            </div>
            <div class="rounded-full border border-white/20 bg-white/10 p-2.5">
              <Library :size="18" :stroke-width="1.7" />
            </div>
          </div>

          <button
            v-if="featuredAnime"
            type="button"
            class="my-8 max-w-sm text-left"
            @click="router.push(`/anime/${featuredAnime.id}`)"
          >
            <StatusBadge :status="featuredAnime.status" />
            <h3 class="mt-3 line-clamp-2 text-3xl font-bold leading-tight">{{ featuredAnime.title }}</h3>
            <p v-if="featuredAnime.notes" class="mt-2 line-clamp-2 text-sm italic leading-relaxed text-zinc-300">
              "{{ featuredAnime.notes }}"
            </p>
          </button>

          <div class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15">
            <div v-for="stat in stats" :key="stat.label" class="bg-zinc-950/75 p-4 backdrop-blur-sm">
              <div class="flex items-center justify-between gap-2">
                <component :is="stat.icon" :size="15" :stroke-width="1.7" :style="{ color: stat.color }" />
                <span class="text-2xl font-extrabold">{{ stat.value }}</span>
              </div>
              <p class="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="top10.length">
      <SectionHeader title="Top 10 Favorites" desc="My Anime favorite gua." />
      <div class="mt-5 flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
        <button
          v-for="anime in top10"
          :key="anime.id"
          type="button"
          class="group min-w-[180px] max-w-[180px] flex-shrink-0 text-left"
          @click="router.push(`/anime/${anime.id}`)"
        >
          <div class="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-100">
            <img :src="anime.poster" :alt="anime.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div class="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white shadow-lg shadow-pink-500/30">
              {{ anime.top10rank }}
            </div>
            <div v-if="anime.rate" class="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1">
              <Star :size="12" :stroke-width="1.8" class="text-pink-400" />
              <span class="text-xs font-bold text-white">{{ anime.rate }}</span>
            </div>
          </div>
          <div class="mt-2.5 truncate text-sm font-bold text-zinc-900">{{ anime.title }}</div>
          <div v-if="anime.notes" class="mt-0.5 truncate text-xs text-zinc-400">{{ anime.notes }}</div>
        </button>
      </div>
    </section>

    <section v-if="recentCompleted.length">
      <SectionHeader title="Recently Completed" desc="Anime yang baru watashi tonton." />
      <HScrollRow :items="recentCompleted" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=completed')" />
    </section>

    <section v-if="watching.length">
      <SectionHeader title="Currently Watching" desc="Cerita yang sedang berjalan." />
      <HScrollRow :items="watching" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=watching')" />
    </section>

    <section v-if="watchlist.length">
      <SectionHeader title="Watchlist" desc="Antrian untuk perjalanan berikutnya." />
      <HScrollRow :items="watchlist" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=watchlist')" />
    </section>

    <section v-if="onhold.length">
      <SectionHeader title="On Hold" desc="Berhenti sejenak, belum benar-benar selesai." />
      <HScrollRow :items="onhold" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=onhold')" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Archive, ArrowRight, Bookmark, CheckCircle2, Eye, Library, PauseCircle, Star } from '@lucide/vue'
import { useRouter } from 'vue-router'
import HScrollRow from '../components/HScrollRow.vue'
import SectionHeader from '../components/SectionHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useAnimeStore } from '../stores/anime'

const router = useRouter()
const store = useAnimeStore()

onMounted(() => {
  if (!store.animeList.length) store.fetchAll()
})

const sortedByDate = computed(() =>
  [...store.animeList].sort((a, b) => {
    const aDate = a.completed_at || a.created_at
    const bDate = b.completed_at || b.created_at
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  }),
)

const featuredAnime = computed(() => sortedByDate.value[0] ?? null)
const top10 = computed(() =>
  store.animeList
    .filter(anime => anime.top10rank)
    .sort((a, b) => (a.top10rank ?? 0) - (b.top10rank ?? 0)),
)
const recentCompleted = computed(() => sortedByDate.value.filter(anime => anime.status === 'completed').slice(0, 8))
const watching = computed(() => sortedByDate.value.filter(anime => anime.status === 'watching').slice(0, 8))
const watchlist = computed(() => sortedByDate.value.filter(anime => anime.status === 'watchlist').slice(0, 8))
const onhold = computed(() => sortedByDate.value.filter(anime => anime.status === 'onhold').slice(0, 8))

const stats = computed(() => [
  {
    label: 'Completed',
    value: store.animeList.filter(anime => anime.status === 'completed').length,
    color: '#f472b6',
    icon: CheckCircle2,
  },
  {
    label: 'Watching',
    value: store.animeList.filter(anime => anime.status === 'watching').length,
    color: '#a78bfa',
    icon: Eye,
  },
  {
    label: 'Watchlist',
    value: store.animeList.filter(anime => anime.status === 'watchlist').length,
    color: '#22d3ee',
    icon: Bookmark,
  },
  {
    label: 'On Hold',
    value: store.animeList.filter(anime => anime.status === 'onhold').length,
    color: '#fbbf24',
    icon: PauseCircle,
  },
])
</script>
