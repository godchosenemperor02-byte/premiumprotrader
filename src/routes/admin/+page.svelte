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

  const account_types = [
    {title:'Newbie', price:'Free',perks:['Account Registration','Basic Dashboard', 'Market Updates','Standard Support'], logo:'🆓'},
    {title:'Bronze', price:'1,000',perks:['Basic Ai Signals','Market Analysis', 'Standard Support','Monthly Reports'], logo:'🥉'},
    {title:'Silver', price:'4,000',perks:['All Bronse Features','Priority Support', 'Advanced Signals','Lower Fees','Profit Optimization'], logo:'🥈'},
    {title:'Gold', price:'8,000',perks:['All silver Features','VIP Trade Alerts', 'Market Insights','Faster Withdrawals','Account Manager'], logo:'🥇'},
    {title:'Platinum', price:'15,000',perks:['All Gold Features','Personalized Strategy', '24/7 VIP Support','Exclusive Opportunities','Portfolio Diversification'], logo:'👑'},
    {title:'Diamond', price:'25,000',perks:['All Platinum Features','Custom AI Trading', 'Private Investment Access','Weatlh Planning','Concierge Management'], logo:'💎'}
 ]

  // Dialog State Management
  let isAddOpen = $state(false);
  let isEditOpen = $state(false);
  let isDeleteOpen = $state(false);
  let selectedUser = $state(null);

  // Status & Error Management
  let isLoading = $state(false);
  let errorMessage = $state('');

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
    isEditOpen = true;
  }

  function openDeleteModal(user) {
    selectedUser = user;
    errorMessage = '';
    isDeleteOpen = true;
  }

  function closeModals() {
    isAddOpen = false;
    isEditOpen = false;
    isDeleteOpen = false;
    selectedUser = null;
    errorMessage = '';
    isLoading = false;
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

<div class="space-y-8">
  <!-- Page Header Title Block -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
      <p class="text-sm text-gray-400 mt-1">System-wide operational metrics, user balances, and pending actions.</p>
    </div>
    <!-- Quick System Actions -->
    <div class="flex items-center gap-3">
      <button 
        onclick={openAddModal}
        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white shadow-md shadow-blue-950/50 transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add User
      </button>
    </div>
  </div>

  <!-- Key Performance Metrics Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    <!-- Card 1: Subscription Plans -->
    <div class="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscription Plans</span>
        <div class="p-2 bg-blue-950/60 border border-blue-900/40 text-blue-400 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6A2.25 2.25 0 0 1 18.75 20H5.25A2.25 2.25 0 0 [...]
            </svg>
        </div>
      </div>
      <div class="text-2xl font-mono font-bold text-white">{subscriptionCount}</div>
    </div>

    <!-- Card 2: Experts -->
    <div class="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Experts</span>
        <div class="p-2 bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 [...]
            </svg>
        </div>
      </div>
      <div class="text-2xl font-mono font-bold text-white">{expertsCount}</div>
    </div>

    <!-- Card 3: Registered Users Count -->
    <div class="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Users</span>
        <div class="p-2 bg-purple-950/60 border border-purple-900/40 text-purple-400 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.[...]
            </svg>
        </div>
      </div>
      <div class="text-2xl font-mono font-bold text-white">
        {Array.isArray(data?.profile) ? data.profile.length : (data?.profile ? 1 : 0)}
      </div>
    </div>
  </div>

  <!-- User Management Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-white">Registered Users</h3>
        <p class="text-xs text-gray-400 mt-0.5">Manage user accounts, roles, and administrative access.</p>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-gray-900 border-b border-gray-800 text-gray-400 font-semibold text-xs tracking-wider uppercase">
            <th class="px-5 py-3.5">Name</th>
            <th class="px-5 py-3.5">User ID</th>
            <th class="px-5 py-3.5">Balance</th>
            <th class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800/60 text-gray-300 font-medium">
          {#if Array.isArray(data?.profile) && data.profile.length > 0}
            {#each data.profile as user}
              <tr class="hover:bg-gray-850/40 transition-colors">
                <td class="px-5 py-4">
                  <span class="block text-xs font-mono text-gray-200 font-semibold">{user.first_name?.toUpperCase() ?? 'No Name Specified'}</span>
                </td>
                <td class="px-5 py-4 font-mono text-xs text-gray-400">
                  {user.id}
                </td>
                <td class="px-5 py-4">
                  <span class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-950/80 text-blue-400 border border-blue-900/50">
                    {user.balance ?? '0.00'}
                  </span>
                </td>
                <td class="px-5 py-4 text-right space-x-2">
                  <button 
                    onclick={() => openEditModal(user)}
                    class="text-xs font-semibold px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onclick={() => openDeleteModal(user)}
                    class="text-xs font-semibold px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          {:else if data?.profile}
            <!-- Fallback for single object profile -->
            <tr class="hover:bg-gray-850/40 transition-colors">
              <td class="px-5 py-4">
                <span class="block text-xs font-mono text-gray-200 font-semibold">{data.profile.first_name?.toUpperCase() ?? data.profile.email ?? 'No User Specified'}</span>
              </td>
              <td class="px-5 py-4 font-mono text-xs text-gray-400">
                {data.profile.id}
              </td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-950/80 text-blue-400 border border-blue-900/50">
                  {data.profile.balance ?? '0.00'}
                </span>
              </td>
              <td class="px-5 py-4 text-right space-x-2">
                <button 
                  onclick={() => openEditModal(data.profile)}
                  class="text-xs font-semibold px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition-all"
                >
                  Edit
                </button>
                <button 
                  onclick={() => openDeleteModal(data.profile)}
                  class="text-xs font-semibold px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg transition-all"
                >
                  Delete
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="px-5 py-8 text-center text-gray-500 text-xs">
                No users found.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ADD USER MODAL -->
{#if isAddOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 class="text-lg font-bold text-white">Add New User</h3>
        <button onclick={closeModals} class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="add-first-name">First Name *</label>
          <input 
            id="add-first-name"
            type="text" 
            placeholder="e.g. Alex"
            bind:value={addForm.first_name} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="add-last-name">Last Name *</label>
          <input 
            id="add-last-name"
            type="text" 
            placeholder="e.g. Smith"
            bind:value={addForm.last_name} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="add-email">Email Address</label>
          <input 
            id="add-email"
            type="email" 
            placeholder="alex@example.com"
            bind:value={addForm.email} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="add-password">Password</label>
          <input 
            id="add-password"
            type="password" 
            placeholder="••••••••"
            bind:value={addForm.password} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="add-country">Country</label>
            <input 
              id="add-country"
              type="text" 
              bind:value={addForm.country} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1" for="add-phone">Phone Number</label>
            <input 
              id="add-phone"
              type="tel" 
              bind:value={addForm.phonenumber} 
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleAddUser} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-950/50 disabled:opacity-50 flex items-center gap-2"
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 class="text-lg font-bold text-white">Edit User Profile</h3>
        <button onclick={closeModals} class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="profit">Profit</label>
          <input 
            id="profit"
            type="number" 
            bind:value={editForm.profit} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="capital">Capital</label>
          <input 
            id="capital"
            type="number" 
            bind:value={editForm.capital} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <!-- SIGNAL INPUT -->
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="signal">Signal Value</label>
          <input 
            id="signal"
            type="number" 
            bind:value={editForm.signal} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <!-- ACCOUNT SIGNAL SELECT INPUT -->
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="account_signal">Account Signal Plan</label>
          <select 
            id="account_signal"
            bind:value={editForm.account_signal} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            {#if Array.isArray(data?.subscription) && data.subscription.length > 0}
              {#each data.subscription as sub}
                <option value={sub.title }>
                  {sub.name ?? sub.title ?? sub.id}
                </option>
              {/each}
            {:else}
              <option value="" disabled>No subscriptions available</option>
            {/if}
          </select>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1" for="copied_expert">Copied Expert</label>
          <select 
            id="copied_expert"
            bind:value={editForm.copy_expert} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            
              {#each data.experts as sub}
                <option value={sub.name }>
                  { sub.name}
                </option>
              {/each}
           
          </select>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          onclick={closeModals} 
          disabled={isLoading}
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleSaveUser} 
          disabled={isLoading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-950/50 disabled:opacity-50 flex items-center gap-2"
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-red-400">
        <div class="p-2 bg-red-950/80 border border-red-900/50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3[...]
            </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Delete Account</h3>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <p class="text-xs text-gray-400 leading-relaxed">
        Are you sure you want to delete <span class="text-gray-200 font-mono font-semibold">{selectedUser?.first_name ?? selectedUser?.email ?? 'this user'}</span>? This action cannot be undone.
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
          onclick={handleDeleteUser} 
          disabled={isLoading}
          class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-950/50 disabled:opacity-50 flex items-center gap-2"
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
