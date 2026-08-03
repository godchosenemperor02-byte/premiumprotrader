<script>
  import './layout.css';
  import favicon from '$lib/assets/favicon.jpg';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';


  let { children, data } = $props();

  // Access supabase and session passed from +layout.js
  let supabase = $derived(data?.supabase);
  let session = $derived(data?.session);

  onMount(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => subscription.unsubscribe();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
