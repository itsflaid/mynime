<template>
  <div class="max-w-5xl mx-auto px-7 py-10 flex flex-col gap-14">

    <!-- Hero -->
    <div class="flex flex-col gap-2">
      <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-jakarta">Personal Archive</p>
      <h1 class="text-5xl font-bold text-zinc-900 font-jakarta leading-tight">Curated Journey</h1>
      <p class="text-sm text-zinc-400 font-jakarta mt-1">Catatan perjalanan anime pribadi — dari yang ditonton, lagi jalan, sampai yang masuk wishlist.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label" class="bg-white border border-zinc-200 rounded-2xl px-5 py-5">
        <div class="font-bold text-4xl font-jakarta leading-none" :style="{ color: s.color }">{{ s.val }}</div>
        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 font-jakarta">{{ s.label }}</div>
      </div>
    </div>

    <!-- Top 10 -->
    <section v-if="top10.length">
      <SectionHeader title="Top 10 Favorites" desc="Hall of fame koleksi anime terbaik." />
      <div class="flex gap-5 overflow-x-auto pb-3 scrollbar-hide mt-5">
        <div
          v-for="anime in top10" :key="anime.id"
          @click="router.push(`/anime/${anime.id}`)"
          class="min-w-[180px] max-w-[180px] flex-shrink-0 cursor-pointer group"
        >
          <div class="w-full aspect-[2/3] rounded-2xl overflow-hidden relative shadow-md group-hover:-translate-y-1 group-hover:shadow-pink-200/60 group-hover:shadow-xl transition-all duration-200">
            <img :src="anime.poster" :alt="anime.title" class="w-full h-full object-cover" />
            <!-- rank badge -->
            <div class="absolute top-2.5 left-2.5 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-300/50">
              <span class="text-white text-xs font-bold font-jakarta">{{ anime.top10rank }}</span>
            </div>
            <!-- rate -->
            <div v-if="anime.rate" class="absolute bottom-2.5 right-2.5 bg-black/65 rounded-lg px-2 py-1 flex items-center gap-1">
              <span class="text-pink-400 text-[10px]">★</span>
              <span class="text-white text-xs font-bold font-jakarta">{{ anime.rate }}</span>
            </div>
          </div>
          <div class="mt-2.5">
            <div class="text-sm font-bold text-zinc-900 font-jakarta truncate">{{ anime.title }}</div>
            <div v-if="anime.notes" class="text-xs text-zinc-400 truncate mt-0.5">{{ anime.notes }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recently Completed -->
    <section v-if="recentCompleted.length">
      <SectionHeader title="Recently Completed" desc="Anime yang baru-baru ini selesai ditonton." />
      <HScrollRow :items="recentCompleted" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=completed')" />
    </section>

    <!-- Watching -->
    <section v-if="watching.length">
      <SectionHeader title="Currently Watching" desc="Lagi on progress." />
      <HScrollRow :items="watching" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=watching')" />
    </section>

    <!-- Watchlist -->
    <section v-if="watchlist.length">
      <SectionHeader title="Watchlist" desc="Antrian nonton berikutnya." />
      <HScrollRow :items="watchlist" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=watchlist')" />
    </section>

    <!-- On Hold -->
    <section v-if="onhold.length">
      <SectionHeader title="On Hold" desc="Ditunda dulu, entah sementara atau selamanya." />
      <HScrollRow :items="onhold" @card-click="router.push(`/anime/${$event.id}`)" @see-all="router.push('/list?status=onhold')" />
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '../stores/anime'
import type { Anime } from '../types'
import SectionHeader from '../components/SectionHeader.vue'
import HScrollRow from '../components/HScrollRow.vue'

const router = useRouter()
const store = useAnimeStore()

onMounted(() => { if (!store.animeList.length) store.fetchAll() })

const sortedByDate = computed(() =>
  [...store.animeList].sort((a, b) => {
    if (!a.completed_at && !b.completed_at) return 0
    if (!a.completed_at) return 1
    if (!b.completed_at) return -1
    return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  })
)

const top10        = computed(() => store.animeList.filter(a => a.top10rank).sort((a, b) => (a.top10rank ?? 0) - (b.top10rank ?? 0)))
const recentCompleted = computed(() => sortedByDate.value.filter(a => a.status === 'completed').slice(0, 8))
const watching     = computed(() => store.animeList.filter(a => a.status === 'watching').slice(0, 8))
const watchlist    = computed(() => store.animeList.filter(a => a.status === 'watchlist').slice(0, 8))
const onhold       = computed(() => store.animeList.filter(a => a.status === 'onhold').slice(0, 8))

const stats = computed(() => [
  { label: 'Completed', val: store.animeList.filter(a => a.status === 'completed').length, color: '#e91e8c' },
  { label: 'Watching',  val: store.animeList.filter(a => a.status === 'watching').length,  color: '#7c3aed' },
  { label: 'Watchlist', val: store.animeList.filter(a => a.status === 'watchlist').length, color: '#0891b2' },
  { label: 'On Hold',   val: store.animeList.filter(a => a.status === 'onhold').length,    color: '#d97706' },
])
</script>