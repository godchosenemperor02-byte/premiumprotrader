<script>
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Safe Derived Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);
  
  // Derived variables to avoid optional chaining in templates
  let subscriptionCount = $derived(
    Array.isArray(data?.subscription) ? data.subscription.length : 0
  );
  let expertsCount = $derived(
    Array.isArray(data?.experts) ? data.experts.length : 0
  );
  let profileList = $derived(
    Array.isArray(data?.profile) ? data.profile : (data?.profile ? [data.profile] : [])
  );

  const account_types = [
    {title:'Newbie', price:'Free',perks:['Account Registration','Basic Dashboard', 'Market Updates','Standard Support'], logo:'🆓'},
    {title:'Bronze', price:'1,000',perks:['Basic Ai Signals','Market Analysis', 'Standard Support','Monthly Reports'], logo:'🥉'},
    {title:'Silver', price:'4,000',perks:['All Bronse Features','Priority Support', 'Advanced Signals','Lower Fees','Profit Optimization'], logo:'🥈'},
    {title:'Gold', price:'8,000',perks:['All silver Features','VIP Trade Alerts', 'Market Insights','Faster Withdrawals','Account Manager'], logo:'🥇'},
    {title:'Platinum', price:'15,000',perks:['All Gold Features','Personalized Strategy', '24/7 VIP Support','Exclusive Opportunities','Portfolio Diversification'], logo:'👑'},
    {title:'Diamond', price:'25,000',perks:['All Platinum Features','Custom AI Trading', 'Private Investment Access','Weatlh Planning','Concierge Management'], logo:'💎'}
  ];

  // Dialog State Management
  let isAddOpen = $state(false);
  let isEditOpen = $state(false);
  let isDeleteOpen = $state(false);
  let selectedUser = $state(null);

  // Status, Error & Feedback Management
  let isLoading = $state(false);
  let isVerifyingDeposit = $state(false);
  let isVerifyingWithdrawal = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  // Form Fields for Add Modal
  let addForm = $state({
    first_name: '',
    email: '',
    last_name: '',
    password: '',
    country: '',
    phonenumber: ''
  });

  // Form Fields for Edit Modal
  let editForm = $state({
    id: '',
    profit: '',
    capital: '',
    signal: '',
    account_signal: '',
    account_plan: '',
    copy_expert: ''
  });

  function openAddModal() {
    addForm = {
      first_name: '',
      email: '',
      last_name: '',
      password: '',
      country: '',
      phonenumber: ''
    };
    errorMessage = '';
    successMessage = '';
    isAddOpen = true;
  }

  function openEditModal(user) {
    selectedUser = user;
    
    // Default to the user's current signal, or first subscription in list if none set
    const defaultSignal = user.account_signal ?? (data?.subscription?.[0]?.name || data?.subscription?.[0]?.id || '');

    editForm = { 
      id: user.id, 
      profit: user.profit ?? 0, 
      capital: user.capital ?? 0,
      signal: user.signal ?? 0,
      account_signal: defaultSignal,
      account_plan: user.accountplan ?? '',
      copy_expert: user.copy_expert ?? ''
    };
    errorMessage = '';
    successMessage = '';
    isEditOpen = true;
  }

  function openDeleteModal(user) {
    selectedUser = user;
    errorMessage = '';
    successMessage = '';
    isDeleteOpen = true;
  }

  function closeModals() {
    isAddOpen = false;
    isEditOpen = false;
    isDeleteOpen = false;
    selectedUser = null;
    errorMessage = '';
    successMessage = '';
    isLoading = false;
    isVerifyingDeposit = false;
    isVerifyingWithdrawal = false;
  }

  // --- SUPABASE VERIFY LAST DEPOSIT LOGIC ---
  async function handleVerifyLastDeposit() {
    if (!editForm.id || !supabase) return;

    isVerifyingDeposit = true;
    errorMessage = '';
    successMessage = '';

    // 1. Fetch the latest deposit transaction for this user
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, status, amount')
      .eq('user_id', editForm.id)
      .eq('type', 'deposit')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      errorMessage = `Failed to fetch last deposit: ${fetchError.message}`;
      isVerifyingDeposit = false;
      return;
    }

    if (!transactions || transactions.length === 0) {
      errorMessage = 'No deposit transaction found for this user.';
      isVerifyingDeposit = false;
      return;
    }

    const lastDeposit = transactions[0];

    if (lastDeposit.status === 'completed') {
      successMessage = 'The latest deposit is already marked as completed.';
      isVerifyingDeposit = false;
      return;
    }

    const depositAmount = Number(lastDeposit.amount) || 0;

    // 2. Update transaction status
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', lastDeposit.id);

    if (updateTxError) {
      errorMessage = `Failed to verify deposit status: ${updateTxError.message}`;
      isVerifyingDeposit = false;
      return;
    }

    // 3. Update capital
    const currentCapital = Number(editForm.capital) || 0;
    const newCapital = currentCapital + depositAmount;

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ capital: newCapital })
      .eq('id', editForm.id);

    isVerifyingDeposit = false;

    if (updateProfileError) {
      errorMessage = `Deposit verified, but failed to update profile capital: ${updateProfileError.message}`;
      return;
    }

    editForm.capital = newCapital;
    successMessage = `Deposit verified! Added ${depositAmount} to capital (New Capital: ${newCapital}).`;
    await invalidateAll();
  }

  // --- SUPABASE VERIFY LAST WITHDRAWAL LOGIC ---
  async function handleVerifyLastWithdrawal() {
    if (!editForm.id || !supabase) return;

    isVerifyingWithdrawal = true;
    errorMessage = '';
    successMessage = '';

    // 1. Fetch the latest withdrawal transaction for this user
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, status, amount')
      .eq('user_id', editForm.id)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      errorMessage = `Failed to fetch last withdrawal: ${fetchError.message}`;
      isVerifyingWithdrawal = false;
      return;
    }

    if (!transactions || transactions.length === 0) {
      errorMessage = 'No withdrawal transaction found for this user.';
      isVerifyingWithdrawal = false;
      return;
    }

    const lastWithdrawal = transactions[0];

    if (lastWithdrawal.status === 'completed') {
      successMessage = 'The latest withdrawal is already marked as completed.';
      isVerifyingWithdrawal = false;
      return;
    }

    const withdrawalAmount = Number(lastWithdrawal.amount) || 0;

    // 2. Update transaction status
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', lastWithdrawal.id);

    if (updateTxError) {
      errorMessage = `Failed to verify withdrawal status: ${updateTxError.message}`;
      isVerifyingWithdrawal = false;
      return;
    }

    // 3. Update capital (deduct withdrawal)
    const currentCapital = Number(editForm.capital) || 0;
    const newCapital = Math.max(0, currentCapital - withdrawalAmount);

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ capital: newCapital })
      .eq('id', editForm.id);

    isVerifyingWithdrawal = false;

    if (updateProfileError) {
      errorMessage = `Withdrawal verified, but failed to update profile capital: ${updateProfileError.message}`;
      return;
    }

    editForm.capital = newCapital;
    successMessage = `Withdrawal verified! Deducted ${withdrawalAmount} from capital (New Capital: ${newCapital}).`;
    await invalidateAll();
  }

  // --- SUPABASE ADD USER LOGIC ---
  async function handleAddUser() {
    if (!supabase) return;
    
    if (!addForm.first_name.trim()) {
      errorMessage = 'Please enter a user name.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase.auth.signUp({
      email: addForm.email,
      password: addForm.password,
      options: {
        data: {
          first_name: addForm.first_name,
          last_name: addForm.last_name,
          country: addForm.country,
          phone_number: addForm.phonenumber,
          admin: false,
          accountplan: 'Newbie',
        }
      }
    });
    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }

  // --- SUPABASE UPDATE LOGIC ---
  async function handleSaveUser() {
    if (!editForm.id || !supabase) return;
    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('profiles')
      .update({
        profit: Number(editForm.profit),
        capital: Number(editForm.capital),
        signal: Number(editForm.signal),
        subscription: editForm.account_signal,
        accountplan: editForm.account_plan,
        copied_expert: editForm.copy_expert
      })
      .eq('id', editForm.id);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }

  // --- SUPABASE DELETE LOGIC ---
  async function handleDeleteUser() {
    if (!selectedUser?.id || !supabase) return;

    isLoading = true;
    errorMessage = '';

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', selectedUser.id);

    isLoading = false;

    if (error) {
      errorMessage = error.message;
      return;
    }

    await invalidateAll();
    closeModals();
  }
