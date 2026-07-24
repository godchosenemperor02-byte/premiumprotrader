<script>
 import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
 const {data} = $props()
 const account_types = [
    {title:'Newbie', price:'Free',perks:['Account Registration','Basic Dashboard', 'Market Updates','Standard Support'], logo:'🆓'},
    {title:'Bronze', price:'1,000',perks:['Basic Ai Signals','Market Analysis', 'Standard Support','Monthly Reports'], logo:'🥉'},
    {title:'Silver', price:'4,000',perks:['All Bronse Features','Priority Support', 'Advanced Signals','Lower Fees','Profit Optimization'], logo:'🥈'},
    {title:'Gold', price:'8,000',perks:['All silver Features','VIP Trade Alerts', 'Market Insights','Faster Withdrawals','Account Manager'], logo:'🥇'},
    {title:'Platinum', price:'15,000',perks:['All Gold Features','Personalized Strategy', '24/7 VIP Support','Exclusive Opportunities','Portfolio Diversification'], logo:'👑'},
    {title:'Diamond', price:'25,000',perks:['All Platinum Features','Custom AI Trading', 'Private Investment Access','Weatlh Planning','Concierge Management'], logo:'💎'}
 ]
</script>
<div class="flex flex-1 flex-col md:flex-row md:justify-between mb-4">
  <section class="">
 <h2 class='text-2xl font-serif font-bold py-2 italic'>
 Upgrade Account</h2>
  <h5 class="text-sm  text-gray-400 italic">Browse through our curated list of plans and pick the plan that aligns best with your goals</h5>
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
<h2 class="text-xl my-3 font-bold text-gray-300"> Available Plans</h2>
<div class="grid md:grid-cols-3 gap-4">
{#each account_types as plan }
<Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm my-2.5">
    <CardHeader>
        <h2 class='text-4xl text-center'>{plan.logo}</h2>
        <CardTitle class="text-xl text-gray-200 font-light font-mono text-center mt-1.5">{plan.title}</CardTitle>
    </CardHeader>
    <CardContent>
        <p class="text-2xl text-gray-200 font-bold  text-center mb-1">$ {plan.price}</p>
        {#each plan.perks as perks}
        <p class="text-gray-300  font-sans my-0.5 text-[15px]"><span class="text-green-300">✔</span> {perks}</p>
        {/each}
        {#if plan.title == data.profile.accountplan.trim()}
        <button class="bg-gray-500 w-full p-1.5 rounded-md text-center text-[17px] my-2 font-bold cursor-not-allowed">Current Plan</button>
        {:else}
       <a href="deposit"> <button class="bg-amber-300 w-full p-1.5 rounded-md text-center text-[17px] my-2 font-bold hover:bg-amber-400 ease-in-out transition-colors">Suscribe</button></a>
      {/if}
      </CardContent>
</Card>
{/each}
</div>