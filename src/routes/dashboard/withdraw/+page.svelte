<script>
  import { onMount } from "svelte";

  let { data } = $props();
  let supabase = $derived(data?.supabase);
  let userId = $derived(data?.session?.user?.id || data?.profile?.id);

  // Reactive State (Svelte 5 Runes)
  let code = $state("");
  let showAlert = $state(false);
  let alertSuccess = $state(false);
  let alertMessage = $state("");
  
  let selectedMethod = $state("");
  let bankName = $state("");
  let accountNumber = $state("");
  let walletAddress = $state("");
  let amount = $state("");
  let password = $state("");
  let isSubmitting = $state(false);

  // Transactions list state
  let transactions = $state([]);
  let isLoadingTransactions = $state(false);

  let timer;

  // Fetch user withdrawal history
  $effect(() => {
    if (supabase && userId) {
      fetchWithdrawals();
    }
  });

  async function fetchWithdrawals() {
    isLoadingTransactions = true;
    try {
      const { data: rows, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "withdraw")
        .order("created_at", { ascending: false });

      if (error) throw error;
      transactions = rows || [];
    } catch (err) {
      console.error("Error fetching withdrawal history:", err);
    } finally {
      isLoadingTransactions = false;
    }
  }

  const triggerToast = (isSuccess, message) => {
    alertSuccess = isSuccess;
    alertMessage = message;
    showAlert = true;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      showAlert = false;
    }, 5000);
  };

  let handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      triggerToast(false, "User authentication session missing.");
      return;
    }

    // Code Authorization check
    if (code !== "k8#N9$vP2m!L5xR7") {
      triggerToast(false, "Invalid or unrecognized withdrawal code. Please contact your account manager.");
      return;
    }

    // Determine details string based on payment method
    let destinationDetails = "";
    if (selectedMethod === "bank") {
      destinationDetails = `Bank: ${bankName} - Acc: ${accountNumber}`;
    } else {
      destinationDetails = `${selectedMethod.toUpperCase()}: ${walletAddress}`;
    }

    isSubmitting = true;

    try {
      // Create pending withdrawal transaction entry in Supabase
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: userId,
          amount: parseFloat(amount),
          type: "withdraw",
          status: "pending",
          method: selectedMethod.toUpperCase(),
          method: destinationDetails,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      triggerToast(true, "Your withdrawal request is being processed. Contact your account manager for more details.");

      // Reset Form
      amount = "";
      password = "";
      code = "";
      bankName = "";
      accountNumber = "";
      walletAddress = "";

      // Refresh table list
      await fetchWithdrawals();
    } catch (err) {
      console.error("Withdrawal submission error:", err);
      triggerToast(false, err.message || "Failed to submit withdrawal request.");
    } finally {
      isSubmitting = false;
    }
  };

  onMount(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  });
</script>

