<script>
    let {data} = $props()
</script>
<div class="max-w-6xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-gray-100">
  <!-- Top Navigation / Breadcrumb Row -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6 mb-8">
    <div>
      <h2 class="text-3xl font-extrabold tracking-tight text-white">Explore Traders</h2>
      <p class="text-sm text-gray-400 mt-1">Browse and follow top performing traders to copy their strategies</p>
    </div>
    <!-- Action Buttons -->
    <div class="flex items-center gap-3">
      <button class="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-sm font-semibold text-gray-300 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20c-2.034 0-3.955-.533-5.63-1.468M14.214 16.058A8.17 8.17 0 0 1 15 14.5M10.089 20a11.386 11.386 0 0 1-4.875-1.144M10.089 20v-.109m0-.109a11.386 11.386 0 0 1-4.875-1.144M3 17.25a4.125 4.125 0 0 1 7.533-2.493M12 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        Traders ({data.experts?.length})
      </button>
    </div>
  </div>

  <!-- Available Balance Alert Strip -->
  <div class="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl mb-8">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6A2.25 2.25 0 0 1 18.75 20H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      </div>
      <div>
        <p class="text-xs text-gray-400 font-medium">Your Available Balance</p>
        <p class="text-sm font-mono font-bold text-emerald-400 mt-0.5">{data.profile.currency} {data.profile.balance}</p>
      </div>
    </div>
    <span class="text-sm bg-blue-950 px-3.5 py-1 rounded-md text-gray-200 border border-gray-800/80">Ready to copy</span>
  </div>
  <div class="grid md:grid-cols-3 gap-4">
{#each data.experts as expert}
  <!-- Single Trader Card Display Container -->
  <div class="max-w-xl">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5 sm:p-6 transition-all hover:border-gray-700/80">
      
      <!-- Card Header: Avatar & Badges -->
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex items-center gap-3.5">
          <!-- User Avatar Frame -->
          <div class="relative">
            <div class="w-14 h-14 rounded-full bg-gray-800 border-2 border-blue-500/30 overflow-hidden flex items-center justify-center text-gray-300 font-bold text-lg">
           <span>{expert.name[0].toUpperCase() + expert.name.at(-1).toUpperCase()}</span>
            </div>
            <div class="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-gray-900">
              <!-- Verified Check -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                <path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-3.073a.75.75 0 0 0-1.06-1.06l-3.5 3.5-1.25-1.25a.75.75 0 1 0-1.06 1.06l1.78 1.78a.75.75 0 0 0 1.06 0l4.03-4.03Z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <h4 class="text-lg font-bold text-white tracking-tight">{expert.name}</h4>
            <span class="inline-flex items-center text-xs font-semibold text-blue-400 mt-0.5">Crypto, Forex</span>
          </div>
        </div>
        
        <!-- Risk level Badge -->
        <span class="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
          Low Risk
        </span>
      </div>

      <!-- Description Text -->
      <p class="text-sm text-gray-400 leading-relaxed mb-6">
       {expert.description}
      </p>

      <!-- Key Performance Metrics Row -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Return Metric -->
        <div class="bg-gray-950/40 border border-gray-800 p-3.5 rounded-xl">
          <span class="block text-xs font-medium text-gray-500">Monthly Return</span>
          <span class="block text-lg font-bold text-emerald-400 font-mono mt-0.5">{expert.monthly_returns}</span>
        </div>
        <!-- Win Rate Metric -->
        <div class="bg-gray-950/40 border border-gray-800 p-3.5 rounded-xl">
          <span class="block text-xs font-medium text-gray-500">Win Rate</span>
          <span class="block text-lg font-bold text-blue-400 font-mono mt-0.5">{expert.winrate}</span>
        </div>
      </div>

      <!-- General Statistics Grid -->
      <div class="grid grid-cols-3 gap-3 border-t border-gray-800/80 pt-5 mb-6 text-center">
        <div>
          <span class="block text-xs text-gray-500">Followers</span>
          <span class="block text-sm font-semibold text-gray-200 mt-1">{expert.followers}</span>
        </div>
        <div>
          <span class="block text-xs text-gray-500">Trades</span>
          <span class="block text-sm font-semibold text-gray-200 mt-1">{expert.trades}</span>
        </div>
        <div>
          <span class="block text-xs text-gray-500">Copy Price</span>
          <span class="block text-sm font-semibold text-gray-200 font-mono mt-1">${expert.copy_price}</span>
        </div>
      </div>

      <!-- Call to Actions -->
      {#if expert.name == data.profile.copied_expert?.trim()} 
        <!-- Error / Alert status: Insufficient Balance -->
        <button class="w-full px-4 py-2.5 text-sm bg-gray-600 text-white font-semibold rounded-xl cursor-not-allowed">
          Already Copying..
        </button>
        {:else}
       <a href="deposit"> <button class="w-full px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
          copy
        </button></a>
      {/if}

    </div>
  
  </div>
  {/each}
  </div>
</div>
