<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest font-jakarta"
    :style="{ backgroundColor: config.bg, color: config.text, borderColor: config.border }"
  >
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnimeStatus } from '../types'

const props = defineProps<{ status: AnimeStatus }>()

const STATUS_CONFIG: Record<AnimeStatus, { label: string; bg: string; text: string; border: string }> = {
  completed: { label: 'Completed', bg: '#fce4f0', text: '#c41574', border: '#e91e8c55' },
  watching: { label: 'Watching', bg: '#ede9fe', text: '#6d28d9', border: '#7c3aed55' },
  watchlist: { label: 'Watchlist', bg: '#e0f2fe', text: '#0369a1', border: '#0891b255' },
  onhold: { label: 'On Hold', bg: '#fef3c7', text: '#b45309', border: '#d9770655' },
  dropped: { label: 'Dropped', bg: '#fee2e2', text: '#b91c1c', border: '#dc262655' },
}

const config = computed(() => STATUS_CONFIG[props.status])
</script>
