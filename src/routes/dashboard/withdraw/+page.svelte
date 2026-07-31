<script>
  let { data } = $props();
  let code = $state(null);
  let showAlert = $state(false);
  let selectedMethod = $state(""); // Track selected withdrawal method
  let accountNumber = $state("");
  let walletAddress = $state("");
  let amount = $state("");

  let handleSubmit = (event) => {
    event.preventDefault();
    showAlert = true;
    setTimeout(() => {
      showAlert = false;
    }, 5000);
  };
</script> 

{#if showAlert}
  <div class="w-full max-w-2xl mx-auto my-4 rounded-lg border px-4 py-3 shadow-sm fixed bottom-4 inset-x-0 z-50
  {code === 'ingo4579#'
    ? 'bg-green-50 border-green-400 text-green-800'
    : 'bg-red-50 border-red-400 text-red-800'}">
    <div class="flex items-start gap-3">
      <span class="mt-0.5 text-lg">
        {code === 'ingo4579#' ? '✅' : '⚠️'}
      </span>
      <p class="font-medium text-sm sm:text-base">
        {#if code === 'ingo4579#'}
          Your request is being processed. Contact your account manager for more details.
        {:else}
          Invalid or unrecognized code. Please contact your account manager.
        {/if}
      </p>
    </div>
  </div>
{/if}

<div class="max-w-4xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-gray-100">
  <!-- Title Block -->
  <div class="border-b border-gray-800 pb-5 mb-6">
    <h2 class="text-2xl font-bold tracking-tight text-white">Withdraw Funds</h2>
    <p class="text-sm text-gray-400 mt-1">Withdraw your investment profits or available balance</p>
  </div>

  <!-- Available Balance Alert Row -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
    <div class="md:col-span-1 bg-gray-900 border border-gray-800 p-5 rounded-xl flex flex-col justify-center">
      <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Balance</span>
      <span class="text-2xl font-mono font-bold text-emerald-400 mt-1">{data.profile.currency} {data.profile.balance}</span>
    </div>
    
    <div class="md:col-span-2 flex items-start gap-3 bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 text-sm text-blue-300">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <span>Please ensure your withdrawal details are correct before submitting. All requests are manually reviewed.</span>
    </div>
  </div>

  <!-- Form Layout -->
  <div class="bg-gray-900/50 border border-gray-800 rounded-xl p-5 sm:p-6 mb-8">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-200">Request Withdrawal</h3>
      <p class="text-xs text-gray-400 mt-0.5">Fill in the form below to request a withdrawal</p>
    </div>

    <form class="space-y-5" onsubmit={handleSubmit}>
      <!-- Grid Fields -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Method Selector -->
        <div>
          <label for="method" class="block text-sm font-medium text-gray-300 mb-2">Withdrawal Method</label>
          <div class="relative">
            <select 
              id="method"
              bind:value={selectedMethod}
              class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled selected>Select method</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Debit/Credit Card</option>
              <option value="btc">Bitcoin</option>
              <option value="usdt">USDT</option>
              <option value="eth">Ethereum</option>
            </select>
            <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Amount Field -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-300 mb-2">Withdrawal Amount (USD) <span class="text-red-400">*</span></label>
          <input 
            id="amount"
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            bind:value={amount}
            class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            required
          >
        </div>
      </div>

      <!-- Dynamic Conditional Fields -->
      {#if selectedMethod === 'bank'}
        <div>
          <label for="accountNumber" class="block text-sm font-medium text-gray-300 mb-2">Bank Account Number <span class="text-red-400">*</span></label>
          <input 
            id="accountNumber"
            type="text" 
            placeholder="Enter your account number" 
            bind:value={accountNumber}
            class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
            required
          />
        </div>
      {:else if ['btc', 'usdt', 'eth'].includes(selectedMethod)}
        <div>
          <label for="walletAddress" class="block text-sm font-medium text-gray-300 mb-2">
            {selectedMethod.toUpperCase()} Wallet Address <span class="text-red-400">*</span>
          </label>
          <input 
            id="walletAddress"
            type="text" 
            placeholder={`Enter your ${selectedMethod.toUpperCase()} wallet address`} 
            bind:value={walletAddress}
            class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono text-sm"
            required
          />
        </div>
      {/if}

      <!-- Withdrawal Code Block -->
      <div>
        <label for="code" class="block text-sm font-medium text-gray-300 mb-2">Withdrawal Code <span class="text-red-400">*</span></label>
        <input 
          id="code"
          type="text"
          bind:value={code}
          placeholder="Enter authorization code"
          class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
          required
        >
        <!-- Notice Label -->
        <div class="flex items-center gap-2 mt-2 text-xs text-amber-500/90">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>Please contact support to request your withdrawal code.</span>
        </div>
      </div>

      <!-- Password Validation -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password <span class="text-red-400">*</span></label>
        <input 
          id="password"
          type="password" 
          placeholder="••••••••" 
          class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          required
        >
        <p class="text-xs text-gray-500 mt-1.5">For security purposes, please enter your account password to confirm this withdrawal</p>
      </div>

      <!-- State Action Button -->
      <button 
        type="submit" 
        class="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl tracking-wide transition-all cursor-pointer shadow-lg shadow-blue-900/20"
      >
        Withdraw
      </button>
    </form>
  </div>
</div>
