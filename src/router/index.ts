import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ListPage from '../pages/ListPage.vue'
import DetailPage from '../pages/DetailPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import AuthCallbackPage from '../pages/AuthCallbackPage.vue'
import { pinia } from '../lib/pinia'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage, meta: { requiresAuth: true } },
    { path: '/list', component: ListPage, meta: { requiresAuth: true } },
    { path: '/anime/:id', component: DetailPage, meta: { requiresAuth: true } },
    { path: '/login', component: LoginPage, meta: { guestOnly: true } },
    { path: '/auth/callback', component: AuthCallbackPage },
  ],
})

router.beforeEach(async to => {
  if (to.path === '/auth/callback') return true

  const auth = useAuthStore(pinia)
  await auth.initialize()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) return '/'
  return true
})

export default router