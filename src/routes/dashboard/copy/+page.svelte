<script>
  import { invalidateAll } from '$app/navigation';

  // Svelte 5 Runes Props & Safe Derived Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Copy Action Feedback State
  let copyLoading = $state('');
  let copyError = $state('');
  let copySuccess = $state('');

  // Helper to get initials safely
  function getInitials(name) {
    if (!name) return 'EX';
    const trimmed = name.trim();
    if (trimmed.length === 1) return trimmed.toUpperCase();
    return (trimmed[0] + trimmed[trimmed.length - 1]).toUpperCase();
  }

  // --- COPY TRADER ACTION LOGIC ---
  async function handleCopyTrader(expert) {
    if (!supabase) return;

    copyError = '';
    copySuccess = '';
    copyLoading = expert.name;

    const profile = data?.profile;
    const currentCapital = Number(profile?.capital ?? 0);
    const copyPrice = Number(expert.copy_price ?? 0);

    // 1. Validate sufficient funds
    if (currentCapital < copyPrice) {
      copyError = `Insufficient funds. You need ${profile?.currency || '$'}${copyPrice.toLocaleString()} to copy ${expert.name}, but your current balance is ${profile?.currency || '$'}${currentCapital.toLocaleString()}.`;
      copyLoading = '';
      return;
    }

    // 2. Perform the database update
    const newCapital = currentCapital - copyPrice;

    const { error } = await supabase
      .from('profiles')
      .update({
        capital: newCapital,
        copied_expert: expert.name
      })
      .eq('id', profile.id);

    copyLoading = '';

    if (error) {
      copyError = error.message;
      return;
    }

    copySuccess = `Successfully started copying ${expert.name}!`;
    await invalidateAll();
  }
</script>

<!-- Trader Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
  {#each data.experts ?? [] as expert}
    {@const isCopied = expert.name?.trim() === data.profile?.copied_expert?.trim()}
    {@const isLoading = copyLoading === expert.name}
    {@const copyPrice = Number(expert.copy_price ?? 0)}

    <article
      class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-gray-700 hover:shadow-xl hover:shadow-black/20"
    >
      <!-- Subtle top accent -->
      <div class="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-60"></div>

      <div class="flex flex-1 flex-col p-5 sm:p-6">

        <!-- Trader Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3.5">

            <!-- Trader Image -->
            <div class="relative shrink-0">
              <div
                class="h-14 w-14 overflow-hidden rounded-full border-2 border-gray-700 bg-gray-800 ring-4 ring-gray-950/30"
              >
                {#if expert.image_url}
                  <img
                    src={expert.image_url}
                    alt={expert.name ? `${expert.name} profile` : 'Trader profile'}
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                {:else}
                  <div class="flex h-full w-full items-center justify-center">
                    <span class="text-sm font-bold text-gray-300">
                      {getInitials(expert.name)}
                    </span>
                  </div>
                {/if}
              </div>

              <!-- Verified Badge -->
              <div
                class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-900 bg-blue-500 text-white"
                title="Verified trader"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-3 w-3"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-3.073a.75.75 0 0 0-1.06-1.06l-3.5 3.5-1.25-1.25a.75.75 0 1 0-1.06 1.06l1.78 1.78a.75.75 0 0 0 1.06 0l4.03-4.03Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Name -->
            <div class="min-w-0">
              <h3 class="truncate text-base font-bold tracking-tight text-white">
                {expert.name}
              </h3>

              <div class="mt-1 flex items-center gap-1.5">
                <span class="text-xs text-gray-500">Expert Trader</span>
                <span class="h-1 w-1 rounded-full bg-gray-700"></span>
                <span class="text-xs font-medium text-blue-400">Verified</span>
              </div>
            </div>
          </div>

          <!-- Risk -->
          <span
            class="shrink-0 rounded-lg border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400"
          >
            Low Risk
          </span>
        </div>

        <!-- Description -->
        <p class="mt-5 line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-400">
          {expert.description || 'Professional trader with a consistent trading strategy.'}
        </p>

        <!-- Main Performance -->
        <div class="mt-5 grid grid-cols-2 gap-3">

          <!-- Monthly Return -->
          <div class="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Monthly Return
              </span>

              <span class="text-emerald-500/70">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-3.5 w-3.5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 17a.75.75 0 0 0 .75-.75V5.56l2.72 2.72a.75.75 0 1 0 1.06-1.06l-4-4a.75.75 0 0 0-1.06 0l-4 4a.75.75 0 1 0 1.06 1.06l2.72-2.72v10.69A.75.75 0 0 0 10 17Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <p class="mt-1.5 font-mono text-xl font-bold text-emerald-400">
              {expert.monthly_returns}
            </p>
          </div>

          <!-- Win Rate -->
          <div class="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] p-3.5">
            <span class="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Win Rate
            </span>

            <p class="mt-1.5 font-mono text-xl font-bold text-blue-400">
              {expert.winrate}
            </p>
          </div>
        </div>

        <!-- Secondary Stats -->
        <div class="mt-4 grid grid-cols-3 divide-x divide-gray-800 rounded-xl border border-gray-800 bg-gray-950/40 py-3.5">

          <div class="px-2 text-center">
            <p class="text-[10px] uppercase tracking-wider text-gray-600">
              Followers
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-200">
              {expert.followers ?? 0}
            </p>
          </div>

          <div class="px-2 text-center">
            <p class="text-[10px] uppercase tracking-wider text-gray-600">
              Trades
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-200">
              {expert.trades ?? 0}
            </p>
          </div>

          <div class="px-2 text-center">
            <p class="text-[10px] uppercase tracking-wider text-gray-600">
              Copy Fee
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-200">
              {data.profile?.currency || '$'}{copyPrice.toLocaleString()}
            </p>
          </div>

        </div>

        <!-- Spacer keeps buttons aligned -->
        <div class="flex-1"></div>

        <!-- CTA -->
        <div class="mt-5">

          {#if isCopied}

            <button
              disabled
              class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm font-semibold text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.91 3.91 7.48-9.35a.75.75 0 0 1 1.034-.127Z"
                  clip-rule="evenodd"
                />
              </svg>
              Already Copying
            </button>

          {:else}

            <button
              onclick={() => handleCopyTrader(expert)}
              disabled={isLoading || !!copyLoading}
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {#if isLoading}
                <svg
                  class="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4Z"
                  ></path>
                </svg>
                Processing...
              {:else}
                Copy Trader

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.25 10a.75.75 0 0 1 .75-.75h10.19l-2.22-2.22a.75.75 0 1 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06l2.22-2.22H4a.75.75 0 0 1-.75-.75Z"
                    clip-rule="evenodd"
                  />
                </svg>
              {/if}
            </button>

          {/if}

        </div>

      </div>
    </article>
  {/each}
</div>
