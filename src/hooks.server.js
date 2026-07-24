import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { redirect } from '@sveltejs/kit' // Import redirect from SvelteKit

export const handle = async ({ event, resolve }) => {
  // 1. Initialize the Supabase client
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
  })

  // Safe user helper
  event.locals.getSession = async () => {
    const { data: { user }, error } = await event.locals.supabase.auth.getUser()
    if (error) return null

    const { data: { session } } = await event.locals.supabase.auth.getSession()
    return session
  }

  // 2. ROUTE GUARDING BLOCK
  const session = await event.locals.getSession()

  // Protect private routes (e.g., anything starting with /dashboard or /profile)
  if (event.url.pathname.startsWith('/dashboard') || event.url.pathname.startsWith('/admin')) {
    if (!session) {
      // No session found? Throw a 303 redirect to the login page
      throw redirect(303, '/login')
    }
  }

  // Prevent logged-in users from seeing auth pages (e.g., /login or /register)
  if (event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/register')) {
    if (session) {
      // User is logged in? Send them away to the dashboard
      throw redirect(303, '/dashboard')
    }
  }

  // 3. Resolve the request and pass along correct headers
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}