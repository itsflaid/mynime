<template>
  <article
    v-if="mode === 'detailed'"
    class="group min-h-[290px] cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/70"
    @click="$emit('click', anime)"
  >
    <div class="flex h-full min-h-[290px]">
      <div class="w-36 flex-shrink-0 overflow-hidden bg-zinc-100 sm:w-44">
        <img
          :src="anime.poster"
          :alt="anime.title"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div class="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="anime.status" />
            <span v-if="anime.top10rank" class="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Top #{{ anime.top10rank }}
            </span>
          </div>
          <span class="flex flex-shrink-0 items-center gap-1 text-sm font-medium text-zinc-500">
            <Star :size="14" :stroke-width="1.6" class="text-pink-600" />
            {{ anime.rate ?? '-' }}
          </span>
        </div>

        <h3 class="mt-4 line-clamp-2 text-xl font-bold leading-snug text-zinc-900">
          {{ anime.title }}
        </h3>

        <p class="mt-2 line-clamp-4 text-sm italic leading-relaxed text-zinc-500">
          "{{ anime.notes || 'Belum ada catatan untuk anime ini.' }}"
        </p>

        <div class="mt-auto flex items-center gap-2 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-400">
          <CalendarDays :size="14" :stroke-width="1.6" />
          <span v-if="formatDateTime(anime.completed_at)">Selesai {{ formatDateTime(anime.completed_at) }}</span>
          <span v-else>Ditambahkan {{ formatDate(anime.created_at) }}</span>
        </div>
      </div>
    </div>
  </article>

  <article v-else class="group cursor-pointer" @click="$emit('click', anime)">
    <div class="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-100/70">
      <img :src="anime.poster" :alt="anime.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div class="absolute left-2 top-2">
        <StatusBadge :status="anime.status" />
      </div>
      <div v-if="anime.rate" class="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white">
        <Star :size="12" :stroke-width="1.8" class="text-pink-400" />
        {{ anime.rate }}
      </div>
      <div v-if="anime.top10rank" class="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-extrabold text-white shadow-lg shadow-pink-400/30">
        #{{ anime.top10rank }}
      </div>
    </div>
    <h3 class="mt-2 truncate text-sm font-bold text-zinc-900">{{ anime.title }}</h3>
    <p class="text-[11px] text-zinc-400">{{ formatDate(anime.completed_at || anime.created_at) }}</p>
  </article>
</template>

<script setup lang="ts">
import { CalendarDays, Star } from '@lucide/vue'
import type { Anime } from '../types'
import StatusBadge from './StatusBadge.vue'

withDefaults(defineProps<{ anime: Anime; mode?: 'detailed' | 'compact' }>(), {
  mode: 'compact',
})

defineEmits<{ click: [anime: Anime] }>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function formatDateTime(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${formatDate(value)} · ${hours}:${minutes}`
}
</script>
