<script>
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    let {data} = $props()
    const plans = [
        {title:'Newbie',desc:'Basic entry-level signals with lower risk, designed for beginners learning how signals work.',price:'1500'},
        {title:'Bronze',desc:'Low to moderate confidence signals, suitable for cautious traders building consistency.',price:'2000'},
        {title:'Silver',desc:'Well-researched signals with solid setups and balanced risk-to-reward.',price:'3000'},
        {title:'Gold',desc:'High-confidence signals backed by strong market confluence and clear confirmations.',price:'3500'},
        {title:'Platinum',desc:'Premium, top-tier signals with the highest conviction, precision entries, and optimal risk management.',price:'5000'}
    ]
</script>
<div class="flex flex-1 flex-col md:flex-row md:justify-between mb-4">
  <section class="">
 <h2 class='text-2xl font-serif font-bold py-2 italic'>
  Live Signal Packages</h2>
  <h5 class="text-sm  text-gray-400 italic">Subscribe to professional trading signals</h5>
</section>
 <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-[10px] font-bold uppercase tracking-wider text-[#8e90a0]">Available Balance</CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-[#444654]">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">${data.profile.balance}</div>
          <p class="text-xs mt-1 font-medium text-green-500' ">
             <span class="text-[#444654] font-normal">from last session</span>
          </p>
        </CardContent>
      </Card>
</div>
<h2 class="text-xl my-3 font-bold text-gray-300"> Available Packages</h2>
<div class="grid md:grid-cols-3 gap-4">
{#each data.subscription as plan }
<Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
    <CardHeader>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <CardTitle class="text-2xl text-gray-200 font-light font-mono">{plan.title}</CardTitle>
    </CardHeader>
    <CardContent>
        <p class="text-sm text-gray-400">{plan.desc}</p>
        <p class="text-2xl text-gray-200 font-bold mt-2">$ {plan.price}</p>
        {#if data.profile.subscription == plan.title?.trim()}
        <button class="bg-amber-300 w-full p-1.5 rounded-md text-center text-lg my-2 font-bold disabled:opacity-50" disabled>Suscribed</button>
        {:else}
        <a href="deposit"><button class="bg-amber-300 w-full p-1.5 rounded-md text-center text-lg my-2 font-bold hover:bg-amber-400 ease-in-out transition-colors" disabled>Suscribe</button></a> 
        {/if}
    </CardContent>
</Card>
{/each}
</div>
