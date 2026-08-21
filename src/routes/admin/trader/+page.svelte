<script>
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Safe Derived Supabase Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Modal State Management
  let isAddOpen = $state(false);
  let isEditOpen = $state(false);
  let isDeleteOpen = $state(false);
  let selectedExpert = $state(null);

  // Loading & Error States
  let isLoading = $state(false);
  let errorMessage = $state('');

  // Form State
  let traderForm = $state({
    name: '',
    description: '',
    monthly_returns: '+0.0%',
    winrate: '0%',
    followers: 0,
    trades: 0,
    copy_price: 0,
    image: null,
    image_url: ''
  });

  // Safe Image Preview URL derived rune
  let imagePreviewUrl = $derived.by(() => {
    if (traderForm.image) {
      return URL.createObjectURL(traderForm.image);
    }
    return traderForm.image_url || null;
  });

  function openAddModal() {
    traderForm = {
      name: '',
      description: '',
      monthly_returns: '+15.4%',
      winrate: '85%',
      followers: 120,
      trades: 45,
      copy_price: 50,
      image: null,
      image_url: ''
    };
    errorMessage = '';
    isAddOpen = true;
  }

  function openEditModal(expert) {
    selectedExpert = expert;
    traderForm = {
      name: expert.name ?? '',
      description: expert.description ?? expert.desc ?? '',
      monthly_returns: expert.monthly_returns ?? '+0.0%',
      winrate: expert.winrate ?? '0%',
      followers: expert.followers ?? 0,
      trades: expert.trades ?? 0,
      copy_price: expert.copy_price ?? 0,
      image: null,
      image_url: expert.image_url ?? ''
    };
    errorMessage = '';
    isEditOpen = true;
  }

  function openDeleteModal(expert) {
    selectedExpert = expert;
    errorMessage = '';
    isDeleteOpen = true;
  }

  function closeModals() {
    isAddOpen = false;
    isEditOpen = false;
    isDeleteOpen = false;
    selectedExpert = null;
    errorMessage = '';
    isLoading = false;
  }

  async function uploadTraderImage(file) {
    if (!file || !supabase) return null;

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `traders/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('expert-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from('expert-images')
      .getPublicUrl(filePath);

    return publicData?.publicUrl ?? null;
  }

  async function handleAddTrader() {
    if (!supabase) return;
    if (!traderForm.name.trim()) {
      errorMessage = 'Please provide a trader name.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      let imageUrl = null;
      if (traderForm.image) {
        imageUrl = await uploadTraderImage(traderForm.image);
      }

      const { error } = await supabase.from('experts').insert([
        {
          name: traderForm.name.trim(),
          description: traderForm.description.trim(),
          monthly_returns: traderForm.monthly_returns.trim(),
          winrate: traderForm.winrate.trim(),
          followers: Number(traderForm.followers) || 0,
          trades: Number(traderForm.trades) || 0,
          copy_price: Number(traderForm.copy_price) || 0,
          image_url: imageUrl
        }
      ]);

      if (error) throw error;

      await invalidateAll();
      closeModals();
    } catch (err) {
      errorMessage = err?.message || 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }

  async function handleEditTrader() {
    if (!selectedExpert?.id || !supabase) return;
    if (!traderForm.name.trim()) {
      errorMessage = 'Please provide a trader name.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      let imageUrl = traderForm.image_url;
      if (traderForm.image) {
        imageUrl = await uploadTraderImage(traderForm.image);
      }

      const { error } = await supabase
        .from('experts')
        .update({
          name: traderForm.name.trim(),
          description: traderForm.description.trim(),
          monthly_returns: traderForm.monthly_returns.trim(),
          winrate: traderForm.winrate.trim(),
          followers: Number(traderForm.followers) || 0,
          trades: Number(traderForm.trades) || 0,
          copy_price: Number(traderForm.copy_price) || 0,
          image_url: imageUrl
        })
        .eq('id', selectedExpert.id);

      if (error) throw error;

      await invalidateAll();
      closeModals();
    } catch (err) {
      errorMessage = err?.message || 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }

  async function handleDeleteTrader() {
    if (!selectedExpert?.id || !supabase) return;

    isLoading = true;
    errorMessage = '';

    try {
      const { error } = await supabase
        .from('experts')
        .delete()
        .eq('id', selectedExpert.id);

      if (error) throw error;

      await invalidateAll();
      closeModals();
    } catch (err) {
      errorMessage = err?.message || 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-8">
  <!-- Top Navigation / Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold tracking-tight text-white">Manage Traders</h2>
      <p class="text-sm text-gray-400 mt-1">Add, update, or remove expert traders listed on the user platform.</p>
    </div>
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

  <!-- Desktop / Tablet Table Container -->
  <div class="hidden sm:block overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 shadow-xl shadow-black/10">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-800 bg-gray-900/80">
            <th class="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Trader</th>
            <th class="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Return</th>
            <th class="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Win Rate</th>
            <th class="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500 hidden lg:table-cell">Followers</th>
            <th class="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Price</th>
            <th class="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800/70">
          {#if Array.isArray(data?.experts) && data.experts.length > 0}
            {#each data.experts as expert (expert.id ?? expert.name)}
              <tr class="group transition-colors hover:bg-gray-800/30">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3 min-w-[220px]">
                    <div class="relative w-11 h-11 shrink-0 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                      {#if expert.image_url}
                        <img src={expert.image_url} alt={expert.name} class="w-full h-full object-cover" />
                      {:else}
                        <span class="text-xs font-bold text-gray-300">
                          {(expert.name?.[0] ?? 'T').toUpperCase() + (expert.name?.at(-1) ?? '').toUpperCase()}
                        </span>
                      {/if}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-white truncate">{expert.name}</p>
                      <p class="mt-0.5 max-w-[220px] truncate text-[11px] text-gray-500">
                        {expert.description ?? expert.desc ?? 'Professional trader'}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="inline-flex items-center rounded-lg bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1">
                    <span class="font-mono text-xs font-bold text-emerald-400">{expert.monthly_returns}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div class="h-full rounded-full bg-blue-500" style={`width: ${parseFloat(expert.winrate) || 0}%`}></div>
                    </div>
                    <span class="font-mono text-xs font-semibold text-blue-400">{expert.winrate}</span>
                  </div>
                </td>
                <td class="px-5 py-4 hidden lg:table-cell">
                  <span class="text-xs font-medium text-gray-300">{expert.followers}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="text-xs font-semibold text-gray-200">${expert.copy_price}</span>
                  <span class="block text-[10px] text-gray-600">/ copy</span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      onclick={() => openEditModal(expert)}
                      class="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-[11px] font-semibold text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-700 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onclick={() => openDeleteModal(expert)}
                      class="inline-flex items-center justify-center rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-[11px] font-semibold text-red-400 transition-all hover:border-red-800/60 hover:bg-red-950/60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="6">
                <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-gray-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-gray-300">No traders yet</p>
                  <p class="mt-1 text-xs text-gray-500">Add your first expert trader to get started.</p>
                </div>
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Mobile Trader Cards -->
  <div class="space-y-3 sm:hidden">
    {#if Array.isArray(data?.experts) && data.experts.length > 0}
      {#each data.experts as expert (expert.id ?? expert.name)}
        <div class="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 shrink-0 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                {#if expert.image_url}
                  <img src={expert.image_url} alt={expert.name} class="w-full h-full object-cover" />
                {:else}
                  <span class="text-xs font-bold text-gray-300">
                    {(expert.name?.[0] ?? 'T').toUpperCase() + (expert.name?.at(-1) ?? '').toUpperCase()}
                  </span>
                {/if}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{expert.name}</p>
                <p class="text-[11px] text-gray-500 truncate">{expert.description ?? expert.desc ?? 'Professional trader'}</p>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-bold text-emerald-400">{expert.monthly_returns}</p>
              <p class="text-[10px] text-gray-600">monthly</p>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-3 divide-x divide-gray-800 rounded-xl border border-gray-800 bg-gray-950/40 py-3">
            <div class="text-center">
              <p class="text-[10px] uppercase tracking-wider text-gray-600">Win Rate</p>
              <p class="mt-1 text-xs font-bold text-blue-400">{expert.winrate}</p>
            </div>
            <div class="text-center">
              <p class="text-[10px] uppercase tracking-wider text-gray-600">Followers</p>
              <p class="mt-1 text-xs font-bold text-gray-300">{expert.followers}</p>
            </div>
            <div class="text-center">
              <p class="text-[10px] uppercase tracking-wider text-gray-600">Price</p>
              <p class="mt-1 text-xs font-bold text-gray-200">${expert.copy_price}</p>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              onclick={() => openEditModal(expert)}
              class="rounded-xl border border-gray-700 bg-gray-800 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              Edit Trader
            </button>
            <button
              onclick={() => openDeleteModal(expert)}
              class="rounded-xl border border-red-900/40 bg-red-950/30 py-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-950/60"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="rounded-2xl border border-gray-800 bg-gray-900/70 px-6 py-12 text-center">
        <p class="text-sm font-medium text-gray-300">No traders yet</p>
        <p class="mt-1 text-xs text-gray-500">Add your first expert trader to get started.</p>
      </div>
    {/if}
  </div>
</div>

<!-- Add / Edit Modal -->
{#if isAddOpen || isEditOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 class="text-lg font-bold text-white">
          {isEditOpen ? 'Edit Expert Trader' : 'Add Expert Trader'}
        </h3>
        <button onclick={closeModals} class="text-gray-400 hover:text-white text-sm" aria-label="Close modal">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="trader-image">Trader Image</label>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
              {#if imagePreviewUrl}
                <img src={imagePreviewUrl} alt="Trader preview" class="w-full h-full object-cover" />
              {:else}
                <span class="text-gray-400 text-xs font-bold">
                  {(traderForm.name?.[0] ?? 'T').toUpperCase()}
                </span>
              {/if}
            </div>
            <div>
              <input
                id="trader-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isLoading}
                onchange={(e) => {
                  traderForm.image = e.currentTarget.files?.[0] ?? null;
                }}
                class="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700"
              />
              <p class="text-[10px] text-gray-500 mt-1">PNG, JPG or WebP</p>
            </div>
          </div>
        </div>

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
          onclick={isEditOpen ? handleEditTrader : handleAddTrader}
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-950/50 disabled:opacity-50 flex items-center gap-2"
        >
          <span>{isLoading ? (isEditOpen ? 'Updating...' : 'Adding...') : (isEditOpen ? 'Update Trader' : 'Save Trader')}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Modal -->
{#if isDeleteOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
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
          <span>{isLoading ? 'Deleting...' : 'Delete Trader'}</span>
        </button>
      </div>
    </div>
  </div>
{/if}
