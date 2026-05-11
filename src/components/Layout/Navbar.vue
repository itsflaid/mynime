<template>
  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 h-14 flex items-center px-8 gap-6">
    <!-- Logo -->
    <RouterLink to="/" class="font-bold text-xl text-pink-500 tracking-tight font-jakarta mr-2">
      MyNime
    </RouterLink>

    <!-- Nav links -->
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors pb-0.5 border-b-2 border-transparent"
      active-class="!text-zinc-900 !border-pink-500"
    >
      {{ link.label }}
    </RouterLink>

    <div class="flex-1" />

    <!-- Search -->
    <div class="flex items-center gap-2 bg-zinc-100 rounded-xl px-4 py-2 w-44">
      <span class="text-zinc-400 text-sm">🔍</span>
      <input
        v-model="search"
        placeholder="Search..."
        class="bg-transparent outline-none text-sm text-zinc-800 w-full font-jakarta placeholder:text-zinc-400"
      />
    </div>

    <!-- Add button -->
    <button
      @click="$emit('add')"
      class="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-pink-200 whitespace-nowrap font-jakarta"
    >
      + Add Anime
    </button>

    <!-- Avatar -->
    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 border border-zinc-200 flex items-center justify-center text-base">
      🧑
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{ add: [] }>()

const search = ref('')
const links = [
  { to: '/', label: 'Home' },
  { to: '/list', label: 'List' },
]
</script>