<script>
 import { Button } from "$lib/components/ui/button";
 import { supabase } from "$lib/supabase";
 import { goto } from "$app/navigation";

  let { children, data } = $props();

  // Reactive state to control mobile sidebar visibility
  let mobileOpen = $state(false);

  function toggleMobileMenu() {
    mobileOpen = !mobileOpen;
  }

  function closeMobileMenu() {
    mobileOpen = false;
  }
  async function handleLogout() {
    await supabase.auth.signOut();
    goto("/login");
  }
</script>

<!-- Admin Dashboard Layout Wrapper -->
<div class="min-h-screen bg-[#111827] flex font-sans antialiased text-gray-100">

  <!-- ================= MOBILE OVERLAY BACKDROP ================= -->
  {#if mobileOpen}
    <button
      type="button"
      aria-label="Close mobile menu backdrop"
      onclick={closeMobileMenu}
      class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
    ></button>
  {/if}

  <!-- ================= SIDEBAR (DESKTOP + MOBILE DRAWER) ================= -->
  <aside 
    class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out
           {mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0"
  >
    <div>
      <!-- Brand Logo Header Container -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-wider">
            AD
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-tight text-white leading-none">Admin Control</h1>
            <span class="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Terminal v1.4</span>
          </div>
        </div>

        <!-- Close button specifically for Mobile view -->
        <button 
          type="button" 
          onclick={closeMobileMenu} 
          class="p-1 text-gray-400 hover:text-white rounded-lg lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="p-4 space-y-1">
        <!-- Dashboard Overview Link -->
        <a 
          href="/admin" 
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 bg-gray-850 border border-gray-800 text-blue-400 rounded-xl text-sm font-semibold transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
          </svg>
          Overview
        </a>

        <!-- Manage Traders Link -->
        <a 
          href="/admin/trader" 
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 hover:bg-gray-850/50 border border-transparent hover:border-gray-800/40 text-gray-400 hover:text-gray-200 rounded-xl text-sm font-medium transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-500 group-hover:text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          Manage Traders
        </a>

        <!-- Pending Withdrawals / Manage Signal Link -->
        <a 
          href="/admin/signal" 
          onclick={closeMobileMenu}
          class="flex items-center justify-between px-4 py-3 hover:bg-gray-850/50 border border-transparent hover:border-gray-800/40 text-gray-400 hover:text-gray-200 rounded-xl text-sm font-medium transition-all group"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-500 group-hover:text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-1.97-.659-1.171-.879-1.171-2.303 0-3.182 1.172-.879 3.07-.879 4.242 0M9 6h6m-7.5.5v3.182c0 .484.145.961.419 1.366l1.018 1.507A2.25 2.25 0 0 1 9.75 14v3.5M16.5 6.5v3.182c0 .484-.145.961-.419 1.366l-1.018 1.507A2.25 2.25 0 0 0 14.25 14v3.5" />
            </svg>
            <span>Manage Signal</span>
          </div>
          <!-- Real-time Warning Badge counts -->
          <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-950/80 border border-amber-900/50 text-amber-400">
            {data?.subscription?.length ?? 0}
          </span>
        </a>
    <a 
          href="/admin/withdraw" 
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 hover:bg-gray-850/50 border border-transparent hover:border-gray-800/40 text-gray-400 hover:text-gray-200 rounded-xl text-sm font-medium transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-500 group-hover:text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          Manage Cards
        </a>
    <a 
          href="/admin/card" 
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 hover:bg-gray-850/50 border border-transparent hover:border-gray-800/40 text-gray-400 hover:text-gray-200 rounded-xl text-sm font-medium transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-500 group-hover:text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          Withdraw
        </a>

      </nav>
    </div>

    <!-- Sidebar Bottom User Block -->
    <div class="p-4 border-t border-gray-800">
      <div class="flex items-center gap-3 p-2 bg-gray-950/60 border border-gray-800/60 rounded-xl">
        <div class="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 font-bold flex items-center justify-center text-xs text-gray-300">
          AD
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-white truncate">Main Administrator</p>
          <p class="text-[10px] text-gray-500 font-medium truncate">Root System Account</p>
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
  </aside>

  <!-- ================= MAIN RIGHT FLUID WINDOW CONTAINER ================= -->
  <div class="flex-1 lg:pl-64 flex flex-col min-w-0">
    
    <!-- TOP FLUID GLOBAL HEADER -->
    <header class="h-16 border-b border-gray-800/80 bg-gray-900/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8">
      <!-- Left side: Mobile navigation trigger button -->
      <div class="flex items-center gap-4">
        <button 
          type="button" 
          onclick={toggleMobileMenu} 
          class="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-950/40 border border-blue-900/40 text-blue-400 hidden sm:inline-block">
          Production Environment
        </span>
      </div>

      <!-- Right side: Status Quick-badges -->
      <div class="flex items-center gap-4">
        <!-- Live System Node Status Indicator -->
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-950 border border-gray-800/80 rounded-lg text-xs font-medium text-gray-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System: Secure</span>
        </div>
      </div>
    </header>

    <!-- PAGE VIEW CONTENT SLOT -->
    <main class="flex-1 p-4 sm:p-8">
      <div class="p-3 lg:p-10 max-w-7xl mx-auto">
        {@render children()}
      </div>
    </main>

  </div>
</div>
