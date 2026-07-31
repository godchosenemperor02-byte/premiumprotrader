<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";

  let isvisible = $state(false);
  let { data } = $props();
  let amount = $state('0');
  let selectedMethod = $state('BTC');
  let copiedAddress = $state('');

  async function copyAddress(address) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
        copiedAddress = address;
        setTimeout(() => {
          if (copiedAddress === address) copiedAddress = '';
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }

  const stats = [
    { label: "Total Balance", value: data.profile.balance, change: "+12.4%", up: true },
    { label: "Profits", value: data.profile.profit, change: "+8.2%", up: true },
    { label: "Capital", value: data.profile.capital, change: "91.9%", up: true },
  ];

  const crypto = [
    { label: 'BTC', name: 'Bitcoin', address: 'bc1qmp3dlrz3pleqg8q3dc29j7cggkgq3c4y48l6qh' },
    { label: 'ETH', name: 'Ethereum', address: '0x720e753A42D6Cd28E2CDa1a226573a55d7e475Db' },
    { label: 'BTC CASH', name: 'Bitcoin Cash', address: 'qpczgu7tyyx2lumy7kj3gsmusqwckmw67uhu3298t4' },
    { label: 'BNB SMART CHAIN', name: 'BNB Smart Chain', address: '0x720e753A42D6Cd28E2CDa1a226573a55d7e475Db' }
  ];

  const showModal = () => {
    isvisible = !isvisible;
  };
</script>

<div>
  <h1 class="text-gray-200 text-3xl font-bold my-1">Deposit</h1>
  <p class="text-[15px] text-gray-400 my-1">Manage and monitor your deposits</p>
</div>

<!-- Stats Grid -->
<div class="grid gap-4 md:grid-cols-3 my-4">
  {#each stats as stat}
    <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-[10px] font-bold uppercase tracking-wider text-[#8e90a0]">{stat.label}</CardTitle>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-[#444654]">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">{stat.value}</div>
        <p class="text-xs mt-1 font-medium {stat.up ? 'text-green-500' : 'text-red-500'}">
          {stat.change} <span class="text-[#444654] font-normal">from last session</span>
        </p>
      </CardContent>
    </Card>
  {/each}
</div>

<!-- Transaction Input Card -->
<Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm my-5">
  <CardHeader>
    <CardTitle class="text-2xl text-gray-200">Transactions</CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    <div>
      <label for="deposit-amount" class="block text-sm font-medium text-gray-300 mb-1">Amount ({data.profile.currency}):</label>
      <input 
        id="deposit-amount"
        type="number" 
        class="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder-gray-500" 
        placeholder="0.00" 
        bind:value={amount}
      />
    </div>

    <div>
      <label for="payment-method" class="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
      <select 
        id="payment-method"
        class="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
        bind:value={selectedMethod}
      >
        <option value="CARD">Credit / Debit Card</option>
        <option value="BTC">BTC</option>
        <option value="ETH">Ethereum</option>
        <option value="BTC CASH">BTC Cash</option>
        <option value="BNB SMART CHAIN">BNB Smart Chain</option>
      </select>
    </div>

    <Button class="bg-amber-400 text-black w-full text-[15px] font-bold py-3 hover:bg-amber-500 transition-colors" onclick={showModal}>
      ↗ Deposit Funds
    </Button>
  </CardContent>
</Card>

<!-- Deposit Modal Overlay -->
{#if isvisible}
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center overflow-y-auto p-4 sm:p-6">
    <div class="relative bg-[#111827] border border-gray-800 w-full max-w-3xl rounded-2xl p-6 sm:p-8 my-auto shadow-2xl">
      
      <!-- Close Button -->
      <button 
        type="button"
        aria-label="Close deposit modal"
        class="absolute top-5 right-5 text-gray-400 hover:text-white p-1 transition-colors" 
        onclick={showModal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="mb-6">
        <h2 class="text-gray-50 text-2xl sm:text-3xl font-bold">Deposit Funds</h2>
        <p class="text-gray-400 text-sm mt-1">Complete your deposit via your selected method</p>
      </div>

      <div class="space-y-6">
        <!-- Security Banner -->
        <div class="border border-amber-500/30 bg-amber-500/10 text-gray-300 text-sm p-4 rounded-xl">
          <h6 class="text-amber-400 font-bold flex items-center gap-1.5 mb-1">
            <span>🔐</span> Security Notice
          </h6>
          All payment information you submit is encrypted and processed through our secure compliance system.
        </div>

        <!-- Deposit Summary -->
        <div class="border border-amber-500/30 bg-gray-900/60 text-gray-300 p-4 rounded-xl text-center">
          <span class="text-xs uppercase tracking-wider font-semibold text-gray-400">Deposit Amount</span>
          <p class="text-3xl font-bold text-green-400 mt-1">{data.profile.currency} {amount}</p>
        </div>

        <!-- Card Payment Section -->
        {#if selectedMethod === 'CARD'}
          <div class="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-50">Credit/Debit Card</h3>
                <p class="text-xs text-gray-400">Pay directly with card</p>
              </div>
            </div>

            <form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
              <div>
                <label for="card-number" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Card Number</label>
                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label for="cardholder-name" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                <input type="text" id="cardholder-name" placeholder="John Doe" class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="expiry-date" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input type="text" id="expiry-date" placeholder="MM/YY" class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label for="cvv" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">CVV</label>
                  <input type="text" id="cvv" placeholder="123" class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <button type="submit" class="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm">
                Confirm Card Payment
              </button>
            </form>
          </div>
        {/if}

        <!-- Crypto Wallet Address List -->
        {#each crypto as currency}
          {#if selectedMethod === 'ALL' || selectedMethod === currency.label}
            <div class="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 text-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2.5 bg-blue-950/60 border border-blue-800/50 text-blue-400 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6A2.25 2.25 0 0 0 18.75 20H5.25A2.25 2.25 0 0 0 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold">{currency.label} Address</h3>
                  <p class="text-xs text-gray-400">Network: <span class="text-blue-400">Native</span></p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl">
                  <span class="block text-sm font-mono text-gray-200 select-all break-all">{currency.address}</span>
                </div>

                <button 
                  type="button" 
                  onclick={() => copyAddress(currency.address)}
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376a48.11 48.11 0 0 0 3.478-.397m-3.478.397a48.309 48.309 0 0 1-3.478.397m0 0a3 3 0 0 0-3-2.895V4.875c0-.621.504-1.125 1.125-1.125h9.75a1.125 1.125 0 0 1 1.125 1.125V12.75c0 .621-.504 1.125-1.125 1.125h-.375" />
                  </svg>
                  {copiedAddress === currency.address ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>
          {/if}
        {/each}

        <!-- External On-ramp Providers -->
        <div class="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 text-gray-100">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-200">Buy Crypto with External Providers</h3>
            <p class="text-xs text-gray-400 mt-0.5">Purchase crypto directly via verified partner integrations.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {#each [
              { name: 'Bitso', url: 'https://bitso.com' },
              { name: 'Paybis', url: 'https://paybis.com' },
              { name: 'Banxa', url: 'https://banxa.com' },
              { name: 'Moonpay', url: 'https://www.moonpay.com' }
            ] as provider}
              <a 
                href={provider.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all"
              >
                <span>Buy with {provider.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
