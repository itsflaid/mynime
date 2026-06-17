<template>
  <main class="flex min-h-screen items-center justify-center bg-[#f9f9fb] px-5">
    <div class="text-center">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      <h1 class="mt-5 text-xl font-extrabold text-zinc-900">Menyiapkan archive kamu</h1>
      <p class="mt-2 text-sm text-zinc-400">Menyelesaikan login Google...</p>
      <p v-if="errorMessage" class="mt-4 text-sm font-semibold text-red-600">{{ errorMessage }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { consumeAuthRedirect } from '../service/auth.services'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const errorMessage = ref('')

onMounted(async () => {
  await auth.initialize()

  if (!auth.isAuthenticated) {
    errorMessage.value = 'Session Google tidak ditemukan. Silakan login kembali.'
    window.setTimeout(() => router.replace('/login'), 1500)
    return
  }

  router.replace(consumeAuthRedirect())
})
</script>