<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100">
  <!-- Title Block -->
  <div class="border-b border-slate-800/80 pb-6 space-y-1">
    <h1 class="text-3xl font-extrabold tracking-tight text-white font-serif">Withdraw Funds</h1>
    <p class="text-slate-400 text-sm">
      Withdraw your investment profits or available balance securely to your account or wallet.
    </p>
  </div>

  <!-- Available Balance Alert Row -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div class="md:col-span-1 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-center backdrop-blur-md">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
      <span class="text-2xl font-mono font-bold text-emerald-400 mt-1">
        {data.profile?.currency || '$'} {Number(data.profile?.balance ?? 0).toLocaleString()}
      </span>
    </div>
    
    <div class="md:col-span-2 flex items-start gap-3.5 bg-blue-950/30 border border-blue-900/40 rounded-2xl p-5 text-sm text-blue-200 backdrop-blur-md">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-400 shrink-0 mt-0.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <span class="leading-relaxed text-xs sm:text-sm">
        Please ensure your withdrawal details are correct before submitting. All withdrawal requests undergo manual compliance and security reviews.
      </span>
    </div>
  </div>

  <!-- Form Layout -->
  <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
    <div class="mb-6">
      <h2 class="text-lg font-bold text-slate-100 tracking-tight">Request Withdrawal</h2>
      <p class="text-xs text-slate-400 mt-0.5">Fill in the form below to request a transfer</p>
    </div>

    <form class="space-y-6" onsubmit={handleSubmit}>
      <!-- Grid Fields (Method & Amount) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Method Selector -->
        <div class="space-y-2">
          <label for="method" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Withdrawal Method <span class="text-rose-400">*</span>
          </label>
          <div class="relative">
            <select 
              id="method"
              bind:value={selectedMethod}
              class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled selected class="bg-slate-900 text-slate-400">Select method</option>
              <option value="bank" class="bg-slate-900 text-slate-200">Bank Transfer</option>
              <option value="btc" class="bg-slate-900 text-slate-200">Bitcoin (BTC)</option>
              <option value="usdt" class="bg-slate-900 text-slate-200">Tether (USDT)</option>
              <option value="eth" class="bg-slate-900 text-slate-200">Ethereum (ETH)</option>
            </select>
            <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Amount Field -->
        <div class="space-y-2">
          <label for="amount" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Withdrawal Amount ({data.profile?.currency || '$'}) <span class="text-rose-400">*</span>
          </label>
          <input 
            id="amount"
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            bind:value={amount}
            class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
            required
          />
        </div>
      </div>

      <!-- Dynamic Conditional Fields -->
      {#if selectedMethod === 'bank'}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 transition-all">
          <div class="space-y-2">
            <label for="bankName" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Bank Name <span class="text-rose-400">*</span>
            </label>
            <input 
              id="bankName"
              type="text" 
              placeholder="e.g. Chase, Bank of America" 
              bind:value={bankName}
              class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="accountNumber" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Number <span class="text-rose-400">*</span>
            </label>
            <input 
              id="accountNumber"
              type="text" 
              placeholder="Enter your account number" 
              bind:value={accountNumber}
              class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
              required
            />
          </div>
        </div>
      {:else if ['btc', 'usdt', 'eth'].includes(selectedMethod)}
        <div class="space-y-2 transition-all">
          <label for="walletAddress" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            {selectedMethod.toUpperCase()} Wallet Address <span class="text-rose-400">*</span>
          </label>
          <input 
            id="walletAddress"
            type="text" 
            placeholder={`Enter your ${selectedMethod.toUpperCase()} wallet address`} 
            bind:value={walletAddress}
            class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
            required
          />
        </div>
      {/if}

      <!-- Withdrawal Code Block -->
      <div class="space-y-2">
        <label for="code" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Withdrawal Code <span class="text-rose-400">*</span>
        </label>
        <input 
          id="code"
          type="text"
          bind:value={code}
          placeholder="Enter authorization code"
          class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
          required
        />
        <div class="flex items-center gap-2 pt-1 text-xs text-amber-400/90 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>Please contact support to request your authorization code.</span>
        </div>
      </div>

      <!-- Password Validation -->
      <div class="space-y-2">
        <label for="password" class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Confirm Password <span class="text-rose-400">*</span>
        </label>
        <input 
          id="password"
          type="password" 
          bind:value={password}
          placeholder="••••••••" 
          class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
          required
        />
        <p class="text-xs text-slate-500">For security purposes, please enter your account password to confirm this withdrawal</p>
      </div>

      <!-- Submit Action Button -->
      <button 
        type="submit" 
        disabled={isSubmitting}
        class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
      >
        {isSubmitting ? "Processing..." : "Submit Withdrawal Request"}
      </button>
    </form>
  </div>

  <!-- Recent Withdrawals Table Block -->
  <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold text-slate-100 tracking-tight">Withdrawal Requests</h2>
        <p class="text-xs text-slate-400 mt-0.5">Track your pending and historical withdrawal transactions</p>
      </div>
      <button 
        type="button" 
        onclick={fetchWithdrawals}
        class="text-xs text-slate-400 hover:text-white transition-colors"
      >
        {isLoadingTransactions ? "Refreshing..." : "🔄 Refresh"}
      </button>
    </div>

    {#if isLoadingTransactions && transactions.length === 0}
      <div class="py-8 text-center text-sm text-slate-500">Loading withdrawal history...</div>
    {:else if transactions.length === 0}
      <div class="py-8 text-center text-sm text-slate-500 border border-dashed border-slate-800 rounded-xl">
        No withdrawal history found.
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" class="px-4 py-3">Date</th>
              <th scope="col" class="px-4 py-3">Destination / Method</th>
              <th scope="col" class="px-4 py-3">Amount</th>
              <th scope="col" class="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {#each transactions as tx}
              <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3.5 text-xs text-slate-400 font-mono">
                  {new Date(tx.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td class="px-4 py-3.5 font-medium text-slate-200 text-xs max-w-xs truncate">
                  {tx.method}
                </td>
                <td class="px-4 py-3.5 font-mono text-rose-400 font-semibold">
                  -{data.profile?.currency || '$'} {Number(tx.amount).toFixed(2)}
                </td>
                <td class="px-4 py-3.5 text-right">
                  {#if tx.status === 'completed'}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completed
                    </span>
                  {:else if tx.status === 'pending'}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {tx.status}
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<!-- Floating Notification Toast -->
{#if showAlert}
  <div class="fixed bottom-6 right-6 max-w-md z-50 transition-all duration-300">
    <div
      class={`rounded-xl border backdrop-blur-md shadow-xl p-4 flex items-start gap-3.5 ${
        alertSuccess
          ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-200'
          : 'bg-slate-900/95 border-rose-500/40 text-rose-200'
      }`}
    >
      <div class="shrink-0 mt-0.5">
        {#if alertSuccess}
          <div class="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        {:else}
          <div class="p-1 rounded-full bg-rose-500/20 text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        {/if}
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-sm">
          {alertSuccess ? 'Request Submitted' : 'Authorization Error'}
        </h3>
        <p class="text-xs text-slate-300 mt-1 leading-relaxed">
          {alertMessage}
        </p>
      </div>

      <button
        type="button"
        onclick={() => (showAlert = false)}
        class="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
      >
        ✕
      </button>
    </div>
  </div>
{/if}
