import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { signInWithGoogle, signOut as signOutService } from '../service/auth.services'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const initialized = ref(false)
  let authSubscription: (() => void) | null = null

  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => Boolean(user.value))
  const displayName = computed(() =>
    user.value?.user_metadata?.full_name
    || user.value?.user_metadata?.name
    || user.value?.email
    || 'MyNime User',
  )
  const avatarUrl = computed<string | null>(() =>
    user.value?.user_metadata?.avatar_url
    || user.value?.user_metadata?.picture
    || null,
  )

  async function claimLegacyAnime() {
    const { error } = await supabase.rpc('claim_legacy_anime')
    if (error && error.code !== 'PGRST202') {
      console.warn('Legacy anime claim skipped:', error.message)
    }
  }

  async function initialize() {
    if (initialized.value) return

    loading.value = true
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    if (session.value) await claimLegacyAnime()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      session.value = nextSession
      loading.value = false
      if (event === 'SIGNED_IN' && nextSession) {
        window.setTimeout(claimLegacyAnime, 0)
      }
    })

    authSubscription = () => listener.subscription.unsubscribe()
    initialized.value = true
    loading.value = false
  }

  async function loginWithGoogle(redirectPath = '/') {
    loading.value = true
    const result = await signInWithGoogle(redirectPath)
    if (result.error) loading.value = false
    return result
  }

  async function logout() {
    loading.value = true
    const result = await signOutService()
    if (!result.error) session.value = null
    loading.value = false
    return result
  }

  function dispose() {
    authSubscription?.()
    authSubscription = null
  }

  return {
    session,
    user,
    loading,
    initialized,
    isAuthenticated,
    displayName,
    avatarUrl,
    initialize,
    loginWithGoogle,
    logout,
    dispose,
  }
})
