<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Supabase Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

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

<div class="space-y-8 max-w-6xl mx-auto">
  <!-- Top Navigation / Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
    <div>
      <h2 class="text-3xl font-extrabold tracking-tight text-white">Manage Signal Packages</h2>
      <p class="text-sm text-gray-400 mt-1">Create, update, or remove signal subscription packages for users.</p>
    </div>
    <!-- Quick Action Button -->
    <div class="flex items-center gap-3">
      <button 
        onclick={openAddModal}
        class="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 rounded-xl text-sm font-bold shadow-md shadow-amber-950/30 transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Signal Package
      </button>
    </div>
  </div>

  <!-- Available Packages Section -->
  <div>
    <h3 class="text-xl font-bold text-gray-300 mb-4">Active Packages ({data?.subscription?.length ?? 0})</h3>
    
    <div class="grid md:grid-cols-3 gap-4">
      {#if Array.isArray(data?.subscription) && data.subscription.length > 0}
        {#each data.subscription as plan}
          <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm relative flex flex-col justify-between">
            <div>
              <CardHeader class="flex flex-row items-center justify-between space-y-0">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                  <CardTitle class="text-2xl text-gray-200 font-light font-mono">{plan.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-gray-400 min-h-[40px]">{plan.desc}</p>
                <p class="text-2xl text-gray-200 font-bold mt-3 font-mono">$ {plan.price}</p>
              </CardContent>
            </div>

            <!-- Admin Actions Row -->
            <div class="p-6 pt-0 mt-2 border-t border-gray-800/60 flex items-center justify-end gap-2 pt-4">
              <button 
                onclick={() => openEditModal(plan)}
                class="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Edit
              </button>
              <button 
                onclick={() => openDeleteModal(plan)}
                class="flex-1 py-2 px-3 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete
              </button>
            </div>
          </Card>
        {/each}
      {:else}
        <div class="col-span-full p-8 text-center bg-[#111827]/30 border border-gray-800 rounded-2xl text-gray-500 text-sm">
          No signal packages configured yet. Click "Add Signal Package" above to create one.
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- ADD PACKAGE MODAL -->
{#if isAddOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 class="text-lg font-bold text-white">Add New Signal Package</h3>
        <button onclick={closeModals} class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="plan-title-add">Package Title *</label>
          <input 
            id="plan-title-add"
            type="text" 
            placeholder="e.g. Gold"
            bind:value={planForm.title} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="plan-price-add">Price ($) *</label>
          <input 
            id="plan-price-add"
            type="number" 
            placeholder="3500"
            bind:value={planForm.price} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="plan-desc-add">Description</label>
          <textarea 
            id="plan-desc-add"
            rows="3"
            placeholder="High-confidence signals backed by strong market confluence..."
            bind:value={planForm.desc} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400 disabled:opacity-50 resize-none"
          ></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleAddPackage} 
          disabled={isLoading}
          class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-950/30 disabled:opacity-50 flex items-center gap-2"
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 class="text-lg font-bold text-white">Edit Signal Package</h3>
        <button onclick={closeModals} class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="plan-title-edit">Package Title *</label>
          <input 
            id="plan-title-edit"
            type="text" 
            placeholder="e.g. Gold"
            bind:value={planForm.title} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="plan-price-edit">Price ($) *</label>
          <input 
            id="plan-price-edit"
            type="number" 
            placeholder="3500"
            bind:value={planForm.price} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="plan-desc-edit">Description</label>
          <textarea 
            id="plan-desc-edit"
            rows="3"
            placeholder="High-confidence signals backed by strong market confluence..."
            bind:value={planForm.desc} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400 disabled:opacity-50 resize-none"
          ></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleUpdatePackage} 
          disabled={isLoading}
          class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-950/30 disabled:opacity-50 flex items-center gap-2"
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-red-400">
        <div class="p-2 bg-red-950/80 border border-red-900/50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Delete Package</h3>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <p class="text-xs text-gray-400 leading-relaxed">
        Are you sure you want to delete the <span class="text-gray-200 font-semibold">{selectedPlan?.title ?? 'selected'}</span> signal package? Users will no longer be able to select or purchase it.
      </p>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleDeletePackage} 
          disabled={isLoading}
          class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-950/50 disabled:opacity-50 flex items-center gap-2"
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