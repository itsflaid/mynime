<template>
  <header class="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
    <nav class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="mr-2 text-xl font-extrabold tracking-[-0.04em] text-pink-500">
        MyNime
      </RouterLink>

      <div class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          active-class="!bg-pink-50 !text-pink-600"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <div class="flex-1" />

      <label class="hidden w-52 items-center gap-2 rounded-xl border border-transparent bg-zinc-100 px-3.5 py-2 transition-colors focus-within:border-pink-200 focus-within:bg-white lg:flex">
        <Search :size="16" :stroke-width="1.7" class="flex-shrink-0 text-zinc-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search library..."
          class="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
        />
      </label>

      <button
        type="button"
        class="hidden items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-pink-200 transition-colors hover:bg-pink-600 sm:flex"
        @click="emit('add')"
      >
        <Plus :size="16" :stroke-width="2" />
        <span class="hidden lg:inline">Add Anime</span>
        <span class="lg:hidden">Add</span>
      </button>

      <div class="relative hidden md:block">
        <button
          type="button"
          :aria-expanded="accountOpen"
          class="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-2 text-zinc-500 transition-colors hover:border-pink-200 hover:text-pink-600"
          @click="accountOpen = !accountOpen"
        >
          <img
            v-if="auth.avatarUrl"
            :src="auth.avatarUrl"
            :alt="auth.displayName"
            referrerpolicy="no-referrer"
            class="h-8 w-8 rounded-full object-cover"
          />
          <span v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            <UserRound :size="17" :stroke-width="1.7" />
          </span>
          <ChevronDown :size="14" :stroke-width="1.8" :class="{ 'rotate-180': accountOpen }" class="transition-transform" />
        </button>

        <div v-if="accountOpen" class="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-200/50">
          <div class="border-b border-zinc-100 px-3 py-3">
            <p class="truncate text-sm font-bold text-zinc-900">{{ auth.displayName }}</p>
            <p class="mt-0.5 truncate text-xs text-zinc-400">{{ auth.user?.email }}</p>
          </div>
          <button
            type="button"
            :disabled="auth.loading"
            class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            @click="logout"
          >
            <LogOut :size="16" :stroke-width="1.8" />
            Keluar
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Tambah anime"
        class="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500 text-white transition-colors hover:bg-pink-600 sm:hidden"
        @click="emit('add')"
      >
        <Plus :size="17" :stroke-width="2" />
      </button>

      <button
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Buka menu navigasi"
        class="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 md:hidden"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="18" :stroke-width="1.8" />
        <Menu v-else :size="18" :stroke-width="1.8" />
      </button>
    </nav>

    <div v-if="menuOpen" class="border-t border-zinc-100 bg-white px-4 py-4 shadow-lg md:hidden">
      <div class="mx-auto flex max-w-7xl flex-col gap-3">
        <label class="flex items-center gap-2 rounded-xl bg-zinc-100 px-3.5 py-2.5">
          <Search :size="16" :stroke-width="1.7" class="text-zinc-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Search library..."
            class="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
          />
        </label>

        <div class="grid grid-cols-2 gap-2">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-xl border border-zinc-200 px-4 py-3 text-center text-sm font-bold text-zinc-500 transition-colors hover:border-pink-200 hover:text-pink-600"
            active-class="!border-pink-200 !bg-pink-50 !text-pink-600"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <div class="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
          <img
            v-if="auth.avatarUrl"
            :src="auth.avatarUrl"
            :alt="auth.displayName"
            referrerpolicy="no-referrer"
            class="h-10 w-10 rounded-full object-cover"
          />
          <span v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            <UserRound :size="18" :stroke-width="1.7" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-zinc-900">{{ auth.displayName }}</p>
            <p class="truncate text-xs text-zinc-400">{{ auth.user?.email }}</p>
          </div>
          <button
            type="button"
            aria-label="Keluar"
            :disabled="auth.loading"
            class="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            @click="logout"
          >
            <LogOut :size="17" :stroke-width="1.8" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ChevronDown, LogOut, Menu, Plus, Search, UserRound, X } from '@lucide/vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnimeStore } from '../../stores/anime'
import { useAuthStore } from '../../stores/auth'

const emit = defineEmits<{ add: [] }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const animeStore = useAnimeStore()
const menuOpen = ref(false)
const accountOpen = ref(false)
const search = ref('')
const links = [
  { to: '/', label: 'Home' },
  { to: '/list', label: 'List' },
]

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    accountOpen.value = false
  },
)

async function logout() {
  const { error } = await auth.logout()
  if (error) return

  animeStore.clear()
  menuOpen.value = false
  accountOpen.value = false
  router.replace('/login')
}
</script>
