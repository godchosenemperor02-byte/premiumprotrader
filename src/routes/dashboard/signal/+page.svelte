<script>
  import { invalidateAll } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

  // Svelte 5 Runes Props & Safe Derived Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Subscription Action Feedback State
  let subscribeLoading = $state('');
  let subscribeError = $state('');
  let subscribeSuccess = $state('');

  // --- SUBSCRIBE TO SIGNAL PACKAGE LOGIC ---
  async function handleSubscribeSignal(plan) {
    if (!supabase) return;

    subscribeError = '';
    subscribeSuccess = '';
    subscribeLoading = plan.title;

    const profile = data?.profile;
    const currentCapital = Number(profile?.capital ?? 0);
    const planPrice = Number(plan.price);

    // 1. Validate sufficient funds
    if (currentCapital < planPrice) {
      subscribeError = `Insufficient funds. You need ${profile?.currency || '$'}${planPrice.toLocaleString()} to subscribe to the ${plan.title} signal package, but your available balance is ${profile?.currency || '$'}${currentCapital.toLocaleString()}.`;
      subscribeLoading = '';
      return;
    }

    // 2. Perform the database update
    const newCapital = currentCapital - planPrice;

    const { error } = await supabase
      .from('profiles')
      .update({
        capital: newCapital,
        subscription: plan.title
      })
      .eq('id', profile.id);

    subscribeLoading = '';

    if (error) {
      subscribeError = error.message;
      return;
    }

    subscribeSuccess = `Successfully subscribed to the ${plan.title} signal package!`;
    await invalidateAll();
  }
</script>

<!-- Header & Balance Summary -->
<div class="flex flex-1 flex-col md:flex-row md:justify-between mb-4">
  <section class="">
    <h2 class="text-2xl font-serif font-bold py-2 italic">Live Signal Packages</h2>
    <h5 class="text-sm text-gray-400 italic">Subscribe to professional trading signals</h5>
  </section>

  <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-[10px] font-bold uppercase tracking-wider text-[#8e90a0]">Available Capital</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">
        {data.profile?.currency || '$'} {Number(data.profile?.capital ?? 0).toLocaleString()}
      </div>
      <p class="text-xs mt-1 font-medium text-green-500">
        <span class="text-[#444654] font-normal">from last session</span>
      </p>
    </CardContent>
  </Card>
</div>

<!-- Alert Banners for Success/Error feedback -->
{#if subscribeError}
  <div class="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
    {subscribeError}
  </div>
{/if}

{#if subscribeSuccess}
  <div class="mb-4 p-3 rounded-md bg-green-500/20 border border-green-500/50 text-green-200 text-sm">
    {subscribeSuccess}
  </div>
{/if}

<h2 class="text-xl my-3 font-bold text-gray-300">Available Packages</h2>

<!-- Grid List of Packages -->
<div class="grid md:grid-cols-3 gap-4">
  {#each data?.subscription ?? [] as plan}
    {@const isSubscribed = plan.title?.trim() === data.profile?.subscription?.trim()}
    {@const isLoading = subscribeLoading === plan.title}
    {@const planPrice = Number(plan.price ?? 0)}
<Card class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5">
  
  <!-- Subtle Hover Ambient Glow -->
  <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl transition-all duration-300 group-hover:bg-amber-500/20"></div>

  <!-- Card Header -->
  <CardHeader class="p-0 space-y-4">
    <div class="flex items-center justify-between">
      <!-- Icon Container -->
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
      </div>

      <!-- Access Badge -->
      <span class="inline-flex items-center rounded-full bg-gray-800/80 px-3 py-1 text-xs font-semibold text-gray-300 border border-gray-700/60">
        {plan.access} Days Access
      </span>
    </div>

    <!-- Title & Description -->
    <div>
      <CardTitle class="text-xl font-bold tracking-tight text-white">{plan.title}</CardTitle>
      {#if plan.desc}
        <p class="mt-1.5 text-sm leading-relaxed text-gray-400">{plan.desc}</p>
      {/if}
    </div>
  </CardHeader>

  <!-- Card Content -->
  <CardContent class="p-0 mt-6 flex flex-col justify-between flex-1">
    <!-- Price Section -->
    <div class="mb-6 flex items-baseline gap-1">
      <span class="text-3xl font-extrabold tracking-tight text-white">
        {data.profile?.currency || '$'}{planPrice.toLocaleString()}
      </span>
      <span class="text-xs font-medium text-gray-400">/ plan</span>
    </div>

    <!-- Action Button -->
    <div class="mt-auto">
      {#if isSubscribed}
        <button 
          disabled 
          class="w-full rounded-xl bg-gray-800/80 px-4 py-3 text-sm font-semibold text-gray-400 border border-gray-700/50 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Active Plan
        </button>
      {:else}
        <button 
          onclick={() => handleSubscribeSignal(plan)}
          disabled={isLoading || !!subscribeLoading}
          class="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-gray-950 shadow-md transition-all duration-200 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-400 disabled:active:scale-100"
        >
          {#if isLoading || !!subscribeLoading}
            <span class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin text-gray-950" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          {:else}
            Subscribe Now
          {/if}
        </button>
      {/if}
    </div>
  </CardContent>
</Card>
  {/each}
</div>
