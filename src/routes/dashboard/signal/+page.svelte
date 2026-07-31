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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-[#444654]">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
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

    <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm flex flex-col justify-between">
      <CardHeader>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
        <CardTitle class="text-2xl text-gray-200 font-light font-mono mt-2">{plan.title}</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col justify-between flex-1">
        <div>
          <p class="text-sm text-gray-400">{plan.desc}</p>
          <p class="text-2xl text-gray-200 font-bold mt-2">
            {data.profile?.currency || '$'} {planPrice.toLocaleString()}
          </p>
        </div>

        <div class="mt-4">
          {#if isSubscribed}
            <button 
              disabled 
              class="bg-amber-300 w-full p-1.5 rounded-md text-center text-lg font-bold text-black opacity-50 cursor-not-allowed"
            >
              Subscribed
            </button>
          {:else}
            <button 
              onclick={() => handleSubscribeSignal(plan)}
              disabled={isLoading || !!subscribeLoading}
              class="bg-amber-300 w-full p-1.5 rounded-md text-center text-lg font-bold text-black hover:bg-amber-400 ease-in-out transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          {/if}
        </div>
      </CardContent>
    </Card>
  {/each}
</div>
