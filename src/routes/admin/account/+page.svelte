<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Supabase Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Derived variables for clean access
  let accountPlansList = $derived(
    Array.isArray(data?.account_plan) ? data.account_plan : []
  );
  let accountPlansCount = $derived(accountPlansList.length);

  // Dialog & Modal State Management
  let isEditOpen = $state(false);
  let selectedPlan = $state(null);

  // Status & Error Flags
  let isLoading = $state(false);
  let errorMessage = $state('');

  // Form State for Price Editing
  let planForm = $state({
    price: ''
  });

  function openEditModal(plan) {
    selectedPlan = plan;
    planForm = {
      price: plan.price ?? ''
    };
    errorMessage = '';
    isEditOpen = true;
  }

  function closeModals() {
    isEditOpen = false;
    selectedPlan = null;
    errorMessage = '';
    isLoading = false;
  }

  // --- SUPABASE UPDATE ACCOUNT PLAN PRICE LOGIC ---
  async function handleUpdatePlan() {
    if (!selectedPlan?.id || !supabase) return;

    if (planForm.price === '' || isNaN(Number(planForm.price))) {
      errorMessage = 'Please enter a valid price.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('account_plan')
      .update({
        price: Number(planForm.price)
      })
      .eq('id', selectedPlan.id);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }
</script>

<div class="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-100">
  <!-- Top Navigation / Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800/60">
    <div class="space-y-1">
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">Manage Account Plans</h2>
      <p class="text-sm text-zinc-400">Update pricing for available account plans.</p>
    </div>
  </div>

  <!-- Available Account Plans Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-white">Active Plans ({accountPlansCount})</h3>
        <p class="text-xs text-zinc-400 mt-0.5">Account tiers currently available for users.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#if accountPlansList.length > 0}
        {#each accountPlansList as plan}
          <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-zinc-700 transition-all group">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold text-white tracking-tight">{plan.title}</h4>
                    <span class="inline-block text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Account Tier</span>
                  </div>
                </div>
              </div>

              <p class="text-xs text-zinc-400 leading-relaxed min-h-[36px] line-clamp-2">
                {plan.desc || 'No description provided for this plan.'}
              </p>

              <div class="pt-2">
                <span class="text-2xl font-mono font-bold text-white tracking-tight">${plan.price}</span>
                <span class="text-xs text-zinc-500 font-medium"> / plan</span>
              </div>
            </div>

            <!-- Admin Actions Row -->
            <div class="pt-5 mt-5 border-t border-zinc-800/80 flex items-center">
              <button 
                onclick={() => openEditModal(plan)}
                class="w-full text-xs font-medium px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl border border-zinc-700 transition-all focus:ring-2 focus:ring-zinc-600/40 flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-zinc-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Edit Price
              </button>
            </div>
          </div>
        {/each}
      {:else}
        <div class="col-span-full p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm space-y-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mx-auto text-zinc-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5m-16.5 0l1.58-3.161A1.5 1.5 0 016.17 3.5h11.66a1.5 1.5 0 011.34.839l1.58 3.161" />
          </svg>
          <p>No account plans available.</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- EDIT PLAN PRICE MODAL -->
{#if isEditOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h3 class="text-lg font-bold text-white">Edit Plan Price</h3>
          <p class="text-xs text-zinc-400 mt-0.5">{selectedPlan?.title ?? 'Account Plan'}</p>
        </div>
        <button onclick={closeModals} class="text-zinc-400 hover:text-white text-sm p-1 rounded-md hover:bg-zinc-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1.5" for="plan-price-edit">Price ($) *</label>
          <input 
            id="plan-price-edit"
            type="number" 
            placeholder="3500"
            bind:value={planForm.price} 
            disabled={isLoading}
            class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleUpdatePlan} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Updating...</span>
          {:else}
            <span>Update Price</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
