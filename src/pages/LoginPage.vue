<template>
  <main class="grid min-h-screen bg-[#f9f9fb] lg:grid-cols-[1.05fr_0.95fr]">
    <section class="hidden min-h-screen flex-col justify-between bg-zinc-950 p-12 text-white lg:flex">
      <RouterLink to="/login" class="text-2xl font-extrabold tracking-[-0.04em] text-pink-400">
        MyNime
      </RouterLink>

      <div class="max-w-xl">
        <div class="flex w-fit items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-pink-300">
          <Archive :size="14" :stroke-width="1.8" />
          Personal Anime Archive
        </div>
        <h1 class="mt-7 text-6xl font-extrabold leading-[1.02] tracking-[-0.045em]">
          Keep every story
          <span class="text-pink-400">close.</span>
        </h1>
        <p class="mt-6 max-w-lg text-base leading-8 text-zinc-400">
          Koleksi, rating, catatan, Top 10, dan histori rewatch kamu tersimpan dalam satu ruang pribadi.
        </p>
      </div>

      <p class="text-xs text-zinc-600">MyNime · Personal archive</p>
    </section>

    <section class="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <div class="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-xl shadow-zinc-200/40 sm:p-10">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 lg:hidden">
          <Archive :size="22" :stroke-width="1.8" />
        </div>
        <p class="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-pink-500 lg:mt-0">Welcome to MyNime</p>
        <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950">Masuk ke archive kamu</h2>
        <p class="mt-3 text-sm leading-6 text-zinc-500">
          Login pertama dengan Google otomatis membuat akun baru. Tidak perlu form register terpisah.
        </p>

        <button
          type="button"
          :disabled="auth.loading"
          class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-bold text-zinc-800 transition-all hover:border-pink-200 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
          @click="login"
        >
          <LogIn :size="18" :stroke-width="1.8" class="text-pink-500" />
          {{ auth.loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google' }}
        </button>

        <p v-if="errorMessage" role="alert" class="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <div class="mt-8 flex items-start gap-3 rounded-xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500">
          <ShieldCheck :size="17" :stroke-width="1.8" class="mt-0.5 flex-shrink-0 text-pink-500" />
          Data anime dipisahkan per akun dan dilindungi Row Level Security di Supabase.
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Archive, LogIn, ShieldCheck } from '@lucide/vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const errorMessage = ref('')

async function login() {
  errorMessage.value = ''
  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  const { error } = await auth.loginWithGoogle(redirectPath)
  if (error) errorMessage.value = error.message || 'Gagal masuk dengan Google.'
}
</script>
