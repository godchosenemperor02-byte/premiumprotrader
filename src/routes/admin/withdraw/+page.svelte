<script>
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Safe Derived Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Raw array derived safely
  let withdrawalsList = $derived(
    Array.isArray(data?.withdrawals) ? data.withdrawals : []
  );

  // Search & Filter state
  let searchQuery = $state('');
  let statusFilter = $state('all'); // 'all' | 'pending' | 'completed' | 'rejected'

  // Computed / Filtered Withdrawals List
  let filteredWithdrawals = $derived(
    withdrawalsList.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.status?.toLowerCase() === statusFilter;
      
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        item.user_email?.toLowerCase().includes(search) ||
        item.user_name?.toLowerCase().includes(search) ||
        item.id?.toLowerCase().includes(search) ||
        item.payment_method?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    })
  );

  // Metric Stats
  let totalPending = $derived(
    withdrawalsList.filter((w) => w.status?.toLowerCase() === 'pending').length
  );
  let totalCompletedAmount = $derived(
    withdrawalsList
      .filter((w) => w.status?.toLowerCase() === 'completed')
      .reduce((sum, w) => sum + (Number(w.amount) || 0), 0)
  );
  let totalPendingAmount = $derived(
    withdrawalsList
      .filter((w) => w.status?.toLowerCase() === 'pending')
      .reduce((sum, w) => sum + (Number(w.amount) || 0), 0)
  );

  // Action Modals State
  let selectedWithdrawal = $state(null);
  let isApproveOpen = $state(false);
  let isRejectOpen = $state(false);
  let rejectReason = $state('');
  
  let isLoading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  function openApproveModal(withdrawal) {
    selectedWithdrawal = withdrawal;
    errorMessage = '';
    successMessage = '';
    isApproveOpen = true;
  }

  function openRejectModal(withdrawal) {
    selectedWithdrawal = withdrawal;
    rejectReason = '';
    errorMessage = '';
    successMessage = '';
    isRejectOpen = true;
  }

  function closeModals() {
    isApproveOpen = false;
    isRejectOpen = false;
    selectedWithdrawal = null;
    rejectReason = '';
    errorMessage = '';
    successMessage = '';
    isLoading = false;
  }

  // --- SUPABASE APPROVE WITHDRAWAL LOGIC ---
  async function handleApprove() {
    if (!selectedWithdrawal?.id || !supabase) return;

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', selectedWithdrawal.id);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }

  // --- SUPABASE REJECT WITHDRAWAL LOGIC ---
  async function handleReject() {
    if (!selectedWithdrawal?.id || !supabase) return;

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('transactions')
      .update({ 
        status: 'rejected',
        notes: rejectReason || 'Withdrawal rejected by admin' 
      })
      .eq('id', selectedWithdrawal.id);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }
</script>

<div class="min-h-screen bg-[#111827] text-slate-100 font-sans antialiased p-4 sm:p-6 lg:p-8">
  <div class="max-w-7xl mx-auto space-y-8">
    
    <!-- Page Header Title Block -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
      <div class="space-y-1">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">Withdrawal Management</h2>
        <p class="text-sm text-slate-400">Review, approve, or reject user withdrawal requests and payout histories.</p>
      </div>
    </div>

    <!-- Key Performance Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <!-- Card 1: Pending Action Count -->
      <div class="relative overflow-hidden bg-slate-900/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Requests</span>
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-mono font-bold text-white tracking-tight">{totalPending}</div>
      </div>

      <!-- Card 2: Pending Volume -->
      <div class="relative overflow-hidden bg-slate-900/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Volume</span>
          <div class="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-mono font-bold text-white tracking-tight">${totalPendingAmount.toLocaleString()}</div>
      </div>

      <!-- Card 3: Total Paid Out -->
      <div class="relative overflow-hidden bg-slate-900/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Approved Payouts</span>
          <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-mono font-bold text-white tracking-tight">${totalCompletedAmount.toLocaleString()}</div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search by user, email or ID..."
          bind:value={searchQuery}
          class="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
      </div>

      <!-- Status Tabs -->
      <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto overflow-x-auto">
        <button
          onclick={() => statusFilter = 'all'}
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap {statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
        >
          All Requests
        </button>
        <button
          onclick={() => statusFilter = 'pending'}
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap {statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}"
        >
          Pending
        </button>
        <button
          onclick={() => statusFilter = 'completed'}
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap {statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}"
        >
          Completed
        </button>
        <button
          onclick={() => statusFilter = 'rejected'}
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap {statusFilter === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}"
        >
          Rejected
        </button>
      </div>
    </div>

    <!-- Withdrawal Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th class="px-6 py-4">User</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Method & Destination</th>
              <th class="px-6 py-4">Requested Date</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-slate-300">
            {#if filteredWithdrawals.length > 0}
              {#each filteredWithdrawals as item}
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <!-- User Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                        {(item.user_name?.[0] || item.user_email?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <span class="block text-sm font-semibold text-slate-100">{item.user_name || 'Anonymous'}</span>
                        <span class="block text-xs text-slate-400">{item.user_email || 'No email'}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Amount -->
                  <td class="px-6 py-4 whitespace-nowrap font-mono font-semibold text-white">
                    ${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <!-- Method & Address -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="space-y-0.5">
                      <span class="inline-block text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {item.payment_method || 'Crypto / Bank'}
                      </span>
                      <p class="text-xs text-slate-400 font-mono max-w-[200px] truncate" title={item.destination_address}>
                        {item.destination_address || item.wallet_address || 'N/A'}
                      </p>
                    </div>
                  </td>

                  <!-- Date -->
                  <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </td>

                  <!-- Status Badge -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    {#if item.status?.toLowerCase() === 'completed'}
                      <span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ● Completed
                      </span>
                    {:else if item.status?.toLowerCase() === 'rejected'}
                      <span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        ● Rejected
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                        ● Pending Approval
                      </span>
                    {/if}
                  </td>

                  <!-- Action Buttons -->
                  <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    {#if item.status?.toLowerCase() === 'pending'}
                      <button 
                        onclick={() => openApproveModal(item)}
                        class="text-xs font-medium px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-all focus:ring-2 focus:ring-emerald-500/40"
                      >
                        Approve
                      </button>
                      <button 
                        onclick={() => openRejectModal(item)}
                        class="text-xs font-medium px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all focus:ring-2 focus:ring-rose-500/40"
                      >
                        Reject
                      </button>
                    {:else}
                      <span class="text-xs text-slate-500 italic pr-2">Processed</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-500 text-sm">
                  No withdrawal records found matching your filters.
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<!-- APPROVE WITHDRAWAL MODAL -->
{#if isApproveOpen && selectedWithdrawal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 class="text-lg font-bold text-white">Approve Withdrawal</h3>
        <button onclick={closeModals} class="text-slate-400 hover:text-white text-sm p-1 rounded-md hover:bg-slate-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
        <div class="flex justify-between text-slate-400">
          <span>User:</span>
          <span class="font-semibold text-slate-200">{selectedWithdrawal.user_name || selectedWithdrawal.user_email}</span>
        </div>
        <div class="flex justify-between text-slate-400">
          <span>Amount:</span>
          <span class="font-mono font-bold text-emerald-400">${Number(selectedWithdrawal.amount).toLocaleString()}</span>
        </div>
        <div class="flex justify-between text-slate-400">
          <span>Destination:</span>
          <span class="font-mono text-slate-300 truncate max-w-[180px]">{selectedWithdrawal.destination_address || 'N/A'}</span>
        </div>
      </div>

      <p class="text-xs text-slate-400 leading-relaxed">
        Confirming this will mark the payout as <strong class="text-emerald-400">Completed</strong>. Ensure you have transferred the funds to the provided address.
      </p>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleApprove} 
          disabled={isLoading}
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Processing...</span>
          {:else}
            <span>Confirm Approval</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- REJECT WITHDRAWAL MODAL -->
{#if isRejectOpen && selectedWithdrawal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 class="text-lg font-bold text-rose-400">Reject Withdrawal</h3>
        <button onclick={closeModals} class="text-slate-400 hover:text-white text-sm p-1 rounded-md hover:bg-slate-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-3">
        <p class="text-xs text-slate-300">
          You are rejecting the withdrawal of <strong class="text-white font-mono">${Number(selectedWithdrawal.amount).toLocaleString()}</strong> for <strong class="text-white">{selectedWithdrawal.user_name || selectedWithdrawal.user_email}</strong>.
        </p>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5" for="reject-reason">Reason for Rejection (Optional)</label>
          <textarea
            id="reject-reason"
            rows="3"
            placeholder="e.g. Invalid wallet address or insufficient balance details"
            bind:value={rejectReason}
            disabled={isLoading}
            class="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all disabled:opacity-50"
          ></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleReject} 
          disabled={isLoading}
          class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-rose-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Rejecting...</span>
          {:else}
            <span>Reject Request</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
