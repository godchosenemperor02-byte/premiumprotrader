<script>
  import './layout.css';
  import favicon from '$lib/assets/favicon.jpg';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let { children, data } = $props();

  // Access supabase and session passed from +layout.js
  let supabase = $derived(data?.supabase);
  let session = $derived(data?.session);

  // SEO Defaults
  const siteName = 'Premiumprotrader';
  const defaultTitle = 'Trading Platform | Secure Asset & Forex Trading';
  const defaultDescription = 'Trade Forex, Crypto, and global assets securely with real-time analysis and low latency execution.';
  
  // Use production domain for rock-solid OG previews across crawlers
  const siteOrigin = 'https://www.premiumprotrader.com';
  
  let currentUrl = $derived($page.url.href || siteOrigin);
  let ogImageUrl = `${siteOrigin}/gj.jpg`; 

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
  <!-- Basic Metadata -->
  <title>{defaultTitle}</title>
  <meta name="description" content={defaultDescription} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={currentUrl} />

  <!-- Favicon -->
  <link rel="icon" href={favicon} />

  <!-- Open Graph / WhatsApp / Facebook / Instagram / LinkedIn -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={defaultTitle} />
  <meta property="og:description" content={defaultDescription} />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:secure_url" content={ogImageUrl} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={defaultTitle} />
  <meta name="twitter:description" content={defaultDescription} />
  <meta name="twitter:image" content={ogImageUrl} />
</svelte:head>

{@render children()}
