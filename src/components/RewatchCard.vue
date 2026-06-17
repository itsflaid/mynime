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
      <div class="flex items-center gap-2">
        <div v-if="rewatch.rate" class="flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-1.5 text-sm font-extrabold text-white">
          <Star :size="14" :stroke-width="1.8" class="text-pink-400" />
          {{ rewatch.rate }}
        </div>
        <button
          v-if="!confirmingDelete"
          type="button"
          aria-label="Hapus rewatch"
          class="rounded-xl border border-zinc-200 p-2 text-zinc-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          @click="confirmingDelete = true"
        >
          <Trash2 :size="15" :stroke-width="1.8" />
        </button>
      </div>
    </div>

    <p class="mt-4 text-sm leading-relaxed text-zinc-500">
      {{ rewatch.notes || 'Tidak ada catatan rewatch. Minimal dia tidak pura-pura produktif, hadeh.' }}
    </p>

    <div v-if="confirmingDelete" class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
      <p class="text-xs font-semibold text-red-700">Hapus catatan rewatch ini?</p>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="deleting"
          class="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="$emit('delete', rewatch.id)"
        >
          {{ deleting ? 'Menghapus...' : 'Hapus' }}
        </button>
        <button
          type="button"
          :disabled="deleting"
          class="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:border-red-300 disabled:opacity-60"
          @click="confirmingDelete = false"
        >
          Batal
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star, Trash2 } from '@lucide/vue'
import type { Rewatch } from '../types'

defineProps<{ rewatch: Rewatch; index: number; deleting?: boolean }>()
defineEmits<{ delete: [id: string] }>()

const confirmingDelete = ref(false)

function formatDateTime(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Makassar',
    timeZoneName: 'short',
  }).format(date)
}
</script>
