<template>
  <article
    v-if="mode === 'detailed'"
    class="group cursor-pointer rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-100/70"
    @click="$emit('click', anime)"
  >
    <div class="flex gap-4">
      <div class="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
        <img :src="anime.poster" :alt="anime.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div v-if="anime.rate" class="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white">
          <span class="text-pink-400">★</span> {{ anime.rate }}
        </div>
      </div>

      <div class="min-w-0 flex-1 py-1">
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="anime.status" />
          <span v-if="anime.top10rank" class="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 font-jakarta">
            Top #{{ anime.top10rank }}
          </span>
        </div>

        <h3 class="mt-3 line-clamp-2 text-lg font-extrabold leading-snug text-zinc-900 font-jakarta">
          {{ anime.title }}
        </h3>

        <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {{ anime.notes || 'Belum ada catatan. Anime ini masih diem aja kayak repo tanpa README.' }}
        </p>

        <div class="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-zinc-400">
          <span v-if="formatDateTime(anime.completed_at)">Selesai: {{ formatDateTime(anime.completed_at) }}</span>
          <span v-else>Ditambahkan: {{ formatDate(anime.created_at) }}</span>
        </div>
      </div>
    </div>
  </article>

  <article
    v-else
    class="group cursor-pointer"
    @click="$emit('click', anime)"
  >
    <div class="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-100/70">
      <img :src="anime.poster" :alt="anime.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div class="absolute left-2 top-2">
        <StatusBadge :status="anime.status" />
      </div>
      <div v-if="anime.rate" class="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white">
        <span class="text-pink-400">★</span> {{ anime.rate }}
      </div>
      <div v-if="anime.top10rank" class="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-extrabold text-white shadow-lg shadow-pink-400/30">
        #{{ anime.top10rank }}
      </div>
    </div>
    <h3 class="mt-2 truncate text-sm font-bold text-zinc-900 font-jakarta">{{ anime.title }}</h3>
    <p class="text-[11px] text-zinc-400">{{ formatDate(anime.completed_at || anime.created_at) }}</p>
  </article>
</template>

<script setup lang="ts">
import type { Anime } from '../types'
import StatusBadge from './StatusBadge.vue'

withDefaults(defineProps<{ anime: Anime; mode?: 'detailed' | 'compact' }>(), {
  mode: 'compact',
})

defineEmits<{ click: [anime: Anime] }>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function formatDate(value: string | null) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '-'
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}

function formatDateTime(value: string | null) {
  if (!value) return null
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return null
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${formatDate(value)} · ${hh}:${mm}`
}
</script>
