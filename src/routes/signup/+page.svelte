<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Eye, Lock, Mail, ShieldCheck, ArrowRight, ALargeSmall, Loader2, Globe, Phone } from "lucide-svelte";
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";
  
  let user = $state({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    country: '',
    phonenumber: '',
    admin: false
  })
  let loading = $state(false);
  let errorMsg = $state("");
  let successMsg = $state("");

  async function handleSignup(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = "";
    successMsg = "";

    const { error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.firstname,
          last_name: user.lastname,
          country: user.country,
          phone_number: user.phonenumber,
          admin: user.admin
      }
    }
    });

    if (error) {
      errorMsg = error.message;
      loading = false;
    } else {
      successMsg = "Check your email for the confirmation link.";
      loading = false;
      goto('/login', { replaceState: true })
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
        Create a Live Account.
        </h1>
        <p class="text-slate-400 max-w-md text-lg leading-relaxed mb-12">
          Access institutional-grade trading suite. Experience lightning-fast execution and deep liquidity in the world's most demanding markets.
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
          <h2 class="text-4xl font-serif mt-2">Secure Sign Up</h2>
        </div>

        {#if errorMsg}
          <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded text-sm">
            {errorMsg}
          </div>
        {/if}

        {#if successMsg}
          <div class="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded text-sm">
            {successMsg}
          </div>
        {/if}

        <form class="space-y-6" onsubmit={handleSignup}>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstname" class="text-xs uppercase text-slate-500 tracking-wider">First Name</Label>
              <div class="relative">
                  <ALargeSmall class="absolute left-3 top-3 h-4 w-4 text-slate-500"/>
                <Input 
                  id="firstname" 
                  type="text"
                  placeholder="First Name"
                  required
                  bind:value={user.firstname} 
                  class="bg-slate-900/50 border-slate-700 pl-10 h-12 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="lastname" class="text-xs uppercase text-slate-500 tracking-wider">Last Name</Label>
              <div class="relative">
              <ALargeSmall class="absolute left-3 top-3 h-4 w-4 text-slate-500"/>
                <Input 
                  id="lastname" 
                  type="text"
                  required
                  bind:value={user.lastname} 
                  placeholder="Last Name" 
                  class="bg-slate-900/50 border-slate-700 pl-10 h-12 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="country" class="text-xs uppercase text-slate-500 tracking-wider">Country</Label>
              <div class="relative">
                  <Globe class="absolute left-3 top-3 h-4 w-4 text-slate-500"/>
                <Input 
                  id="country" 
                  placeholder="Country"
                  type="text"
                  required
                  bind:value={user.country} 
                  class="bg-slate-900/50 border-slate-700 pl-10 h-12 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="phone" class="text-xs uppercase text-slate-500 tracking-wider">Phone Number</Label>
              <div class="relative">
              <Phone class="absolute left-3 top-3 h-4 w-4 text-slate-500"/>
                <Input 
                  id="phone" 
                  required
                  bind:value={user.phonenumber} 
                  placeholder="+1 (555) 000-0000" 
                  type='text'
                  class="bg-slate-900/50 border-slate-700 pl-10 h-12 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

           <div class="space-y-2">
            <Label for="email" class="text-xs uppercase text-slate-500 tracking-wider">Terminal ID / Email</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input 
                id="email" 
                type="email"
                placeholder="name@firm.com" 
                required
                bind:value={user.email} 
                class="bg-slate-900/50 border-slate-700 pl-10 h-12 focus:ring-blue-500"
              />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <Label for="key" class="text-xs uppercase text-slate-500 tracking-wider">Security Key</Label>
            </div>
            <div class="relative">
              <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input 
                id="key" 
                type="password" 
                placeholder="••••••••••••" 
                required
                bind:value={user.password} 
                class="bg-slate-900/50 border-slate-700 pl-10 h-12"
              />
              <Eye class="absolute right-3 top-3 h-4 w-4 text-slate-500 cursor-pointer" />
            </div>
          </div>

          
          <Button type="submit" disabled={loading} class="w-full h-12 bg-blue-700 hover:bg-blue-600 text-white font-semibold gap-2">
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" /> Processing...
            {:else}
              Create Account <ArrowRight class="h-4 w-4" />
            {/if}
          </Button>
        </form>

        <div class="pt-8 text-center space-y-4">
          <p class="text-sm text-slate-500">Already have an account?</p>
          <a href="/login">
        <Button variant="outline" class="w-full text-black h-11">
            Login
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