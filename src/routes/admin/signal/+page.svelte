<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Supabase Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Derived variables for clean access
  let subscriptionsList = $derived(
    Array.isArray(data?.subscription) ? data.subscription : []
  );
  let subscriptionsCount = $derived(subscriptionsList.length);

  // Dialog & Modal State Management
  let isAddOpen = $state(false);
  let isEditOpen = $state(false);
  let isDeleteOpen = $state(false);
  let selectedPlan = $state(null);

  // Status & Error Flags
  let isLoading = $state(false);
  let errorMessage = $state('');

  // Form State for Add / Edit Modals
  let planForm = $state({
    title: '',
    desc: '',
    price: ''
  });

  function openAddModal() {
    planForm = {
      title: '',
      desc: '',
      price: ''
    };
    errorMessage = '';
    isAddOpen = true;
  }

  function openEditModal(plan) {
    selectedPlan = plan;
    planForm = {
      title: plan.title || '',
      desc: plan.desc || '',
      price: plan.price ?? ''
    };
    errorMessage = '';
    isEditOpen = true;
  }

  function openDeleteModal(plan) {
    selectedPlan = plan;
    errorMessage = '';
    isDeleteOpen = true;
  }

  function closeModals() {
    isAddOpen = false;
    isEditOpen = false;
    isDeleteOpen = false;
    selectedPlan = null;
    errorMessage = '';
    isLoading = false;
  }

  // --- SUPABASE ADD PACKAGE LOGIC ---
  async function handleAddPackage() {
    if (!supabase) return;

    if (!planForm.title.trim()) {
      errorMessage = 'Please provide a package title.';
      return;
    }

    if (planForm.price === '' || isNaN(Number(planForm.price))) {
      errorMessage = 'Please enter a valid price.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('subscription')
      .insert([
        {
          title: planForm.title.trim(),
          desc: planForm.desc.trim(),
          price: Number(planForm.price)
        }
      ]);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }

  // --- SUPABASE UPDATE PACKAGE LOGIC ---
  async function handleUpdatePackage() {
    if (!selectedPlan?.id || !supabase) return;

    if (!planForm.title.trim()) {
      errorMessage = 'Please provide a package title.';
      return;
    }

    if (planForm.price === '' || isNaN(Number(planForm.price))) {
      errorMessage = 'Please enter a valid price.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('subscription')
      .update({
        title: planForm.title.trim(),
        desc: planForm.desc.trim(),
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

  // --- SUPABASE DELETE PACKAGE LOGIC ---
  async function handleDeletePackage() {
    if (!selectedPlan?.id || !supabase) return;

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('subscription')
      .delete()
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
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">Manage Signal Packages</h2>
      <p class="text-sm text-zinc-400">Create, update, or remove signal subscription packages for users.</p>
    </div>
    <!-- Quick Action Button -->
    <div class="flex items-center gap-3">
      <button 
        onclick={openAddModal}
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Signal Package
      </button>
    </div>
  </div>

  <!-- Available Packages Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-white">Active Packages ({subscriptionsCount})</h3>
        <p class="text-xs text-zinc-400 mt-0.5">Live tiers currently available for user subscription.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#if subscriptionsList.length > 0}
        {#each subscriptionsList as plan}
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
                    <span class="inline-block text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Signal Tier</span>
                  </div>
                </div>
              </div>

              <p class="text-xs text-zinc-400 leading-relaxed min-h-[36px] line-clamp-2">
                {plan.desc || 'No description provided for this signal package.'}
              </p>

              <div class="pt-2">
                <span class="text-2xl font-mono font-bold text-white tracking-tight">${plan.price}</span>
                <span class="text-xs text-zinc-500 font-medium"> / subscription</span>
              </div>
            </div>

            <!-- Admin Actions Row -->
            <div class="pt-5 mt-5 border-t border-zinc-800/80 flex items-center gap-2">
              <button 
                onclick={() => openEditModal(plan)}
                class="flex-1 text-xs font-medium px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-all focus:ring-2 focus:ring-zinc-600/40 flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-zinc-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Edit
              </button>
              <button 
                onclick={() => openDeleteModal(plan)}
                class="flex-1 text-xs font-medium px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all focus:ring-2 focus:ring-rose-500/40 flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-rose-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        {/each}
      {:else}
        <div class="col-span-full p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm space-y-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mx-auto text-zinc-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5m-16.5 0l1.58-3.161A1.5 1.5 0 016.17 3.5h11.66a1.5 1.5 0 011.34.839l1.58 3.161" />
          </svg>
          <p>No signal packages configured yet. Click "Add Signal Package" above to create one.</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- ADD PACKAGE MODAL -->
{#if isAddOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 class="text-lg font-bold text-white">Add New Signal Package</h3>
        <button onclick={closeModals} class="text-zinc-400 hover:text-white text-sm p-1 rounded-md hover:bg-zinc-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1.5" for="plan-title-add">Package Title *</label>
          <input 
            id="plan-title-add"
            type="text" 
            placeholder="e.g. Gold Tier"
            bind:value={planForm.title} 
            disabled={isLoading}
            class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1.5" for="plan-price-add">Price ($) *</label>
          <input 
            id="plan-price-add"
            type="number" 
            placeholder="3500"
            bind:value={planForm.price} 
            disabled={isLoading}
            class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1.5" for="plan-desc-add">Description</label>
          <textarea 
            id="plan-desc-add"
            rows="3"
            placeholder="High-confidence signals backed by strong market confluence..."
            bind:value={planForm.desc} 
            disabled={isLoading}
            class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50 resize-none"
          ></textarea>
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
          onclick={handleAddPackage} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Adding...</span>
          {:else}
            <span>Create Package</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- EDIT PACKAGE MODAL -->
{#if isEditOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 class="text-lg font-bold text-white">Edit Signal Package</h3>
        <button onclick={closeModals} class="text-zinc-400 hover:text-white text-sm p-1 rounded-md hover:bg-zinc-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1.5" for="plan-title-edit">Package Title *</label>
          <input 
            id="plan-title-edit"
            type="text" 
            placeholder="e.g. Gold Tier"
            bind:value={planForm.title} 
            disabled={isLoading}
            class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>

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

        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1.5" for="plan-desc-edit">Description</label>
          <textarea 
            id="plan-desc-edit"
            rows="3"
            placeholder="High-confidence signals backed by strong market confluence..."
            bind:value={planForm.desc} 
            disabled={isLoading}
            class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50 resize-none"
          ></textarea>
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
          onclick={handleUpdatePackage} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Updating...</span>
          {:else}
            <span>Update Package</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- DELETE CONFIRMATION MODAL -->
{#if isDeleteOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-rose-400">
        <div class="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0l-10.998 19.24c-.865 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Delete Package</h3>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <p class="text-xs text-zinc-400 leading-relaxed">
        Are you sure you want to delete the <span class="text-zinc-200 font-mono font-semibold">{selectedPlan?.title ?? 'selected'}</span> signal package? Users will no longer be able to select or purchase it.
      </p>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleDeletePackage} 
          disabled={isLoading}
          class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-rose-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Deleting...</span>
          {:else}
            <span>Delete Package</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
