<template>
  <div class="min-h-screen bg-[#f9f9fb]">
    <Navbar @add="showAdd = true" />
    <RouterView />
    <AddModal v-if="showAdd" @close="showAdd = false" @added="onAdded" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/Layout/Navbar.vue'
import AddModal from './components/AddModal.vue'

const showAdd = ref(false)
const router = useRouter()

function onAdded(id: string) {
  showAdd.value = false
  router.push(`/anime/${id}`)
}
</script>