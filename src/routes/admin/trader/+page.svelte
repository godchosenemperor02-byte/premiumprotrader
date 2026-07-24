<script>
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Safe Derived Supabase Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Modal State Management
  let isAddOpen = $state(false);
  let isDeleteOpen = $state(false);
  let selectedExpert = $state(null);

  // Loading & Error States
  let isLoading = $state(false);
  let errorMessage = $state('');

  // Initial Form State for Adding Traders
  let traderForm = $state({
    name: '',
    description: '',
    monthly_returns: '+0.0%',
    winrate: '0%',
    followers: 0,
    trades: 0,
    copy_price: 0
  });

  function openAddModal() {
    traderForm = {
      name: '',
      description: '',
      monthly_returns: '+15.4%',
      winrate: '85%',
      followers: 120,
      trades: 45,
      copy_price: 50
    };
    errorMessage = '';
    isAddOpen = true;
  }

  function openDeleteModal(expert) {
    selectedExpert = expert;
    errorMessage = '';
    isDeleteOpen = true;
  }

  function closeModals() {
    isAddOpen = false;
    isDeleteOpen = false;
    selectedExpert = null;
    errorMessage = '';
    isLoading = false;
  }

  // --- SUPABASE ADD TRADER LOGIC ---
  async function handleAddTrader() {
    if (!supabase) return;

    if (!traderForm.name.trim()) {
      errorMessage = 'Please provide a trader name.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('experts')
      .insert([
        {
          name: traderForm.name.trim(),
          description: traderForm.description.trim(),
          monthly_returns: traderForm.monthly_returns.trim(),
          winrate: traderForm.winrate.trim(),
          followers: Number(traderForm.followers) || 0,
          trades: Number(traderForm.trades) || 0,
          copy_price: Number(traderForm.copy_price) || 0
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

  // --- SUPABASE DELETE TRADER LOGIC ---
  async function handleDeleteTrader() {
    if (!selectedExpert?.id || !supabase) return;

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('experts')
      .delete()
      .eq('id', selectedExpert.id);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }
</script>

<div class="space-y-8">
  <!-- Top Navigation / Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold tracking-tight text-white">Manage Traders</h2>
      <p class="text-sm text-gray-400 mt-1">Add, update, or remove expert traders listed on the user platform.</p>
    </div>
    <!-- Add Button -->
    <div class="flex items-center gap-3">
      <button 
        onclick={openAddModal}
        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white shadow-md shadow-blue-950/50 transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add New Trader
      </button>
    </div>
  </div>

  <!-- Experts Table -->
  <div class="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
    <table class="w-full text-left border-collapse text-sm">
      <thead>
        <tr class="bg-gray-900 border-b border-gray-800 text-gray-400 font-semibold text-xs tracking-wider uppercase">
          <th class="px-5 py-3.5">Trader</th>
          <th class="px-5 py-3.5">Monthly Return</th>
          <th class="px-5 py-3.5 hidden md:table-cell">Win Rate</th>
          <th class="px-5 py-3.5 hidden md:table-cell">Followers</th>
          <th class="px-5 py-3.5">Copy Price</th>
          <th class="px-5 py-3.5 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-800/60 text-gray-300 font-medium">
        {#if Array.isArray(data?.experts) && data.experts.length > 0}
          {#each data.experts as expert}
            <tr class="hover:bg-gray-850/40 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-800 border border-blue-500/30 overflow-hidden flex items-center justify-center text-gray-300 font-bold text-xs shrink-0">
                    <span>{(expert.name?.[0] ?? 'T').toUpperCase() + (expert.name?.at(-1) ?? '').toUpperCase()}</span>
                  </div>
                  <div>
                    <span class="block text-sm font-semibold text-white">{expert.name}</span>
                    <span class="block text-xs text-gray-400 max-w-xs truncate">{expert.desc}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 font-mono font-bold text-emerald-400 text-xs">
                {expert.monthly_returns}
              </td>
              <td class="px-5 py-4 font-mono font-bold text-blue-400 text-xs hidden md:table-cell">
                {expert.winrate}
              </td>
              <td class="px-5 py-4 text-xs text-gray-300 hidden md:table-cell">
                {expert.followers}
              </td>
              <td class="px-5 py-4 font-mono text-xs text-gray-200">
                ${expert.copy_price}
              </td>
              <td class="px-5 py-4 text-right">
                <button 
                  onclick={() => openDeleteModal(expert)}
                  class="text-xs font-semibold px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg transition-all"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td colspan="6" class="px-5 py-8 text-center text-gray-500 text-xs">
              No expert traders registered yet. Click "Add New Trader" to list one.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

<!-- ADD TRADER MODAL -->
{#if isAddOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 class="text-lg font-bold text-white">Add Expert Trader</h3>
        <button onclick={closeModals} class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="trader-name">Trader Name *</label>
          <input 
            id="trader-name"
            type="text" 
            placeholder="e.g. Sarah Jenkins"
            bind:value={traderForm.name} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="trader-desc">Description</label>
          <textarea 
            id="trader-desc"
            rows="2"
            placeholder="Specializing in swing trading major Forex pairs & BTC..."
            bind:value={traderForm.description} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="monthly-returns">Monthly Return</label>
            <input 
              id="monthly-returns"
              type="text" 
              placeholder="+24.5%"
              bind:value={traderForm.monthly_returns} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="winrate">Win Rate</label>
            <input 
              id="winrate"
              type="text" 
              placeholder="88%"
              bind:value={traderForm.winrate} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="followers">Followers</label>
            <input 
              id="followers"
              type="number" 
              bind:value={traderForm.followers} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="trades">Total Trades</label>
            <input 
              id="trades"
              type="number" 
              bind:value={traderForm.trades} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="copy-price">Copy Price ($)</label>
            <input 
              id="copy-price"
              type="number" 
              bind:value={traderForm.copy_price} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
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
          onclick={handleAddTrader} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-950/50 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Adding...</span>
          {:else}
            <span>Save Trader</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- DELETE TRADER MODAL -->
{#if isDeleteOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-red-400">
        <div class="p-2 bg-red-950/80 border border-red-900/50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Delete Trader</h3>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <p class="text-xs text-gray-400 leading-relaxed">
        Are you sure you want to remove <span class="text-gray-200 font-semibold">{selectedExpert?.name ?? 'this trader'}</span> from the platform? This will immediately remove them from the user dashboard.
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
          onclick={handleDeleteTrader} 
          disabled={isLoading}
          class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-950/50 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Deleting...</span>
          {:else}
            <span>Delete Trader</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}