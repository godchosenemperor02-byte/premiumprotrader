<script>
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';
  import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
  import { supabase } from '$lib/supabase';
  import AOS from 'aos';
  import 'aos/dist/aos.css';

  let scrollY = 0;
  let mounted = false;
  let { data } = $props();
  let { session } = $derived(data);

  onMount(() => { 
    mounted = true; 
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });
  });

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const stats = [
    { value: '2.4M+', label: 'Active Traders' },
    { value: '$18B+', label: 'Volume Traded' },
    { value: '190+', label: 'Countries' },
    { value: '99.98%', label: 'Uptime' },
  ];

  const features = [
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`,
      title: 'Tight Spreads',
      desc: 'From 0.0 pips on major pairs. No hidden markups, ever.',
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      title: 'Regulated & Secure',
      desc: 'Licensed under VFSC & FSA. Fully segregated client funds.',
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
      title: 'Ultra-Fast Execution',
      desc: 'Orders executed in under 11ms. Zero requotes or rejections.',
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
      title: '24/7 Live Support',
      desc: 'Real humans available around the clock via chat or phone.',
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
      title: 'Multi-Platform',
      desc: 'Trade seamlessly on MT4, MT5, or our proprietary web app.',
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      title: 'Copy Trading',
      desc: 'Mirror top traders automatically. Earn while you learn.',
    },
  ];

  const markets = [
    { icon: '💱', name: 'Forex', count: '60+ pairs', desc: 'Major, minor & exotic currency pairs' },
    { icon: '₿', name: 'Crypto', count: '50+ assets', desc: 'Bitcoin, Ethereum & altcoins' },
    { icon: '🥇', name: 'Commodities', count: 'Gold, Oil & more', desc: 'Precious metals & energy markets' },
    { icon: '📊', name: 'Indices', count: 'US30, SPX, DAX', desc: 'Global stock market indices' },
  ];

  const plans = [
    {
      name: 'Starter',
      min: '$500',
      roi: '8%',
      features: ['Forex & Indices', 'Basic Analytics', 'Email Support', '1:100 Leverage'],
      highlighted: false,
    },
    {
      name: 'Growth',
      min: '$5,000',
      roi: '15%',
      features: ['All Markets', 'Advanced Analytics', 'Priority Support', '1:200 Leverage', 'Copy Trading'],
      highlighted: true,
    },
    {
      name: 'Elite',
      min: '$25,000',
      roi: '22%',
      features: ['All Markets', 'Institutional Tools', 'Dedicated Manager', '1:500 Leverage', 'VPS + API Access'],
      highlighted: false,
    },
  ];

  const testimonials = [
    {
      name: 'Marcus O.',
      role: 'Professional Trader · Lagos',
      quote: 'Switched from two other brokers. The execution speed alone is worth it. Up 34% in Q1.',
      avatar: 'MO',
    },
    {
      name: 'Priya S.',
      role: 'Portfolio Manager · Dubai',
      quote: 'Transparent fees, fast withdrawals, and a platform that actually works. Rare combination.',
      avatar: 'PS',
    },
    {
      name: 'James K.',
      role: 'Fund Manager · London',
      quote: 'The copy trading infrastructure is solid. My investors have never been more confident.',
      avatar: 'JK',
    },
  ];

  const tickers = [
    { pair: 'EUR/USD', price: '1.08423', change: '+0.12%', up: true },
    { pair: 'BTC/USD', price: '67,420', change: '+2.41%', up: true },
    { pair: 'XAU/USD', price: '2,312.5', change: '-0.08%', up: false },
    { pair: 'GBP/USD', price: '1.27841', change: '+0.34%', up: true },
    { pair: 'ETH/USD', price: '3,124.8', change: '+1.87%', up: true },
    { pair: 'USD/JPY', price: '154.320', change: '-0.22%', up: false },
    { pair: 'SPX500', price: '5,248.6', change: '+0.55%', up: true },
    { pair: 'OIL/USD', price: '82.14', change: '-0.91%', up: false },
  ];

  const navLinks = ['Markets', 'Platform', 'Plans', 'About'];

  const footerCols = [
    { title: 'Platform', links: ['MetaTrader 4', 'MetaTrader 5', 'Web Trader', 'Mobile App', 'Copy Trading'] },
    { title: 'Company', links: ['About Us', 'Regulation', 'Partners', 'Careers', 'Press'] },
    { title: 'Support', links: ['Help Center', 'Live Chat', 'Contact Us', 'Legal Docs', 'Complaints'] },
  ];
</script>

<svelte:window bind:scrollY />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-[#0a0e1a] text-[#dfe2f3] overflow-x-hidden" style="font-family:'DM Sans',sans-serif;">

  <!-- Grain overlay -->
  <div class="pointer-events-none fixed inset-0 z-[999] opacity-[0.03]"
    style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22300%22 height=%22300%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>');">
  </div>

  <!-- ─── NAV ─── -->
  <nav
    class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between transition-all duration-300"
    style={scrollY > 40 ? 'background:rgba(10,14,26,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(30,144,255,0.12);' : ''}>

    <a href="/" class="flex items-center no-underline" style="font-family:'Playfair Display',serif;">
      <span class="text-xl font-bold text-[#b7c4ff]">premuim-pro</span>
      <span class="text-xl font-bold text-[#e6c364]">-trader</span>
    </a>

    <ul class="hidden md:flex items-center gap-8 list-none m-0 p-0">
      {#each navLinks as link}
        <li>
          <a href="#{link.toLowerCase()}" class="text-sm font-medium text-[#8e90a0] hover:text-[#dfe2f3] transition-colors no-underline">
            {link}
          </a>
        </li>
      {/each}
    </ul>

    <div class="hidden md:flex items-center gap-3">
      {#if session}
        <Button variant="ghost" class="text-[#c4c5d6] border border-[#444654] hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg text-sm h-9 px-4">
          <a href="/dashboard">Dashboard</a>
        </Button>
        <Button onclick={handleLogout} class="bg-red-600 hover:bg-red-700 text-white border-0 rounded-lg text-sm font-semibold h-9 px-4 shadow-lg transition-all hover:-translate-y-px">
          Log Out
        </Button>
      {:else}
        <Button variant="ghost" class="text-[#c4c5d6] border border-[#444654] hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg text-sm h-9 px-4">
        <a href="/login" >Login</a>
        </Button>
        <Button class="bg-[#1642c1] hover:bg-[#1e52d8] text-white border-0 rounded-lg text-sm font-semibold h-9 px-4 shadow-lg shadow-[#1642c1]/20 transition-all hover:-translate-y-px">
          <a href="/signup" >Open Account</a>
        </Button>
      {/if}
    </div>

    <!-- Mobile sheet -->
    <div class="md:hidden">
      <Sheet>
        <SheetTrigger >
          <Button variant="ghost" size="icon" class="text-[#c4c5d6] hover:text-white hover:bg-[#1b1f2c] h-9 w-9">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="bg-[#111827] border-l border-[#444654] w-72 p-6">
          <div class="flex flex-col gap-6 pt-4">
            <a href="/" style="font-family:'Playfair Display',serif;" class="no-underline">
              <span class="text-xl font-bold text-[#b7c4ff]">Premuim-pro-</span>
              <span class="text-xl font-bold text-[#e6c364]">Trader</span>
            </a>
            <Separator class="bg-[#444654]" />
            <ul class="flex flex-col gap-4 list-none m-0 p-0">
              {#each navLinks as link}
                <li>
                  <a href="#{link.toLowerCase()}" class="text-[#c4c5d6] hover:text-white text-base font-medium no-underline transition-colors">
                    {link}
                  </a>
                </li>
              {/each}
            </ul>
            <Separator class="bg-[#444654]" />
            <div class="flex flex-col gap-3">
              {#if session}
                <Button href="/dashboard" variant="outline" class="border-[#444654] text-black hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg">Dashboard</Button>
                <Button onclick={handleLogout} class="bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Log Out</Button>
              {:else}
                <Button href="/login" variant="outline" class="border-[#444654] text-black hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg">Login</Button>
                <Button href="/signup" class="bg-[#1642c1] hover:bg-[#1e52d8] text-white rounded-lg font-semibold">Open Account</Button>
              {/if}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </nav>

  <!-- ─── HERO ─── -->
  <section class="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 pb-20 overflow-hidden" data-aos="fade-up">

    <!-- Mesh bg -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0" style="background:radial-gradient(ellipse 70% 60% at 65% 40%,rgba(22,66,193,0.18) 0%,transparent 65%),radial-gradient(ellipse 50% 70% at 10% 70%,rgba(20,192,232,0.06) 0%,transparent 50%),linear-gradient(180deg,#0a0e1a 0%,#0d1122 100%);"></div>
      <div class="absolute inset-0" style="background-image:linear-gradient(rgba(30,144,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(30,144,255,0.05) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 75% 65% at 55% 45%,black 30%,transparent 100%);"></div>
    </div>

    <div class="relative z-10 max-w-[1440px] mx-auto w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

      <!-- Left copy -->
      <div class="flex flex-col">
        <Badge class="w-fit mb-6 bg-[#1642c1]/20 text-[#b7c4ff] border border-[#1642c1]/30 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
          <span class="w-1.5 h-1.5 rounded-full bg-[#20c0e8] mr-2 animate-pulse inline-block"></span>
          Regulated Global Broker
        </Badge>

        <h1 class="font-bold leading-[1.15] text-[#dfe2f3] mb-5"
          style="font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5vw,3.5rem);">
          Trade the World's<br>Markets with <span class="text-[#e6c364]">Precision</span>
        </h1>

        <p class="text-[#8e90a0] text-lg font-light leading-relaxed mb-8 max-w-md">
          Institutional-grade execution for the modern trader. Tight spreads, deep liquidity, and a platform built for those who take markets seriously.
        </p>

        <div class="flex flex-wrap gap-3 mb-8">
          <Button class="bg-[#1642c1] hover:bg-[#1e52d8] text-white border-0 rounded-lg px-6 h-12 text-base font-semibold shadow-xl shadow-[#1642c1]/25 transition-all hover:-translate-y-0.5 flex items-center gap-2">
           <a href="/login">Start Trading</a> 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Button>
          <Button variant="outline" class="border-[#444654] text-black hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg px-6 h-12 text-base transition-all">
            <a href="/signup">Get Started</a> 
          </Button>
        </div>

        <div class="flex flex-wrap items-center gap-5">
          {#each ['VFSC Regulated', 'FSA Licensed', 'Segregated Funds'] as trust}
            <div class="flex items-center gap-1.5 text-xs text-[#8e90a0]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#20c0e8" stroke-width="2.5" class="w-3.5 h-3.5 flex-shrink-0">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              {trust}
            </div>
          {/each}
        </div>
      </div>

      <!-- Right — dashboard preview -->
      <div class="relative">
        <div class="absolute -inset-6 rounded-2xl pointer-events-none" style="background:radial-gradient(ellipse at center,rgba(22,66,193,0.2) 0%,transparent 70%);filter:blur(24px);"></div>

        <Card class="relative overflow-hidden border border-[#1e90ff]/20 rounded-xl" style="background:rgba(17,24,39,0.82);backdrop-filter:blur(16px);box-shadow:0 32px 64px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04);">
          <div class="absolute top-0 left-0 right-0 h-px" style="background:linear-gradient(90deg,transparent,#e6c364,transparent);"></div>

          <CardHeader class="px-5 pt-5 pb-3">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-[#8e90a0] text-[10px] font-bold tracking-widest uppercase mb-1">Portfolio Balance</p>
                <p class="text-[#dfe2f3] font-bold" style="font-family:'JetBrains Mono',monospace;font-size:1.875rem;letter-spacing:-0.02em;">$48,291.40</p>
              </div>
              <Badge class="bg-[#20c0e8]/10 text-[#20c0e8] border border-[#20c0e8]/20 rounded-md text-xs font-semibold" style="font-family:'JetBrains Mono',monospace;">
                ↑ +12.4%
              </Badge>
            </div>
          </CardHeader>

          <CardContent class="px-5 pb-5">
            <!-- Sparkline -->
            <div class="h-20 mb-4 rounded-lg overflow-hidden" style="background:rgba(22,66,193,0.05);">
              <svg viewBox="0 0 300 80" preserveAspectRatio="none" class="w-full h-full">
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1e90ff" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#1e90ff" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,65 C30,60 50,55 70,45 S110,20 140,18 S190,35 210,25 S260,8 300,4" fill="none" stroke="#1e90ff" stroke-width="1.5"/>
                <path d="M0,65 C30,60 50,55 70,45 S110,20 140,18 S190,35 210,25 S260,8 300,4 L300,80 L0,80 Z" fill="url(#cg)"/>
              </svg>
            </div>

            <p class="text-[#8e90a0] text-[10px] font-bold tracking-widest uppercase mb-2">Open Positions</p>
            <div class="flex flex-col gap-2">
              {#each [
                { pair: 'EUR/USD', type: 'LONG', pnl: '+$842.30', pos: true },
                { pair: 'XAU/USD', type: 'LONG', pnl: '+$1,204.00', pos: true },
                { pair: 'GBP/JPY', type: 'SHORT', pnl: '-$128.50', pos: false },
              ] as p}
                <div class="flex items-center justify-between px-3 py-2.5 rounded" style="background:rgba(10,14,26,0.6);border:1px solid rgba(30,144,255,0.1);">
                  <div>
                    <p class="text-sm font-semibold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">{p.pair}</p>
                    <p class="text-[10px] font-bold tracking-widest text-[#8e90a0] uppercase mt-0.5">{p.type}</p>
                  </div>
                  <span class="text-sm font-semibold" style="font-family:'JetBrains Mono',monospace;color:{p.pos ? '#20c0e8' : '#f87171'};">{p.pnl}</span>
                </div>
              {/each}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  <!-- Gold divider -->
  <div class="max-w-[1440px] mx-auto px-6 md:px-12">
    <div class="h-px" style="background:linear-gradient(90deg,transparent,#e6c364,transparent);"></div>
  </div>

  <!-- ─── STATS ─── -->
  <section class="px-6 md:px-12 py-12" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 border border-[#1e90ff]/12 rounded-lg overflow-hidden" style="background:rgba(17,24,39,0.6);backdrop-filter:blur(12px);">
        {#each stats as s, i}
          <div class="px-6 py-8 text-center {i < stats.length - 1 ? 'border-r border-[#444654]' : ''}">
            <p class="font-bold text-[#e6c364] mb-1" style="font-family:'Playfair Display',serif;font-size:2rem;">{s.value}</p>
            <p class="text-[10px] font-bold tracking-widest uppercase text-[#8e90a0]">{s.label}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── FEATURES ─── -->
  <section id="platform" class="px-6 md:px-12 py-20" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <div class="grid md:grid-cols-2 gap-10 items-end mb-14">
        <div>
          <p class="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1e90ff] mb-3">Why ApexFX</p>
          <h2 class="font-bold text-[#dfe2f3] leading-tight" style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,3vw,2.5rem);">
            Built for Traders<br>Who Demand More
          </h2>
        </div>
        <p class="text-[#8e90a0] text-base font-light leading-relaxed">
          Every feature is engineered around one goal — giving you the edge. No compromises on execution quality, transparency, or support.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-lg overflow-hidden border border-[#1e90ff]/10" style="background:rgba(68,70,84,0.3);">
        {#each features as f}
          <div class="bg-[#0f131f] hover:bg-[#171b28] transition-colors duration-300 p-6 group cursor-default">
            <div class="text-[#1e90ff] group-hover:text-[#e6c364] transition-colors duration-300 mb-4 w-6 h-6">
              {@html f.icon}
            </div>
            <h3 class="text-[#dfe2f3] font-semibold text-base mb-2">{f.title}</h3>
            <p class="text-[#8e90a0] text-sm font-light leading-relaxed">{f.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── MARKETS ─── -->
  <section id="markets" class="px-6 md:px-12 py-20 border-t border-b border-[#1e90ff]/10 bg-[#0f131f]" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <p class="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1e90ff] mb-3">What You Can Trade</p>
      <h2 class="font-bold text-[#dfe2f3] mb-12" style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,3vw,2.5rem);">
        One Platform. Every Market.
      </h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each markets as m}
          <Card class="border border-[#1e90ff]/15 rounded-xl hover:border-[#e6c364]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer" style="background:rgba(17,24,39,0.8);backdrop-filter:blur(12px);">
            <CardContent class="p-5">
              <span class="text-3xl mb-4 block">{m.icon}</span>
              <h3 class="text-[#dfe2f3] font-semibold text-base mb-1">{m.name}</h3>
              <p class="text-[#e6c364] text-xs font-bold tracking-wide mb-1" style="font-family:'JetBrains Mono',monospace;">{m.count}</p>
              <p class="text-[#8e90a0] text-sm font-light">{m.desc}</p>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── PLANS ─── -->
  <section id="plans" class="px-6 md:px-12 py-20" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <div class="text-center mb-14">
        <p class="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1e90ff] mb-3">Investment Plans</p>
        <h2 class="font-bold text-[#dfe2f3]" style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,3vw,2.5rem);">
          Choose Your Trading Tier
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {#each plans as plan}
          <Card class="relative flex flex-col rounded-xl border transition-all duration-300 overflow-hidden
            {plan.highlighted ? 'border-[#e6c364] shadow-2xl shadow-[#e6c364]/10' : 'border-[#1e90ff]/15 hover:border-[#1e90ff]/40'}"
            style="{plan.highlighted ? 'background:rgba(27,31,44,0.9);' : 'background:rgba(17,24,39,0.8);'}backdrop-filter:blur(14px);">

            {#if plan.highlighted}
              <div class="absolute top-0 left-0 right-0 h-px" style="background:linear-gradient(90deg,transparent,#e6c364,transparent);"></div>
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge class="bg-[#e6c364] text-[#3d2e00] border-0 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                  Most Popular
                </Badge>
              </div>
            {/if}

            <div class="pt-8 px-6 pb-4">
              <p class="text-[#8e90a0] text-[10px] font-bold tracking-[0.12em] uppercase mb-3">{plan.name}</p>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="font-bold text-[#e6c364]" style="font-family:'Playfair Display',serif;font-size:3rem;line-height:1;">{plan.roi}</span>
              </div>
              <p class="text-[#8e90a0] text-sm mb-4">Monthly returns</p>
              <div class="flex items-center justify-between py-3 border-t border-b border-[#444654]">
                <span class="text-[#8e90a0] text-sm">Min. deposit</span>
                <span class="text-[#dfe2f3] font-semibold text-sm" style="font-family:'JetBrains Mono',monospace;">{plan.min}</span>
              </div>
            </div>

            <div class="flex-1 px-6 pb-6 flex flex-col">
              <ul class="flex flex-col gap-3 mb-6 flex-1 list-none m-0 p-0">
                {#each plan.features as feat}
                  <li class="flex items-center gap-2.5 text-sm text-[#c4c5d6] font-light">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:{plan.highlighted ? '#e6c364' : '#1e90ff'};"></span>
                    {feat}
                  </li>
                {/each}
              </ul>

              {#if plan.highlighted}
               <a href="/login">
                <Button class="w-full bg-[#e6c364] hover:bg-[#f0d070] text-[#3d2e00] font-bold rounded-lg h-11 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e6c364]/25 border-0">
                Get Started
                </Button>
                </a> 
              {:else}
              <a href="/login">
                <Button variant="outline" class="w-full border-[#444654] text-black hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg h-11 transition-all">
                   Get Started
                </Button>
                </a> 
              {/if}
            </div>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── TESTIMONIALS ─── -->
  <section class="px-6 md:px-12 py-20 border-t border-[#1e90ff]/10 bg-[#0f131f]" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <div class="mb-14">
        <p class="text-[11px] font-bold tracking-[0.15em] uppercase text-[#1e90ff] mb-3">Traders Speak</p>
        <h2 class="font-bold text-[#dfe2f3]" style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,3vw,2.5rem);">
          Trusted Across 190 Countries
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-5">
        {#each testimonials as t}
          <Card class="relative border border-[#1e90ff]/15 rounded-xl hover:border-[#1e90ff]/30 transition-all duration-300" style="background:rgba(17,24,39,0.8);backdrop-filter:blur(12px);">
            <span class="absolute top-2 left-4 text-[5rem] leading-none text-[#e6c364]/12 pointer-events-none select-none" style="font-family:'Playfair Display',serif;">"</span>
            <CardContent class="p-6 flex flex-col h-full">
              <p class="text-[#c4c5d6] text-sm font-light leading-relaxed mb-6 pt-5 flex-1">{t.quote}</p>
              <Separator class="bg-[#444654] mb-4" />
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-[#1642c1]/20 border border-[#1642c1]/30 flex items-center justify-center flex-shrink-0">
                  <span class="text-[10px] font-bold text-[#b7c4ff]" style="font-family:'JetBrains Mono',monospace;">{t.avatar}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-[#dfe2f3]">{t.name}</p>
                  <p class="text-xs text-[#8e90a0] mt-0.5">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── ABOUT ─── -->
  <section id="about" class="px-6 md:px-12 py-24 relative overflow-hidden" data-aos="fade-up">
   <div class="text-[30px] text-gray-300">About Premuim-pro-Trader</div>
    <!-- Subtle background effect -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.05]"
      style="background:radial-gradient(circle,#1e90ff 0%,transparent 70%);filter:blur(100px);"></div>

    <div class="max-w-[1440px] mx-auto relative z-10">
   
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Badge class="w-fit mb-6 bg-[#e6c364]/10 text-[#e6c364] border border-[#e6c364]/20 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
            Our Mission
          </Badge>
          <h2 class="font-bold text-[#dfe2f3] mb-6 leading-tight" style="font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);">
            Founded by Traders,<br>Perfected for <span class="text-[#e6c364]">Precision</span>
          </h2>
          <p class="text-[#8e90a0] text-lg font-light leading-relaxed mb-6">
            ApexFX was born out of a simple observation: the retail trading world lacked the precision and speed of institutional desks. We set out to bridge that gap.
          </p>
          <p class="text-[#8e90a0] text-base font-light leading-relaxed mb-10">
            Today, we serve millions of traders globally, providing the infrastructure, liquidity, and security required to navigate the world's most volatile markets with confidence.
          </p>
          
          <div class="grid sm:grid-cols-2 gap-8">
            <div class="p-5 rounded-lg border border-[#1e90ff]/10" style="background:rgba(17,24,39,0.4);">
              <p class="text-[#dfe2f3] font-semibold mb-2 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#e6c364]"></span>
                Transparency
              </p>
              <p class="text-[#8e90a0] text-sm font-light">No hidden fees, no dealing desk, just pure market execution.</p>
            </div>
            <div class="p-5 rounded-lg border border-[#1e90ff]/10" style="background:rgba(17,24,39,0.4);">
              <p class="text-[#dfe2f3] font-semibold mb-2 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#1e90ff]"></span>
                Innovation
              </p>
              <p class="text-[#8e90a0] text-sm font-light">Proprietary tools designed to give you a competitive edge.</p>
            </div>
          </div>
        </div>

        <div class="relative">
          <!-- Decorative element -->
          <div class="absolute -inset-4 border border-[#e6c364]/10 rounded-2xl rotate-3 pointer-events-none"></div>
          <div class="absolute -inset-4 border border-[#1e90ff]/10 rounded-2xl -rotate-3 pointer-events-none"></div>
          
          <Card class="border border-[#1e90ff]/15 rounded-xl overflow-hidden" style="background:rgba(17,24,39,0.8);backdrop-filter:blur(12px);">
            <CardContent class="p-8">
              <div class="space-y-8">
                <div class="flex items-start gap-5">
                  <div class="w-12 h-12 rounded-xl bg-[#e6c364]/10 border border-[#e6c364]/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#e6c364" stroke-width="1.5" class="w-6 h-6">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-[#dfe2f3] font-semibold mb-1 text-lg">Global Regulation</h4>
                    <p class="text-[#8e90a0] text-sm font-light leading-relaxed">Licensed and regulated across multiple jurisdictions for institutional-grade safety.</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-5">
                  <div class="w-12 h-12 rounded-xl bg-[#1e90ff]/10 border border-[#1e90ff]/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1e90ff" stroke-width="1.5" class="w-6 h-6">
                      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/>
                      <path d="M16 19h6"/><path d="M19 16v6"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-[#dfe2f3] font-semibold mb-1 text-lg">Segregated Funds</h4>
                    <p class="text-[#8e90a0] text-sm font-light leading-relaxed">Client capital is held in top-tier banks, completely separate from our operations.</p>
                  </div>
                </div>

                <div class="flex items-start gap-5">
                  <div class="w-12 h-12 rounded-xl bg-[#20c0e8]/10 border border-[#20c0e8]/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#20c0e8" stroke-width="1.5" class="w-6 h-6">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-[#dfe2f3] font-semibold mb-1 text-lg">24/7 Monitoring</h4>
                    <p class="text-[#8e90a0] text-sm font-light leading-relaxed">Continuous technical and security oversight to ensure 99.98% system uptime.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── CTA ─── -->
  <section class="px-6 md:px-12 py-20" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <Card class="relative overflow-hidden border border-[#1e90ff]/20 rounded-2xl text-center" style="background:#111827;backdrop-filter:blur(16px);">
        <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse 60% 60% at 50% 0%,rgba(22,66,193,0.15) 0%,transparent 70%);"></div>
        <div class="absolute top-0 left-0 right-0 h-px" style="background:linear-gradient(90deg,transparent,#e6c364,transparent);"></div>

        <CardContent class="relative z-10 px-8 py-16">
          <Badge class="mb-6 bg-[#e6c364]/10 text-[#e6c364] border border-[#e6c364]/20 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
            Start in Under 2 Minutes
          </Badge>
          <h2 class="font-bold text-[#dfe2f3] mb-4" style="font-family:'Playfair Display',serif;font-size:clamp(1.75rem,3vw,2.75rem);">
            Ready to Trade at<br>the Highest Level?
          </h2>
          <p class="text-[#8e90a0] text-base font-light mb-10 max-w-md mx-auto">
            Open a live account instantly. No minimums required to start on demo.
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <Button class="bg-[#1642c1] hover:bg-[#1e52d8] text-white border-0 rounded-lg px-8 h-12 text-base font-semibold shadow-xl shadow-[#1642c1]/25 transition-all hover:-translate-y-0.5 flex items-center gap-2">
             <a href="/signup">Create Live Account</a> 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Button>
            <Button variant="outline" class="border-[#444654] text-[#c4c5d6] hover:border-[#e6c364] hover:text-[#e6c364] hover:bg-transparent rounded-lg px-8 h-12 text-base transition-all">
                <a href="/login">Start Trading</a> 
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- ─── FOOTER ─── -->
  <footer class="border-t border-[#1e90ff]/10 bg-[#0a0e1a] px-6 md:px-12 pt-14 pb-6" data-aos="fade-up">
    <div class="max-w-[1440px] mx-auto">
      <div class="grid md:grid-cols-4 gap-10 mb-10">
        <div>
          <a href="/" style="font-family:'Playfair Display',serif;" class="no-underline">
            <span class="text-xl font-bold text-[#b7c4ff]">Premuim</span>
            <span class="text-xl font-bold text-[#e6c364]">pro-trader</span>
          </a>
          <p class="text-[#8e90a0] text-sm font-light leading-relaxed mt-4 max-w-[240px]">
            A regulated forex and CFD broker delivering institutional-grade execution to traders worldwide.
          </p>
        </div>

        {#each footerCols as col}
          <div>
            <h4 class="text-[#dfe2f3] text-[10px] font-bold tracking-[0.1em] uppercase mb-5">{col.title}</h4>
            <ul class="flex flex-col gap-3 list-none m-0 p-0">
              {#each col.links as link}
                <li>
                  <a href="#" class="text-[#8e90a0] text-sm font-light hover:text-[#e6c364] transition-colors no-underline">{link}</a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>

      <div class="h-px mb-6" style="background:linear-gradient(90deg,transparent,#e6c364,transparent);"></div>

      <div class="flex flex-col md:flex-row justify-between items-start gap-4">
        <p class="text-[#444654] text-xs font-light leading-relaxed max-w-xl">
          <strong class="text-[#8e90a0]">Risk Warning:</strong> Trading CFDs and Forex carries significant risk of loss and may not be suitable for all investors. Please ensure you fully understand the risks involved. Past performance is not indicative of future results.
        </p>
        <p class="text-[#444654] text-xs whitespace-nowrap">© 2025 Premuim-pro-trader. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- ─── LIVE TICKER ─── -->
  <div class="fixed bottom-0 left-0 right-0 z-50 h-9 flex items-center overflow-hidden border-t border-[#1e90ff]/12"
    style="background:rgba(13,17,34,0.95);backdrop-filter:blur(12px);">
    <div class="flex whitespace-nowrap" style="animation:ticker 30s linear infinite;">
      {#each [...tickers, ...tickers] as t}
        <div class="flex items-center gap-2 px-6 border-r border-[#444654]/50">
          <span class="text-[#8e90a0] text-xs" style="font-family:'JetBrains Mono',monospace;">{t.pair}</span>
          <span class="text-[#dfe2f3] text-xs font-medium" style="font-family:'JetBrains Mono',monospace;">{t.price}</span>
          <span class="text-xs font-semibold" style="font-family:'JetBrains Mono',monospace;color:{t.up ? '#20c0e8' : '#f87171'};">{t.change}</span>
        </div>
      {/each}
    </div>
  </div>

</div>

<style>
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
</style>