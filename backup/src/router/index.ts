import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ListPage from '../pages/ListPage.vue'
import DetailPage from '../pages/DetailPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/list', component: ListPage },
    { path: '/anime/:id', component: DetailPage },
  ],
})

export default router