import { json } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export async function GET() {
  const res = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
    }
  });

  return json({ ok: res.ok, status: res.status });
}
