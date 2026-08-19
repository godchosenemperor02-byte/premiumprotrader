<script>
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { Sheet, SheetContent, SheetTrigger } from "$lib/components/ui/sheet";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";

  let { children,data } = $props();
 

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>` },
    { name: "Copy Experts", href: "/dashboard/copy", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
     { name: "Trading", href: "/dashboard/trades", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>` },
    { name: "Deposit", href: "/dashboard/deposit", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/><path d="M16 12h5"/></svg>` },
    { name: "Withdraw", href: "/dashboard/withdraw", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>` },
    { name: "Signal Subscription", href: "/dashboard/signal", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 3-3h2l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M13 13h.01"/><path d="M17 13h.01"/><path d="M9 13h.01"/><path d="M11 17h2"/></svg>` },
    { name: "Upgrade Account", href: "/dashboard/upgrade", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a2 2 0 0 0 0 4h15a1 1 0 0 0 1-1v-2.94"/><circle cx="16" cy="11" r="1"/></svg>` },
    { 
  name: "Verify Account", 
  href: "/dashboard/kyc", 
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h3v3H7z"/><path d="M14 8h3"/><path d="M14 12h3"/><path d="M7 16h10"/></svg>` 
  }
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    goto("/login");
  }

  const isActive = (href) => page.url.pathname === href;
</script>

<div class="min-h-screen bg-[#0a0e1a] text-[#dfe2f3] flex font-sans overflow-hidden">
  <!-- Grain overlay -->
  <div class="pointer-events-none fixed inset-0 z-[999] opacity-[0.02]"
    style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22300%22 height=%22300%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>');">
  </div>

  <!-- DESKTOP SIDEBAR -->
  <aside class="hidden lg:flex flex-col w-64 border-r border-[#1e90ff]/10 bg-[#0d1122]/80 backdrop-blur-xl sticky top-0 h-screen z-20">
    <div class="p-6">
      <a href="/" class="flex items-center gap-2 no-underline" style="font-family:'Playfair Display',serif;">
        <span class="text-xl font-bold text-[#b7c4ff]">premuim</span>
        <span class="text-xl font-bold text-[#e6c364]">FX</span>
      </a>
    </div>

    <nav class="flex-1 px-4 space-y-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
            isActive(link.href) 
              ? "bg-[#1642c1]/20 text-[#e6c364] border border-[#e6c364]/20" 
              : "text-[#8e90a0] hover:text-[#dfe2f3] hover:bg-white/5"
          )}
        >
          <span class={cn(
            "transition-colors",
            isActive(link.href) ? "text-[#e6c364]" : "text-[#444654] group-hover:text-[#8e90a0]"
          )}>
            {@html link.icon}
          </span>
          {link.name}
        </a>
      {/each}
    </nav>

    <div class="p-4 mt-auto">
      <div class="bg-[#111827] rounded-xl p-4 border border-[#1e90ff]/5">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1642c1] to-[#20c0e8] flex items-center justify-center font-bold text-white text-xs">
            {data.profile.first_name.charAt(0).toUpperCase()}{data.profile.last_name.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">{data.profile.first_name.toUpperCase()}</p>

          </div>
        </div>
        <Button 
          variant="ghost" 
          class="w-full justify-start text-[#f87171] hover:text-white hover:bg-red-500/10 h-9 px-2"
          onclick={handleLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Sign Out
        </Button>
      </div>
    </div>
  </aside>

  <!-- MOBILE HEADER -->
  <div class="flex flex-col flex-1 w-full relative">
    <header class="lg:hidden h-16 flex items-center justify-between px-6 border-b border-[#1e90ff]/10 bg-[#0d1122]/80 backdrop-blur-xl relative z-10">
      <a href="/" class="flex items-center no-underline" style="font-family:'Playfair Display',serif;">
        <span class="text-lg font-bold text-[#b7c4ff]">Premium </span>
        <span class="text-lg font-bold text-[#e6c364]">FX</span>
      </a>

      <Sheet>
        <SheetTrigger>
          <Button variant="ghost" size="icon" class="text-[#8e90a0]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="bg-[#0a0e1a] border-r border-[#1e90ff]/10 p-0 w-64">
          <div class="flex flex-col h-full">
            <div class="p-6">
              <span class="text-xl font-bold text-[#b7c4ff]" style="font-family:'Playfair Display',serif;"></span>
              <span class="text-xl font-bold text-[#e6c364]" style="font-family:'Playfair Display',serif;">FX</span>
            </div>
            <nav class="flex-1 px-4 space-y-1">
              {#each navLinks as link}
                <a
                  href={link.href}
                  class={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(link.href) 
                      ? "bg-[#1642c1]/20 text-[#e6c364]" 
                      : "text-[#8e90a0]"
                  )}
                >
                  {@html link.icon}
                  {link.name}
                </a>
              {/each}
            </nav>
            <div class="p-4 border-t border-[#1e90ff]/10">
               <Button 
                variant="ghost" 
                class="w-full justify-start text-[#f87171] hover:bg-red-500/10"
                onclick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 overflow-y-auto relative h-[calc(100vh-4rem)] lg:h-screen">
      <!-- Top header for desktop (Search/Notifs) -->
      <div class="hidden lg:flex h-16 items-center justify-between px-8 border-b border-[#1e90ff]/10 bg-[#0a0e1a]/50 sticky top-0 backdrop-blur-md z-10">
        <div class="relative w-96">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444654" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Search markets, traders, assets..." 
            class="w-full bg-[#111827] border border-[#1e90ff]/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#1e90ff]/20 transition-colors"
          />
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-[#1642c1]/10 border border-[#1642c1]/20 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[10px] font-bold text-[#b7c4ff] uppercase tracking-wider">Market Open</span>
          </div>
          <Separator orientation="vertical" class="h-6 bg-[#444654]" />
          <Button variant="ghost" size="icon" class="text-[#8e90a0] hover:text-[#dfe2f3]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </Button>
        </div>
      </div>

      <div class="p-6 lg:p-10 max-w-7xl mx-auto">
        {@render children()}
      </div>
    </main>
  </div>
</div>

<style>
  :global(body) {
    background-color: #0a0e1a;
  }
</style>
