import { supabase } from '../lib/supabase'

const REDIRECT_PATH_KEY = 'mynime_auth_redirect'

export async function signInWithGoogle(redirectPath = '/') {
  localStorage.setItem(REDIRECT_PATH_KEY, redirectPath)

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function consumeAuthRedirect() {
  const redirectPath = localStorage.getItem(REDIRECT_PATH_KEY) || '/'
  localStorage.removeItem(REDIRECT_PATH_KEY)
  return redirectPath.startsWith('/') ? redirectPath : '/'
}
