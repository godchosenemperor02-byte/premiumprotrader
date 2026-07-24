export const load = async ({ locals, depends }) => {
  // Tells SvelteKit to re-run this load function when invalidate('supabase:auth') is called
  depends('supabase:auth')

  const session = await locals.getSession()

  return {
    session,
  }
}