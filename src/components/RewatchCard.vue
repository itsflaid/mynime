<template>
  <article class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-[10px] font-extrabold uppercase tracking-widest text-pink-500 font-jakarta">
          Rewatch #{{ index }}
        </div>
        <h3 class="mt-1 text-lg font-extrabold text-zinc-900 font-jakarta">
          {{ formatDateTime(rewatch.rewatched_at) }}
        </h3>
      </div>
      <div v-if="rewatch.rate" class="rounded-xl bg-zinc-900 px-3 py-1.5 text-sm font-extrabold text-white">
        <span class="text-pink-400">★</span> {{ rewatch.rate }}
      </div>
    </div>

    <p class="mt-4 text-sm leading-relaxed text-zinc-500">
      {{ rewatch.notes || 'Tidak ada catatan rewatch. Minimal dia tidak pura-pura produktif, hadeh.' }}
    </p>
  </article>
</template>

<script setup lang="ts">
import type { Rewatch } from '../types'

defineProps<{ rewatch: Rewatch; index: number }>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function formatDateTime(value: string | null) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '-'
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()} · ${hh}:${mm}`
}
</script>
