<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";

  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Grab stored cards from route data (with fallback empty array)
  let cards = $derived(data.card ?? []);

  let copiedId = $state("");
  let deletingId = $state(null);
  let errorMessage = $state("");

  // Helper to format 16-digit card numbers with spaces (e.g., 4532 **** **** 8892)
  function formatCardNumber(cardno, mask = true) {
    if (!cardno) return "•••• •••• •••• ••••";
    const clean = cardno.replace(/\D/g, "");
    if (mask && clean.length >= 12) {
      const firstFour = clean.slice(0, 4);
      const lastFour = clean.slice(-4);
      return `${firstFour} •••• •••• ${lastFour}`;
    }
    return clean.replace(/(.{4})/g, "$1 ").trim();
  }

  // Detect card brand based on starting digits
  function getCardBrand(cardno) {
    if (!cardno) return "Generic";
    const clean = cardno.replace(/\D/g, "");
    if (/^4/.test(clean)) return "Visa";
    if (/^5[1-5]|^2[2-7]/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "Amex";
    if (/^6(?:011|5)/.test(clean)) return "Discover";
    return "Card";
  }

  async function copyToClipboard(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      copiedId = id;
      setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch (err) {
      console.error("Failed to copy card details:", err);
    }
  }

  async function handleDeleteCard(id) {
    if (!confirm("Are you sure you want to remove this payment card?")) return;
    
    deletingId = id;
    errorMessage = "";

    try {
      const { error } = await supabase
        .from("card")
        .delete()
        .eq("id", id);

      if (error) throw error;
      // Triggers Svelte parent invalidation/refresh automatically if set up in SvelteKit
    } catch (err) {
      console.error("Error deleting card:", err);
      errorMessage = err.message || "Failed to remove card.";
    } finally {
      deletingId = null;
    }
  }
</script>

<div class="max-w-6xl mx-auto space-y-8 p-2 sm:p-4">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-100 tracking-tight">Stored Cards</h1>
      <p class="text-sm text-gray-400 mt-1">Manage your saved credit and debit payment methods</p>
    </div>
  </div>

  {#if errorMessage}
    <div class="p-4 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl">
      {errorMessage}
    </div>
  {/if}

  <!-- Empty State -->
  {#if cards.length === 0}
    <Card class="bg-slate-900/60 border-slate-800 backdrop-blur-md text-center py-12 px-4">
      <CardContent class="space-y-4">
        <div class="mx-auto w-12 h-12 bg-slate-800 text-gray-400 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-200">No stored cards found</h3>
          <p class="text-sm text-gray-400 max-w-sm mx-auto mt-1">
            You haven't saved any payment cards yet. Cards added during deposit will appear here.
          </p>
        </div>
       
      </CardContent>
    </Card>
  {:else}
    <!-- Grid of Visual Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each cards as card (card.id || card.cardno)}
        {@const brand = getCardBrand(card.cardno)}
        
        <div class="relative group rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-slate-700 shadow-xl transition-all duration-300 flex flex-col justify-between h-56 overflow-hidden">
          
          <!-- Background Glow Effect -->
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-colors"></div>

          <!-- Card Top Row: Chip & Brand Logo -->
          <div class="flex items-center justify-between z-10">
            <!-- Simulated EMV Chip -->
            <div class="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 flex flex-col justify-between border border-amber-200/50 shadow-inner">
              <div class="w-full h-[1px] bg-amber-900/40"></div>
              <div class="w-full h-[1px] bg-amber-900/40"></div>
              <div class="w-full h-[1px] bg-amber-900/40"></div>
            </div>

            <!-- Card Brand Label -->
            <span class="text-sm font-black italic tracking-wider text-slate-300 uppercase bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
              {brand}
            </span>
          </div>

          <!-- Card Center: Formatted Card Number -->
          <div class="z-10 my-2">
            <span class="block text-xs uppercase tracking-widest text-slate-500 mb-1 font-semibold">Card Number</span>
            <p class="font-mono text-lg sm:text-xl font-bold text-slate-100 tracking-wider">
              {formatCardNumber(card.cardno, true)}
            </p>
          </div>

          <!-- Card Bottom Row: Holder Name, Expiry & CVV -->
          <div class="flex items-end justify-between z-10 pt-2 border-t border-slate-800/60">
            <div>
              <span class="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Cardholder</span>
              <p class="text-sm font-semibold text-slate-200 truncate max-w-[150px]">
                {card.user || "Valued Customer"}
              </p>
            </div>

            <div class="flex gap-4 text-right">
              <div>
                <span class="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Expires</span>
                <p class="text-sm font-mono font-semibold text-slate-300">
                  {card.expiry_date || "MM/YY"}
                </p>
              </div>

              {#if card.cvv}
                <div>
                  <span class="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">CVV</span>
                  <p class="text-sm font-mono font-semibold text-amber-400">
                    {card.cvv}
                  </p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Hover Quick Actions overlay -->
          <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-20">
            <button
              onclick={() => copyToClipboard(card.cardno, card.id || card.cardno)}
              class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Copy Full Card Number"
            >
              {#if copiedId === (card.id || card.cardno)}
                <span class="text-[10px] font-bold text-emerald-400 px-1">Copied!</span>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376a48.11 48.11 0 0 0 3.478-.397m-3.478.397a48.309 48.309 0 0 1-3.478.397m0 0a3 3 0 0 0-3-2.895V4.875c0-.621.504-1.125 1.125-1.125h9.75a1.125 1.125 0 0 1 1.125 1.125V12.75c0 .621-.504 1.125-1.125 1.125h-.375" />
                </svg>
              {/if}
            </button>

            {#if card.id}
              <button
                onclick={() => handleDeleteCard(card.id)}
                disabled={deletingId === card.id}
                class="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-lg border border-rose-800/40 transition-colors"
                title="Delete Card"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            {/if}
          </div>

        </div>
      {/each}
    </div>

    <!-- Details Table -->
    <Card class="bg-slate-900/60 border-slate-800 backdrop-blur-md mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold text-gray-100">Card Registry Details</CardTitle>
      </CardHeader>
      <CardContent class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-300">
          <thead class="bg-slate-950 text-xs uppercase font-semibold text-gray-400 border-b border-slate-800">
            <tr>
              <th class="px-4 py-3.5">Brand</th>
              <th class="px-4 py-3.5">Cardholder</th>
              <th class="px-4 py-3.5">Card Number</th>
              <th class="px-4 py-3.5">Expires</th>
              <th class="px-4 py-3.5">CVV</th>
              <th class="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {#each cards as card}
              <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3 font-semibold text-slate-200">
                  {getCardBrand(card.cardno)}
                </td>
                <td class="px-4 py-3 font-medium text-slate-300">
                  {card.user || "N/A"}
                </td>
                <td class="px-4 py-3 font-mono text-xs">
                  {formatCardNumber(card.cardno, true)}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-slate-300">
                  {card.expiry_date || "--/--"}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-amber-400">
                  {card.cvv || "---"}
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    onclick={() => copyToClipboard(card.cardno, card.id || card.cardno)}
                    class="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                  >
                    {copiedId === (card.id || card.cardno) ? "Copied" : "Copy"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </CardContent>
    </Card>
  {/if}
</div>