</script>

<div class="min-h-screen bg-[#111827] text-slate-100 font-sans antialiased p-3 sm:p-6 lg:p-8">
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8">
    <!-- Page Header Title Block -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
      <div class="space-y-1">
        <h2 class="text-xl sm:text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
        <p class="text-xs sm:text-sm text-slate-400">System-wide operational metrics, user balances, and administrative controls.</p>
      </div>
      <!-- Quick System Actions -->
      <div class="flex items-center gap-3">
        <button 
          onclick={openAddModal}
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add User
        </button>
      </div>
    </div>

    <!-- Key Performance Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <!-- Card 1: Subscription Plans -->
      <div class="relative overflow-hidden bg-slate-900/70 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-slate-700/80 transition-all group backdrop-blur-md">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Plans</span>
          <div class="p-2 sm:p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6A2.25 2.25 0 0 1 18.75 20H5.25A2.25 2.25 0 0 1 3 18v-6m0 0h18" />
            </svg>
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{subscriptionCount}</div>
      </div>

      <!-- Card 2: Experts -->
      <div class="relative overflow-hidden bg-slate-900/70 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-slate-700/80 transition-all group backdrop-blur-md">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Experts</span>
          <div class="p-2 sm:p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.7-3.024A9.334 9.334 0 0 0 12 3c-4.478 0-8.268 2.943-9.543 7a9.306 9.306 0 0 0 1.563 5.803c.456.913.994 1.76 1.564 2.555m0 0A9.382 9.382 0 0 0 15 19.128" />
            </svg>
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{expertsCount}</div>
      </div>

      <!-- Card 3: Registered Users Count -->
      <div class="relative overflow-hidden bg-slate-900/70 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-slate-700/80 transition-all group sm:col-span-2 lg:col-span-1 backdrop-blur-md">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</span>
          <div class="p-2 sm:p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.97 5.97 0 00-.942 3.197M12 10.5a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75z" />
            </svg>
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{profileList.length}</div>
      </div>
    </div>

    <!-- User Management Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-white">Registered Accounts</h3>
          <p class="text-xs text-slate-400 mt-0.5">Manage user profiles, financial allocation, and sub-tier permissions.</p>
        </div>
      </div>

      <!-- Mobile User Cards View -->
      <div class="block md:hidden space-y-3">
        {#each profileList as user}
          <div class="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3 backdrop-blur-md">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-white text-sm">{user.first_name ?? 'Unregistered'} {user.last_name ?? ''}</span>
                <span class="block text-xs text-slate-400">{user.email ?? 'No email'}</span>
              </div>
              <span class="text-xs font-mono font-semibold text-emerald-400">{user.currency ?? '$'}{user.balance ?? '0.00'}</span>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button 
                onclick={() => openDetailsModal(user)}
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 text-xs font-medium"
              >
                View
              </button>
              <button 
                onclick={() => openEditModal(user)}
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-medium"
              >
                Edit
              </button>
              <button 
                onclick={() => openDeleteModal(user)}
                class="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Desktop User Table View -->
      <div class="hidden md:block overflow-x-auto bg-slate-900/70 border border-slate-800 rounded-2xl backdrop-blur-md">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th class="px-6 py-3.5">User</th>
              <th class="px-6 py-3.5">Balance</th>
              <th class="px-6 py-3.5">Signal Plan</th>
              <th class="px-6 py-3.5">Copied Expert</th>
              <th class="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-medium">
            {#each profileList as user}
              <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-white">{user.first_name ?? 'Unregistered'} {user.last_name ?? ''}</div>
                  <div class="text-slate-400">{user.email ?? 'No email'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-emerald-400">
                  {user.currency ?? '$'}{user.balance ?? '0.00'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-300">
                  {user.account_signal ?? 'None'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-300">
                  {user.copy_expert ?? 'None'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button 
                    onclick={() => openDetailsModal(user)}
                    class="text-xs font-medium px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition-all focus:ring-2 focus:ring-slate-600/40"
                  >
                    View
                  </button>
                  <button 
                    onclick={() => openEditModal(user)}
                    class="text-xs font-medium px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all focus:ring-2 focus:ring-slate-600/40"
                  >
                    Edit
                  </button>
                  <button 
                    onclick={() => openDeleteModal(user)}
                    class="text-xs font-medium px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all focus:ring-2 focus:ring-rose-500/40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- ADD USER MODAL -->
{#if isAddOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
        <h3 class="text-base sm:text-lg font-bold text-white">Add New User</h3>
        <button onclick={closeModals} class="text-slate-400 hover:text-white text-sm p-1 rounded-md hover:bg-slate-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-3 sm:space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5" for="add-first-name">First Name *</label>
            <input 
              id="add-first-name"
              type="text" 
              placeholder="e.g. Alex"
              bind:value={addForm.first_name} 
              disabled={isLoading}
              class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5" for="add-last-name">Last Name *</label>
            <input 
              id="add-last-name"
              type="text" 
              placeholder="e.g. Smith"
              bind:value={addForm.last_name} 
              disabled={isLoading}
              class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5" for="add-email">Email Address</label>
          <input 
            id="add-email"
            type="email" 
            placeholder="alex@example.com"
            bind:value={addForm.email} 
            disabled={isLoading}
            class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5" for="add-password">Password</label>
          <input 
            id="add-password"
            type="password" 
            placeholder="••••••••"
            bind:value={addForm.password} 
            disabled={isLoading}
            class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5" for="add-country">Country</label>
            <input 
              id="add-country"
              type="text" 
              placeholder="e.g. US"
              bind:value={addForm.country} 
              disabled={isLoading}
              class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5" for="add-phone">Phone Number</label>
            <input 
              id="add-phone"
              type="tel" 
              placeholder="+1 234..."
              bind:value={addForm.phonenumber} 
              disabled={isLoading}
              class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 sm:pt-4 border-t border-slate-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleAddUser} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Adding...</span>
          {:else}
            <span>Create User</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- EDIT USER MODAL -->
{#if isEditOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
        <h3 class="text-base sm:text-lg font-bold text-white">Edit User Profile</h3>
        <button onclick={closeModals} class="text-slate-400 hover:text-white text-sm p-1 rounded-md hover:bg-slate-800 transition-colors">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      {#if successMessage}
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
          {successMessage}
        </div>
      {/if}

      <!-- Verify Action Panel (Deposits & Withdrawals) -->
      <div class="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
        <div>
          <span class="block text-xs font-semibold text-slate-200">Transaction Verification</span>
          <span class="block text-[11px] text-slate-400">Complete pending transactions & auto-update capital balance</span>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <!-- Verify Deposit Button -->
          <button
            type="button"
            onclick={handleVerifyLastDeposit}
            disabled={isVerifyingDeposit || isVerifyingWithdrawal || isLoading}
            class="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {#if isVerifyingDeposit}
              <svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying Deposit...</span>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0-15l-3.75 3.75M12 4.5l3.75 3.75" />
              </svg>
              <span>Verify Last Deposit</span>
            {/if}
          </button>

          <!-- Verify Withdrawal Button -->
          <button
            type="button"
            onclick={handleVerifyLastWithdrawal}
            disabled={isVerifyingDeposit || isVerifyingWithdrawal || isLoading}
            class="w-full px-3 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {#if isVerifyingWithdrawal}
              <svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying Withdrawal...</span>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 15l-3.75-3.75M12 19.5l3.75-3.75" />
              </svg>
              <span>Verify Last Withdrawal</span>
            {/if}
          </button>
        </div>
      </div>

      <div class="space-y-3 sm:space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5" for="profit">Profit</label>
            <input 
              id="profit"
              type="number" 
              bind:value={editForm.profit} 
              disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
              class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5" for="capital">Capital</label>
            <input 
              id="capital"
              type="number" 
              bind:value={editForm.capital} 
              disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
              class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5" for="signal">Signal Value</label>
          <input 
            id="signal"
            type="number" 
            bind:value={editForm.signal} 
            disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
            class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5" for="account_signal">Account Signal Plan</label>
          <select 
            id="account_signal"
            bind:value={editForm.account_signal} 
            disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
            class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          >
            {#if Array.isArray(data?.subscription) && data.subscription.length > 0}
              {#each data.subscription as sub}
                <option value={sub.title}>
                  {sub.name ?? sub.title ?? sub.id}
                </option>
              {/each}
            {:else}
              <option value="" disabled>No subscriptions available</option>
            {/if}
          </select>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5" for="copied_expert">Copied Expert</label>
          <select 
            id="copied_expert"
            bind:value={editForm.copy_expert} 
            disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
            class="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
          >
            {#if Array.isArray(data?.experts)}
              {#each data.experts as expert}
                <option value={expert.name}>
                  {expert.name}
                </option>
              {/each}
            {/if}
          </select>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 sm:pt-4 border-t border-slate-800">
        <button 
          onclick={closeModals} 
          disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleSaveUser} 
          disabled={isLoading || isVerifyingDeposit || isVerifyingWithdrawal}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Saving...</span>
          {:else}
            <span>Save Changes</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- DELETE CONFIRMATION MODAL -->
{#if isDeleteOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-rose-400">
        <div class="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0l-10.998 19.24c-.865 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378" />
          </svg>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-white">Delete Account</h3>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <p class="text-xs text-slate-400 leading-relaxed">
        Are you sure you want to delete <span class="text-slate-200 font-mono font-semibold">{selectedUser?.first_name ?? selectedUser?.email ?? 'this user'}</span>? This action is permanent and cannot be undone.
      </p>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleDeleteUser} 
          disabled={isLoading}
          class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-rose-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Deleting...</span>
          {:else}
            <span>Delete User</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- USER DETAILS MODAL -->
{#if isDetailsOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            {selectedUser?.first_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white">
              {selectedUser?.first_name ?? 'Unregistered'} {selectedUser?.last_name ?? ''}
            </h3>
            <p class="text-xs text-slate-400">{selectedUser?.email ?? 'No email bound'}</p>
          </div>
        </div>
        <button onclick={closeModals} class="text-slate-400 hover:text-white text-sm p-1 rounded-md hover:bg-slate-800 transition-colors">✕</button>
      </div>

      <!-- Account Overview Cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Balance</span>
          <span class="text-base font-mono font-bold text-emerald-400">
            {selectedUser?.currency ?? '$'} {selectedUser?.balance ?? '0.00'}
          </span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Profit</span>
          <span class="text-base font-mono font-bold text-blue-400">
            {selectedUser?.currency ?? '$'} {selectedUser?.profit ?? '0.00'}
          </span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Capital</span>
          <span class="text-base font-mono font-bold text-purple-400">
            {selectedUser?.currency ?? '$'} {selectedUser?.capital ?? '0.00'}
          </span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Signal Value</span>
          <span class="text-base font-mono font-bold text-amber-400">
            {selectedUser?.signal ?? '0'}
          </span>
        </div>
      </div>

      <!-- Detailed Attributes List -->
      <div class="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 text-xs">
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Account ID</span>
          <span class="font-mono text-slate-200">{selectedUser?.id ?? 'N/A'}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Country</span>
          <span class="text-slate-200">{selectedUser?.country ?? 'N/A'}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Date of Birth</span>
          <span class="text-slate-200">{selectedUser?.dob ?? 'N/A'}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Address</span>
          <span class="text-slate-200">{selectedUser?.address ?? 'N/A'}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Phone Number</span>
          <span class="text-slate-200">{selectedUser?.phonenumber ?? 'N/A'}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Account Signal Plan</span>
          <span class="text-slate-200">{selectedUser?.account_signal ?? 'None'}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-400">Copied Expert</span>
          <span class="text-slate-200">{selectedUser?.copy_expert ?? 'None'}</span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button 
          onclick={closeModals} 
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
        >
          Close
        </button>
      </div>

    </div>
  </div>
{/if}
