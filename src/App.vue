<template>
  <div class="min-h-screen bg-[#f9f9fb]">
    <Navbar v-if="showAppChrome" @add="showAdd = true" />
    <RouterView />
    <AddModal v-if="showAdd && auth.isAuthenticated" @close="showAdd = false" @added="onAdded" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from './components/Layout/Navbar.vue'
import AddModal from './components/AddModal.vue'
import { useAuthStore } from './stores/auth'

const showAdd = ref(false)
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const showAppChrome = computed(() => auth.isAuthenticated && !route.meta.guestOnly && route.path !== '/auth/callback')

watch(
  () => auth.isAuthenticated,
  isAuthenticated => {
    if (!isAuthenticated) showAdd.value = false
  },
)

function onAdded(id: string) {
  showAdd.value = false
  router.push(`/anime/${id}`)
}
</script>
