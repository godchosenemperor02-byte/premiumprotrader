<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { onMount } from "svelte";

  let { data } = $props();

  // Reactive stats state
  let stats = $state([
    { label: "Total Balance", value: data.profile?.balance ?? 0, change: "+12.4%", up: true },
    { label: "Profits", value: data.profile?.profit ?? 0, change: "+8.2%", up: true },
    { label: "Capital", value: data.profile?.capital ?? 0, change: "+91.9%", up: true }
  ]);

  // Market sentiment state (50-100)
  let marketSentiment = $state({
    strength: 75,
    status: "Strong"
  });

  // Signal strength state
  let signalStrength = $state({
    strength: data.profile?.signal || 0,
    status: "Weak"
  });

  // Dynamic status utilities
  const getSignalStatus = (strength) => {
    if (strength >= 75) return "Strong";
    if (strength >= 60) return "Good";
    if (strength >= 40) return "Fair";
    return "Weak";
  };

  const generateRandomChange = () => {
    const isPositive = Math.random() > 0.5;
    const value = (Math.random() * 20).toFixed(1);
    return {
      change: `${isPositive ? "+" : "-"}${value}%`,
      up: isPositive
    };
  };

  const generateMarketSentiment = () => {
    const strength = Math.floor(Math.random() * 51) + 50;
    let status = "Weak";
    if (strength >= 75) status = "Strong";
    else if (strength >= 60) status = "Good";
    return { strength, status };
  };

  // Safe TradingView script injector helper
  function loadTradingViewScript(containerId, scriptConfig) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ""; // Clear existing content

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    if (containerId === "tv-market-overview") {
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    }
    script.async = true;
    script.innerHTML = JSON.stringify(scriptConfig);
    container.appendChild(script);
  }

  onMount(() => {
    // 1. Setup Intervals
    const interval = setInterval(() => {
      stats = stats.map((stat) => ({ ...stat, ...generateRandomChange() }));
    }, 2000);

    const sentimentInterval = setInterval(() => {
      marketSentiment = generateMarketSentiment();
    }, 1500);

    const signalStatusInterval = setInterval(() => {
      signalStrength = {
        ...signalStrength,
        status: getSignalStatus(signalStrength.strength)
      };
    }, 1000);

    // 2. Safely Inject TradingView Widgets
    loadTradingViewScript("tv-symbol-overview", {
      symbols: [
        ["Apple", "NASDAQ:AAPL|1D"],
        ["Google", "NASDAQ:GOOGL|1D"],
        ["Microsoft", "NASDAQ:MSFT|1D"]
      ],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: "en",
      colorTheme: "dark",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "Inter, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      headerFontSize: "medium",
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
      isTransparent: true
    });

    loadTradingViewScript("tv-market-overview", {
      colorTheme: "dark",
      dateRange: "12M",
      showFloatingTooltip: false,
      isTransparent: true,
      locale: "en",
      largeChartUrl: "",
      plotLineColorGrowing: "rgba(59, 130, 246, 1)",
      plotLineColorFalling: "rgba(59, 130, 246, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(156, 163, 175, 1)",
      belowLineFillColorGrowing: "rgba(59, 130, 246, 0.12)",
      belowLineFillColorFalling: "rgba(59, 130, 246, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(59, 130, 246, 0)",
      belowLineFillColorFallingBottom: "rgba(59, 130, 246, 0)",
      symbolActiveColor: "rgba(59, 130, 246, 0.12)",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500 Index" },
            { s: "FOREXCOM:NSXUSD", d: "US 100 Cash CFD" },
            { s: "FOREXCOM:DJI", d: "Dow Jones Industrial Average Index" },
            { s: "INDEX:NKY", d: "Japan 225" },
            { s: "INDEX:DEU40", d: "DAX Index" },
            { s: "FOREXCOM:UKXGBP", d: "FTSE 100 Index" }
          ]
        },
        {
          title: "Futures",
          symbols: [
            { s: "BMFBOVESPA:ISP1!", d: "S&P 500" },
            { s: "BMFBOVESPA:EUR1!", d: "Euro" },
            { s: "CMCMARKETS:GOLD", d: "Gold" },
            { s: "PYTH:WTI3!", d: "WTI Crude Oil" },
            { s: "BMFBOVESPA:CCM1!", d: "Corn" }
          ]
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR to USD" },
            { s: "FX:GBPUSD", d: "GBP to USD" },
            { s: "FX:USDJPY", d: "USD to JPY" },
            { s: "FX:USDCHF", d: "USD to CHF" },
            { s: "FX:AUDUSD", d: "AUD to USD" },
            { s: "FX:USDCAD", d: "USD to CAD" }
          ]
        }
      ],
      width: "100%",
      height: "100%",
      showSymbolLogo: true,
      showChart: true
    });

    return () => {
      clearInterval(interval);
      clearInterval(sentimentInterval);
      clearInterval(signalStatusInterval);
    };
  });

  // Dynamic Color Helper Functions
  const getGradientClass = (strength) => {
    if (strength >= 75) return "from-emerald-500 to-green-400";
    if (strength >= 60) return "from-amber-500 to-yellow-400";
    return "from-rose-500 to-red-400";
  };

  const getTextColorClass = (strength) => {
    if (strength >= 75) return "text-emerald-400";
    if (strength >= 60) return "text-amber-400";
    return "text-rose-400";
  };
