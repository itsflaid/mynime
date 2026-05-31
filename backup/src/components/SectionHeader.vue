<template>
  <div>
    <h2 class="text-2xl font-bold text-zinc-900 font-jakarta">{{ title }}</h2>
    <p v-if="desc" class="text-sm text-zinc-400 font-jakarta mt-1">{{ desc }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; desc?: string }>()
</script>