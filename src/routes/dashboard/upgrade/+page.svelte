<script>
  import { invalidateAll } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

  // Svelte 5 Runes Props & Safe Derived Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Raw numeric values for calculations & clean UI string formatting
  const account_types = [
    { title: 'Newbie', price: 0, perks: ['Account Registration', 'Basic Dashboard', 'Market Updates', 'Standard Support'], logo: '🆓' },
    { title: 'Bronze', price: 1000, perks: ['Basic AI Signals', 'Market Analysis', 'Standard Support', 'Monthly Reports'], logo: '🥉' },
    { title: 'Silver', price: 4000, perks: ['All Bronze Features', 'Priority Support', 'Advanced Signals', 'Lower Fees', 'Profit Optimization'], logo: '🥈' },
    { title: 'Gold', price: 8000, perks: ['All Silver Features', 'VIP Trade Alerts', 'Market Insights', 'Faster Withdrawals', 'Account Manager'], logo: '🥇', popular: true },
    { title: 'Platinum', price: 15000, perks: ['All Gold Features', 'Personalized Strategy', '24/7 VIP Support', 'Exclusive Opportunities', 'Portfolio Diversification'], logo: '👑' },
    { title: 'Diamond', price: 25000, perks: ['All Platinum Features', 'Custom AI Trading', 'Private Investment Access', 'Wealth Planning', 'Concierge Management'], logo: '💎' }
  ];

  // Subscription Action Feedback State
  let subscribeLoading = $state('');
  let subscribeError = $state('');
  let subscribeSuccess = $state('');

  // --- SUBSCRIBE ACTION LOGIC ---
  async function handleSubscribe(plan) {
    if (!supabase) return;

    subscribeError = '';
    subscribeSuccess = '';
    subscribeLoading = plan.title;

    const profile = data?.profile;
    const currentCapital = Number(profile?.capital ?? 0);
    const planPrice = Number(plan.price);

    // 1. Validate sufficient funds
    if (currentCapital < planPrice) {
      subscribeError = `Insufficient funds. You need ${profile?.currency || '$'}${planPrice.toLocaleString()} to subscribe to the ${plan.title} plan, but your current balance is ${profile?.currency || '$'}${currentCapital.toLocaleString()}.`;
      subscribeLoading = '';
      return;
    }

    // 2. Perform database update
    const newCapital = currentCapital - planPrice;

    const { error } = await supabase
      .from('profiles')
      .update({
        capital: newCapital,
        accountplan: plan.title
      })
      .eq('id', profile.id);

    subscribeLoading = '';

    if (error) {
      subscribeError = error.message;
      return;
    }

    subscribeSuccess = `Successfully upgraded to ${plan.title} plan!`;
    await invalidateAll();
  }
</script>

<div class="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100">
  
  <!-- Header & Capital Summary Section -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/60 pb-6">
    <div class="space-y-1">
      <h1 class="text-3xl font-extrabold tracking-tight text-white font-serif">Upgrade Account</h1>
      <p class="text-slate-400 text-sm max-w-xl">
        Browse through our curated tier plans and select the strategy that best accelerates your portfolio goals.
      </p>
    </div>

    <!-- Available Capital Badge Card -->
    <Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-sm min-w-[240px]">
      <CardHeader class="pb-2">
        <CardTitle class="text-xs font-bold uppercase tracking-wider text-slate-400">Available Capital</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-slate-100 font-mono tracking-tight">
          {data.profile?.currency || '$'} {Number(data.profile?.capital ?? 0).toLocaleString()}
        </div>
        <p class="text-[11px] mt-1 text-slate-500 font-medium">Available for instant upgrade</p>
      </CardContent>
    </Card>
  </div>

  <!-- Feedback Alert Banners -->
  {#if subscribeError}
    <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 backdrop-blur-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>{subscribeError}</div>
    </div>
  {/if}

  {#if subscribeSuccess}
    <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3 backdrop-blur-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>{subscribeSuccess}</div>
    </div>
  {/if}

  <!-- Plans Section Heading -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-slate-200 tracking-tight">Available Subscription Plans</h2>
  </div>

  <!-- Pricing Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.account_plan as plan}
      {@const isCurrentPlan = plan.title.toLowerCase() === data.profile?.accountplan?.trim().toLowerCase()}
      {@const isLoading = subscribeLoading === plan.title}

      <Card class={`relative bg-slate-900/60 border-slate-800/80 backdrop-blur-md flex flex-col justify-between transition-all duration-200 hover:border-slate-700/80 ${plan.popular ? 'ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/5' : ''}`}>
        
        {#if plan.popular}
          <div class="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-0.5 rounded-full shadow-sm">
            Most Popular
          </div>
        {/if}

        <CardHeader class="text-center border-b border-slate-800/40 pb-6 pt-6">
          <div class="text-5xl mb-3">{plan.logo}</div>
          <CardTitle class="text-xl font-bold text-slate-100 tracking-wide">{plan.title}</CardTitle>
          <div class="mt-3">
            <span class="text-3xl font-extrabold text-white font-mono tracking-tight">
              {plan.price === 0 ? 'Free' : `${data.profile?.currency || '$'}${plan.price.toLocaleString()}`}
            </span>
            {#if plan.price > 0}
              <span class="text-xs text-slate-400 ml-1">/ one-time</span>
            {/if}
          </div>
        </CardHeader>

        <CardContent class="flex flex-col justify-between flex-1 p-6 space-y-6">
          <!-- Perks List -->
          <ul class="space-y-3">
            {#each plan.perks as perk}
              <li class="flex items-start gap-3 text-sm text-slate-300">
                <span class="p-0.5 bg-emerald-500/10 text-emerald-400 rounded-full shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>{perk}</span>
              </li>
            {/each}
          </ul>

          <!-- Action Button -->
          <div class="pt-2">
            {#if isCurrentPlan}
              <button 
                disabled 
                class="w-full py-2.5 px-4 rounded-lg bg-slate-800 text-slate-400 text-sm font-bold border border-slate-700/50 cursor-not-allowed text-center flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Current Active Plan
              </button>
            {:else}
              <button 
                onclick={() => handleSubscribe(plan)}
                disabled={isLoading || !!subscribeLoading}
                class="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {#if isLoading}
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Upgrading Plan...</span>
                {:else}
                  <span>Subscribe to {plan.title}</span>
                {/if}
              </button>
            {/if}
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>
