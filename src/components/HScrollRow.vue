<template>
  <div class="flex gap-4 overflow-x-auto pb-3 scrollbar-hide mt-5">
    <div
      v-for="anime in items" :key="anime.id"
      @click="$emit('card-click', anime)"
      class="min-w-[130px] max-w-[130px] flex-shrink-0 cursor-pointer group"
    >
      <div class="w-full aspect-[2/3] rounded-xl overflow-hidden relative shadow-sm group-hover:-translate-y-1.5 group-hover:shadow-pink-200/50 group-hover:shadow-lg transition-all duration-200">
        <img :src="anime.poster" :alt="anime.title" class="w-full h-full object-cover" />
        <div v-if="anime.rate" class="absolute bottom-2 right-2 bg-black/65 rounded-md px-1.5 py-0.5 flex items-center gap-1">
          <span class="text-pink-400 text-[9px]">★</span>
          <span class="text-white text-[11px] font-bold font-jakarta">{{ anime.rate }}</span>
        </div>
      </div>
      <div class="text-xs font-semibold text-zinc-900 font-jakarta truncate mt-2">{{ anime.title }}</div>
      <div v-if="fmtDate(anime.completed_at)" class="text-[10px] text-zinc-400 mt-0.5">{{ fmtDate(anime.completed_at) }}</div>
    </div>

    <!-- See All -->
    <div
      @click="$emit('see-all')"
      class="min-w-[130px] max-w-[130px] flex-shrink-0 cursor-pointer group"
    >
      <div class="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 group-hover:border-pink-400 group-hover:bg-pink-50/30 transition-all duration-200">
        <span class="text-2xl text-zinc-300 group-hover:text-pink-400 transition-colors">→</span>
        <span class="text-[10px] font-bold text-zinc-300 group-hover:text-pink-400 uppercase tracking-widest transition-colors font-jakarta">See All</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Anime } from '../types'

defineProps<{ items: Anime[] }>()
defineEmits<{ 'card-click': [anime: Anime]; 'see-all': [] }>()

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

function fmtDate(d: string | null) {
  if (!d) return null
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}
</script>