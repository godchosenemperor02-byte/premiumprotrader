<script>
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // State
  let kycRecords = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state('');
  let activeFilter = $state('all');
  let searchQuery = $state('');

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
              <th class="py-3 px-4 text-right">Status</th>
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
                  <span class={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getStatusClasses(record.status)}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
