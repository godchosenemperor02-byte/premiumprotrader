<script>
  import { invalidateAll } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

  // Svelte 5 Runes Props & Safe Derived Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Raw numeric values for calculations & clean UI string formatting
  const account_types = [
    { title: 'Newbie', price: 0, perks: ['Account Registration', 'Basic Dashboard', 'Market Updates', 'Standard Support'], logo: '🆓' },
    { title: 'Bronze', price: 1000, perks: ['Basic Ai Signals', 'Market Analysis', 'Standard Support', 'Monthly Reports'], logo: '🥉' },
    { title: 'Silver', price: 4000, perks: ['All Bronze Features', 'Priority Support', 'Advanced Signals', 'Lower Fees', 'Profit Optimization'], logo: '🥈' },
    { title: 'Gold', price: 8000, perks: ['All Silver Features', 'VIP Trade Alerts', 'Market Insights', 'Faster Withdrawals', 'Account Manager'], logo: '🥇' },
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

    // 2. Perform the database update
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

<!-- Header & Capital Summary -->
<div class="flex flex-1 flex-col md:flex-row md:justify-between mb-4">
  <section class="">
    <h2 class="text-2xl font-serif font-bold py-2 italic">Upgrade Account</h2>
    <h5 class="text-sm text-gray-400 italic">Browse through our curated list of plans and pick the plan that aligns best with your goals</h5>
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

<h2 class="text-xl my-3 font-bold text-gray-300">Available Plans</h2>

<!-- Grid List of Plans -->
<div class="grid md:grid-cols-3 gap-4">
  {#each account_types as plan}
    {@const isCurrentPlan = plan.title === data.profile?.accountplan?.trim()}
    {@const isLoading = subscribeLoading === plan.title}

    <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm my-2.5 flex flex-col justify-between">
      <CardHeader>
        <h2 class="text-4xl text-center">{plan.logo}</h2>
        <CardTitle class="text-xl text-gray-200 font-light font-mono text-center mt-1.5">{plan.title}</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col justify-between flex-1">
        <div>
          <p class="text-2xl text-gray-200 font-bold text-center mb-1">
            {plan.price === 0 ? 'Free' : `${data.profile?.currency || '$'} ${plan.price.toLocaleString()}`}
          </p>

          {#each plan.perks as perk}
            <p class="text-gray-300 font-sans my-0.5 text-[15px]">
              <span class="text-green-300">✔</span> {perk}
            </p>
          {/each}
        </div>

        <div class="mt-4">
          {#if isCurrentPlan}
            <button 
              disabled 
              class="bg-gray-500 w-full p-1.5 rounded-md text-center text-[17px] font-bold cursor-not-allowed text-gray-300"
            >
              Current Plan
            </button>
          {:else}
            <button 
              onclick={() => handleSubscribe(plan)}
              disabled={isLoading || !!subscribeLoading}
              class="bg-amber-300 w-full p-1.5 rounded-md text-center text-[17px] font-bold text-black hover:bg-amber-400 ease-in-out transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Upgrading...' : 'Subscribe'}
            </button>
          {/if}
        </div>
      </CardContent>
    </Card>
  {/each}
</div>
