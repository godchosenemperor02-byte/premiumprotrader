<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Dynamic Invalidation
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Derived state array fallback
  let cards = $derived(Array.isArray(data?.card) ? data.card : []);
  let cardsCount = $derived(cards.length);

  // Interactivity & Modal States
  let copiedId = $state("");
  let deletingCard = $state(null);
  let isDeleteOpen = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state("");

  // Format 16-digit card numbers with masking (e.g., 4532 •••• •••• 8892)
  function formatCardNumber(cardno, mask = true) {
    if (!cardno) return "•••• •••• •••• ••••";
    const clean = String(cardno).replace(/\D/g, "");
    if (mask && clean.length >= 12) {
      const firstFour = clean.slice(0, 4);
      const lastFour = clean.slice(-4);
      return `${firstFour} •••• •••• ${lastFour}`;
    }
    return clean.replace(/(.{4})/g, "$1 ").trim();
  }

  // Detect card brand based on starting digits
  function getCardBrand(cardno) {
    if (!cardno) return "CARD";
    const clean = String(cardno).replace(/\D/g, "");
    if (/^4/.test(clean)) return "VISA";
    if (/^5[1-5]|^2[2-7]/.test(clean)) return "MASTERCARD";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^6(?:011|5)/.test(clean)) return "DISCOVER";
    return "CARD";
  }

  async function copyToClipboard(text, id) {
    if (!text) return;
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

  function openDeleteModal(card) {
    deletingCard = card;
    errorMessage = "";
    isDeleteOpen = true;
  }

  function closeDeleteModal() {
    isDeleteOpen = false;
    deletingCard = null;
    errorMessage = "";
    isLoading = false;
  }

  async function handleDeleteCard() {
    if (!deletingCard?.id || !supabase) return;

    isLoading = true;
    errorMessage = "";

    try {
      const { error } = await supabase
        .from("card")
        .delete()
        .eq("id", deletingCard.id);

      if (error) throw error;

      await invalidateAll();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting card:", err);
      errorMessage = err?.message || "Failed to remove card. Please try again.";
      isLoading = false;
    }
  }
</script>

<div class="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans antialiased text-zinc-100">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800/60">
    <div class="space-y-1">
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">Stored Payment Cards</h2>
      <p class="text-sm text-zinc-400">Manage and view your registered payment methods for active subscriptions.</p>
    </div>
  </div>

  {#if errorMessage && !isDeleteOpen}
    <div class="p-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
      {errorMessage}
    </div>
  {/if}

  <!-- Empty State -->
  {#if cardsCount === 0}
    <div class="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm space-y-4 shadow-xl">
      <div class="w-12 h-12 bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white">No Stored Cards Found</h3>
        <p class="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
          You haven't saved any payment cards yet. Any cards used during deposit or checkout will automatically appear here.
        </p>
      </div>
    </div>
  {:else}
    <!-- Grid of Visual Credit Cards -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">Active Cards ({cardsCount})</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each cards as card (card.id || card.cardno)}
          {@const brand = getCardBrand(card.cardno)}
          {@const cardIdKey = card.id || card.cardno}

          <div class="relative group rounded-2xl p-6 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-zinc-700 shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-56 overflow-hidden">
            <!-- Background Radial Glow -->
            <div class="absolute -right-12 -bottom-12 w-44 h-44 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-colors pointer-events-none"></div>

            <!-- Card Top Bar: EMV Chip & Brand Badge -->
            <div class="flex items-center justify-between z-10">
              <!-- Simulated EMV Chip -->
              <div class="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 flex flex-col justify-between border border-amber-200/40 shadow-md">
                <div class="w-full h-[1px] bg-amber-900/40"></div>
                <div class="w-full h-[1px] bg-amber-900/40"></div>
                <div class="w-full h-[1px] bg-amber-900/40"></div>
              </div>

              <!-- Brand Tag -->
              <span class="text-[11px] font-black italic tracking-widest text-zinc-200 uppercase bg-zinc-800/80 px-3 py-1 rounded-lg border border-zinc-700/60 shadow-sm">
                {brand}
              </span>
            </div>

            <!-- Card Middle: Number -->
            <div class="z-10 my-2">
              <span class="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Card Number</span>
              <p class="font-mono text-lg sm:text-xl font-bold text-white tracking-widest">
                {formatCardNumber(card.cardno, true)}
              </p>
            </div>

            <!-- Card Bottom: Cardholder, Expiry, CVV -->
            <div class="flex items-end justify-between z-10 pt-3 border-t border-zinc-800/80">
              <div>
                <span class="block text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Cardholder</span>
                <p class="text-xs font-semibold text-zinc-200 truncate max-w-[130px]">
                  {card.user || "Valued Customer"}
                </p>
              </div>

              <div class="flex gap-4 text-right">
                <div>
                  <span class="block text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Expires</span>
                  <p class="text-xs font-mono font-semibold text-zinc-300">
                    {card.expiry_date || "MM/YY"}
                  </p>
                </div>

                {#if card.cvv}
                  <div>
                    <span class="block text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">CVV</span>
                    <p class="text-xs font-mono font-semibold text-amber-400">
                      {card.cvv}
                    </p>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Hover Quick Action Overlay Buttons -->
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-20">
              <button
                onclick={() => copyToClipboard(card.cardno, cardIdKey)}
                class="p-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg border border-zinc-700/50 shadow-md transition-colors"
                title="Copy Full Card Number"
              >
                {#if copiedId === cardIdKey}
                  <span class="text-[10px] font-bold text-emerald-400 px-1">Copied!</span>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376a48.11 48.11 0 0 0 3.478-.397m-3.478.397a48.309 48.309 0 0 1-3.478.397m0 0a3 3 0 0 0-3-2.895V4.875c0-.621.504-1.125 1.125-1.125h9.75a1.125 1.125 0 0 1 1.125 1.125V12.75c0 .621-.504 1.125-1.125 1.125h-.375" />
                  </svg>
                {/if}
              </button>

              {#if card.id}
                <button
                  onclick={() => openDeleteModal(card)}
                  class="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 rounded-lg border border-rose-500/30 shadow-md transition-colors"
                  title="Remove Card"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Registry Details Table -->
    <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md space-y-0 mt-8">
      <div class="p-6 border-b border-zinc-800/80">
        <h3 class="text-lg font-bold text-white">Card Registry Details</h3>
        <p class="text-xs text-zinc-400 mt-0.5">Comprehensive view of all stored card raw fields.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-zinc-300">
          <thead class="bg-zinc-950/80 text-[10px] uppercase tracking-wider font-bold text-zinc-400 border-b border-zinc-800">
            <tr>
              <th class="px-6 py-3.5">Brand</th>
              <th class="px-6 py-3.5">Cardholder</th>
              <th class="px-6 py-3.5">Card Number</th>
              <th class="px-6 py-3.5">Expires</th>
              <th class="px-6 py-3.5">CVV</th>
              <th class="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            {#each cards as card}
              {@const cardIdKey = card.id || card.cardno}
              <tr class="hover:bg-zinc-800/30 transition-colors">
                <td class="px-6 py-4 font-semibold text-zinc-200 text-xs">
                  {getCardBrand(card.cardno)}
                </td>
                <td class="px-6 py-4 font-medium text-zinc-300 text-xs">
                  {card.user || "N/A"}
                </td>
                <td class="px-6 py-4 font-mono text-xs text-zinc-200">
                  {formatCardNumber(card.cardno, true)}
                </td>
                <td class="px-6 py-4 font-mono text-xs text-zinc-400">
                  {card.expiry_date || "--/--"}
                </td>
                <td class="px-6 py-4 font-mono text-xs text-amber-400">
                  {card.cvv || "---"}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    onclick={() => copyToClipboard(card.cardno, cardIdKey)}
                    class="text-xs text-blue-400 hover:text-blue-300 font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                  >
                    {copiedId === cardIdKey ? "Copied" : "Copy"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<!-- DELETE CONFIRMATION MODAL -->
{#if isDeleteOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-rose-400">
        <div class="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0l-10.998 19.24c-.865 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Remove Payment Card</h3>
      </div>

      {#if errorMessage}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <p class="text-xs text-zinc-400 leading-relaxed">
        Are you sure you want to remove card ending in <span class="text-zinc-200 font-mono font-bold">{deletingCard?.cardno ? String(deletingCard.cardno).slice(-4) : '••••'}</span>? This payment method will no longer be available for transactions.
      </p>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          onclick={closeDeleteModal} 
          disabled={isLoading}
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onclick={handleDeleteCard} 
          disabled={isLoading}
          class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-rose-500/10 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Removing...</span>
          {:else}
            <span>Remove Card</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
