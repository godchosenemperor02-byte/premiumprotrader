<script>
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // State
  let kycRecords = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state('');
  let activeFilter = $state('all');
  let searchQuery = $state('');

  // Modal State
  let selectedRecord = $state(null);
  let isModalOpen = $state(false);
  let isFetchingUrls = $state(false);
  let documentUrls = $state({
    idFront: null,
    idBack: null,
    selfie: null
  });

  // Load records
  async function loadKycRecords() {
    if (!supabase) {
      isLoading = false;
      errorMessage = 'Database connection missing.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const { data: records, error } = await supabase
        .from('kyc_verifications')
        .select(`
          id,
          user_id,
          full_name,
          date_of_birth,
          id_type,
          id_number,
          residential_address,
          status,
          id_front_path,
          id_back_path,
          selfie_path,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      kycRecords = records || [];
    } catch (error) {
      console.error('KYC LOAD ERROR:', error);
      errorMessage = error?.message || 'Failed to load KYC submissions.';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    if (supabase) loadKycRecords();
  });

  // Derived filtered data
  let filteredRecords = $derived(
    kycRecords.filter((record) => {
      const matchesStatus = activeFilter === 'all' || record.status === activeFilter;
      const query = searchQuery.trim().toLowerCase();

      if (!query) return matchesStatus;

      const matchesSearch =
        record.full_name?.toLowerCase().includes(query) ||
        record.id_number?.toLowerCase().includes(query) ||
        record.id_type?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    })
  );

  // Helpers
  function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatIdType(type) {
    const types = {
      passport: 'International Passport',
      national_id: 'National Identity Card',
      drivers_license: "Driver's License"
    };
    return types[type] || type || 'Unknown';
  }

  function getStatusClasses(status) {
    if (status === 'approved') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (status === 'rejected') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }

  // Open Modal and fetch image signed URLs from 'kyc-documents' bucket
  async function openRecordModal(record) {
    selectedRecord = record;
    isModalOpen = true;
    isFetchingUrls = true;
    documentUrls = { idFront: null, idBack: null, selfie: null };

    try {
      const getSignedUrl = async (filePath) => {
        if (!filePath) return null;
        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(filePath, 3600); // 1 hour validity

        if (error) {
          console.error(`Error fetching signed URL for ${filePath}:`, error.message);
          return null;
        }
        return data?.signedUrl || null;
      };

      const [idFront, idBack, selfie] = await Promise.all([
        getSignedUrl(record.id_front_path),
        getSignedUrl(record.id_back_path),
        getSignedUrl(record.selfie_path)
      ]);

      documentUrls = { idFront, idBack, selfie };
    } catch (err) {
      console.error('Error generating document URLs:', err);
    } finally {
      isFetchingUrls = false;
    }
  }

  function closeModal() {
    isModalOpen = false;
    selectedRecord = null;
    documentUrls = { idFront: null, idBack: null, selfie: null };
  }
</script>

<div class="space-y-4">
  <!-- HEADER & CONTROLS -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-bold tracking-tight text-white">KYC Submissions</h1>
      <p class="text-xs text-slate-400 mt-0.5">List of all identity verification records.</p>
    </div>

    <button
      type="button"
      onclick={loadKycRecords}
      disabled={isLoading}
      class="h-9 px-3.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
        class={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9M19.5 9V4.5m0 4.5H15m4.5 3a7.5 7.5 0 0 1-12.8 5.3L4.5 15m0 0v4.5m0-4.5H9" />
      </svg>
      Refresh
    </button>
  </div>

  <!-- FILTERS -->
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
      </svg>

      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search name, ID number or type..."
        class="w-full h-10 bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
      />
    </div>

    <select
      bind:value={activeFilter}
      class="h-10 bg-slate-900/60 border border-slate-800 rounded-lg px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
    >
      <option value="all">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>

  {#if errorMessage}
    <div class="p-3 bg-rose-500/[0.06] border border-rose-500/20 text-rose-400 text-xs rounded-xl">
      {errorMessage}
    </div>
  {/if}

  <!-- DATA TABLE / LIST -->
  <div class="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
    {#if isLoading}
      <div class="p-8 text-center text-xs text-slate-500">Loading records...</div>
    {:else if filteredRecords.length === 0}
      <div class="p-8 text-center text-xs text-slate-400">No KYC submissions match your criteria.</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
              <th class="py-3 px-4">User</th>
              <th class="py-3 px-4">Document Type</th>
              <th class="py-3 px-4">ID Number</th>
              <th class="py-3 px-4">Submitted</th>
              <th class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {#each filteredRecords as record}
              <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-4 font-semibold text-slate-200">{record.full_name || '—'}</td>
                <td class="py-3 px-4 text-slate-400">{formatIdType(record.id_type)}</td>
                <td class="py-3 px-4 text-slate-300 font-mono">{record.id_number || '—'}</td>
                <td class="py-3 px-4 text-slate-500">{formatDate(record.created_at)}</td>
                <td class="py-3 px-4 text-right">
                  <button
                    type="button"
                    onclick={() => openRecordModal(record)}
                    class="h-7 px-2.5 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-semibold transition-all"
                  >
                    View Documents
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<!-- DOCUMENT VIEWER MODAL -->
{#if isModalOpen && selectedRecord}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-white">{selectedRecord.full_name}</h2>
            <span class={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getStatusClasses(selectedRecord.status)}`}>
              {selectedRecord.status}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {formatIdType(selectedRecord.id_type)} • <span class="font-mono text-slate-300">{selectedRecord.id_number}</span>
          </p>
        </div>

        <button
          type="button"
          onclick={closeModal}
          class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- User Information Context -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div>
          <span class="text-slate-500 block">Date of Birth</span>
          <span class="text-slate-200 font-medium">{formatDate(selectedRecord.date_of_birth)}</span>
        </div>
        <div>
          <span class="text-slate-500 block">Residential Address</span>
          <span class="text-slate-200 font-medium">{selectedRecord.residential_address || '—'}</span>
        </div>
      </div>

      <!-- Document Images Section -->
      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-slate-300 tracking-wide uppercase">Submitted Documents</h3>

        {#if isFetchingUrls}
          <div class="p-12 text-center text-xs text-slate-500">
            <div class="inline-block animate-spin w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full mb-2"></div>
            <p>Fetching secure document paths from bucket...</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- ID Front -->
            <div class="space-y-1.5">
              <span class="text-[11px] font-medium text-slate-400">ID Front</span>
              <div class="relative aspect-[4/3] rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex items-center justify-center">
                {#if documentUrls.idFront}
                  <a href={documentUrls.idFront} target="_blank" rel="noreferrer" class="w-full h-full">
                    <img src={documentUrls.idFront} alt="ID Front" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                  </a>
                {:else}
                  <span class="text-[11px] text-slate-600">No Image Available</span>
                {/if}
              </div>
            </div>

            <!-- ID Back -->
            <div class="space-y-1.5">
              <span class="text-[11px] font-medium text-slate-400">ID Back</span>
              <div class="relative aspect-[4/3] rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex items-center justify-center">
                {#if documentUrls.idBack}
                  <a href={documentUrls.idBack} target="_blank" rel="noreferrer" class="w-full h-full">
                    <img src={documentUrls.idBack} alt="ID Back" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                  </a>
                {:else}
                  <span class="text-[11px] text-slate-600">No Image Available</span>
                {/if}
              </div>
            </div>

            <!-- Selfie -->
            <div class="space-y-1.5">
              <span class="text-[11px] font-medium text-slate-400">Selfie Verification</span>
              <div class="relative aspect-[4/3] rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex items-center justify-center">
                {#if documentUrls.selfie}
                  <a href={documentUrls.selfie} target="_blank" rel="noreferrer" class="w-full h-full">
                    <img src={documentUrls.selfie} alt="Selfie" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                  </a>
                {:else}
                  <span class="text-[11px] text-slate-600">No Image Available</span>
                {/if}
              </div>
            </div>

          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end pt-2 border-t border-slate-800">
        <button
          type="button"
          onclick={closeModal}
          class="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          Close
        </button>
      </div>

    </div>
  </div>
{/if}
