<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import { Eye, Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-svelte";
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";

  let account = $state({
    email:'',
    password:''
  })
  let loading = $state(false);
  let errorMsg = $state("");

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = "";

    const { error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error) {
      errorMsg = error.message;
      loading = false;
    } else {
      goto("/dashboard",{replaceState: true});
    }
  }
</script>

<div class="min-h-screen bg-[#05080a] text-slate-200 flex flex-col font-sans">
  <!-- Main Content Split -->
  <main class="flex flex-1 flex-col-reverse md:flex-row">
    
    <!-- Left Section: Hero/Branding -->
    <section class="relative flex-1 p-12 flex flex-col justify-between overflow-hidden border-r border-slate-800/50">
      <!-- Background Glow/Effect -->
      <div class="absolute inset-0 bg-[url('/bg-trading-chart.jpg')] opacity-20 bg-cover bg-center"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-16">
          <div class="bg-blue-600 p-2 rounded">
            <ShieldCheck class="text-white h-6 w-6" />
          </div>
          <a href="/"><span class="text-xl font-semibold tracking-tight italic">Premuim-pro-Trader</span></a>
        </div>

        <h1 class="text-5xl md:text-6xl font-serif font-medium mb-6 leading-tight">
          Welcome Back,<br />Trader.
        </h1>
        <p class="text-slate-400 max-w-md text-lg leading-relaxed mb-12">
          Access your institutional-grade trading suite. Experience lightning-fast execution and deep liquidity in the world's most demanding markets.
        </p>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-y-10 gap-x-4 max-w-sm">
          <div>
            <div class="text-yellow-500 font-mono text-lg font-bold">30ms</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Avg. Execution</div>
          </div>
          <div>
            <div class="text-yellow-500 font-mono text-lg font-bold">300+</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Instruments</div>
          </div>
          <div>
            <div class="text-yellow-500 font-mono text-lg font-bold">Deep</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Pool Liquidity</div>
          </div>
          <div>
            <div class="text-yellow-500 font-mono text-lg font-bold">24/7</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Global Support</div>
          </div>
        </div>
      </div>

      <div class="relative z-10 flex items-center gap-2 text-sm text-slate-500">
        <ShieldCheck class="h-4 w-4" />
        <span>Military-grade encryption securing all transactions.</span>
      </div>
    </section>

    <!-- Right Section: Login Form -->
    <section class="flex-1 p-12 flex flex-col items-center justify-center bg-[#080c10]">
      <div class="w-full max-w-md space-y-8">
        <div>
          <span class="text-yellow-600 uppercase text-xs font-bold tracking-widest">Institutional Access</span>
          <h2 class="text-4xl font-serif mt-2">Secure Sign In</h2>
        </div>

        {#if errorMsg}
          <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded text-sm">
            {errorMsg}
          </div>
        {/if}

        <form class="space-y-6" onsubmit={handleLogin}>
          <div class="space-y-2">
            <Label for="terminal" class="text-xs uppercase text-slate-500 tracking-wider">Terminal ID / Email</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input 
                id="terminal" 
                placeholder="name@firm.com" 
                type="email"
                required
                bind:value={account.email}
                class="bg-slate-900/50 border-slate-700 pl-10 h-12 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <Label for="key" class="text-xs uppercase text-slate-500 tracking-wider">Security Key</Label>
              <a href="/" class="text-xs text-yellow-600 font-bold uppercase tracking-tighter hover:underline">Forgot Password?</a>
            </div>
            <div class="relative">
              <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input 
                id="key" 
                type="password" 
                placeholder="••••••••••••" 
                required
                bind:value={account.password}
                class="bg-slate-900/50 border-slate-700 pl-10 h-12"
              />
              <Eye class="absolute right-3 top-3 h-4 w-4 text-slate-500 cursor-pointer" />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="remember" class="border-slate-700" />
            <label for="remember" class="text-sm text-slate-400">Remember this terminal for 30 days</label>
          </div>

          <Button type="submit" disabled={loading} class="w-full h-12 bg-blue-700 hover:bg-blue-600 text-white font-semibold gap-2">
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" /> Processing...
            {:else}
              Sign In to Dashboard <ArrowRight class="h-4 w-4" />
            {/if}
          </Button>
        </form>

        <div class="pt-8 text-center space-y-4">
          <p class="text-sm text-slate-500">New to Premuim-pro-Trader?</p>
          <a href="/signup">
          <Button variant="outline" class="w-full text-black h-11" >
            Open Institutional Account
          </Button>
          </a>
          <div class="flex justify-center gap-6 pt-4">
             <div class="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
               <span class="h-2 w-2 rounded-full bg-blue-500"></span> Market: Open
             </div>
             <div class="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
               <span class="h-2 w-2 rounded-full bg-yellow-500"></span> Latency: 12ms
             </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="p-8 bg-[#040608] border-t border-slate-900">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
      <p class="text-[10px] text-slate-600 max-w-xl leading-relaxed uppercase tracking-tight">
        © 2024 Premuim-pro-trader. Member FINRA/SIPC. High-risk investment notice: CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 74% of retail investor accounts lose money when trading CFDs with this provider. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.
      </p>
      <nav class="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest self-center">
        <a href="/" class="hover:text-white">Privacy Policy</a>
        <a href="/" class="hover:text-white">Terms of Service</a>
        <a href="/" class="hover:text-white">Regulatory Status</a>
      </nav>
    </div>
  </footer>
</div>

<style>
  /* Optional: Import a serif font like Playfair Display or Source Serif 4 in your global.css to match the headings */
</style>