</script>

<div class="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100">
  <!-- Top Meter Indicators Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Market Sentiment Bar -->
    <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Market Sentiment</span>
        <div class="flex items-center gap-2">
          <span class="text-base font-bold text-slate-200 font-mono">{marketSentiment.strength}%</span>
          <span class={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${getTextColorClass(marketSentiment.strength)}`}>
            {marketSentiment.status}
          </span>
        </div>
      </div>
      <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          class={`h-full rounded-full bg-gradient-to-r ${getGradientClass(marketSentiment.strength)} transition-all duration-500 ease-out`}
          style="width: {marketSentiment.strength}%;"
        ></div>
      </div>
    </div>

    <!-- Signal Strength Bar -->
    <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Signal Strength</span>
        <div class="flex items-center gap-2">
          <span class="text-base font-bold text-slate-200 font-mono">{signalStrength.strength}%</span>
          <span class={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${getTextColorClass(signalStrength.strength)}`}>
            {signalStrength.status}
          </span>
        </div>
      </div>
      <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          class={`h-full rounded-full bg-gradient-to-r ${getGradientClass(signalStrength.strength)} transition-all duration-500 ease-out`}
          style="width: {signalStrength.strength}%;"
        ></div>
      </div>
    </div>
  </div>

  <!-- Dashboard Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-white font-serif">Trading Overview</h1>
      <p class="text-slate-400 text-sm mt-1">
        Welcome back, <span class="font-semibold text-slate-200">{data.profile?.first_name || 'User'}</span>. Here's your portfolio activity today.
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="flex items-center gap-3">
      <a 
        href="/dashboard/deposit" 
        class="inline-flex items-center justify-center px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm rounded-lg transition-all shadow-sm active:scale-95"
      >
        Deposit
      </a>
      <a 
        href="/dashboard/trades" 
        class="inline-flex items-center justify-center px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg transition-all shadow-sm shadow-rose-950/30 active:scale-95"
      >
        Trade
      </a>
    </div>
  </div>

  <!-- Key Performance Metrics Grid -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each stats as stat}
      <Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-sm hover:border-slate-700/80 transition-colors">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</CardTitle>
          <div class="p-2 bg-slate-800/50 rounded-lg text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-slate-100 font-mono tracking-tight">
            {data.profile?.currency || '$'} {stat.value}
          </div>
          <p class="text-xs mt-2 font-medium flex items-center gap-1.5">
            <span class={stat.up ? 'text-emerald-400' : 'text-rose-400'}>
              {stat.change}
            </span> 
            <span class="text-slate-500">from last session</span>
          </p>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Main Trading Section Grid -->
  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Charts Container -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Symbol Overview Card -->
      <Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md overflow-hidden min-h-[480px]">
        <div id="tv-symbol-overview" class="w-full h-[480px]"></div>
      </Card>

      <!-- Active Positions & Market Overview -->
      <Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md overflow-hidden flex flex-col min-h-[550px]">
        <CardHeader class="border-b border-slate-800/60 py-4">
          <CardTitle class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Positions & Market Overview</CardTitle>
        </CardHeader>
        <CardContent class="p-0 flex-1">
          <div id="tv-market-overview" class="w-full h-[500px]"></div>
        </CardContent>
      </Card>
    </div>

    <!-- Right Sidebar / Watchlist -->
    <div class="space-y-6">
      <Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
        <CardHeader class="border-b border-slate-800/60 py-4">
          <CardTitle class="text-xs font-bold uppercase tracking-wider text-slate-400">Market Watch</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="divide-y divide-slate-800/60">
            {#each [
              { asset: "EUR/USD", price: "1.08420", change: "+0.04%" },
              { asset: "GBP/USD", price: "1.27540", change: "-0.12%" },
              { asset: "USD/JPY", price: "154.32", change: "+0.45%" },
              { asset: "XAU/USD", price: "2,312.40", change: "-0.22%" },
            ] as ticker}
              <div class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors cursor-pointer">
                <span class="text-sm font-bold text-slate-200 font-mono">{ticker.asset}</span>
                <div class="text-right">
                  <p class="text-sm font-bold text-slate-100 font-mono">{ticker.price}</p>
                  <p class={`text-[11px] font-semibold ${ticker.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ticker.change}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
