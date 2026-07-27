<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { onMount } from "svelte";
  
  let { data } = $props()

  // Make stats reactive with state binding
  let stats = $state([
    { label: "Total Balance", value: data.profile.balance, change: "+12.4%", up: true },
    { label: "Profits", value: data.profile.profit, change: "+8.2%", up: true },
    { label: "Capital", value: data.profile.capital, change: "+91.9%", up: true },
  ]);
  
  // Signal strength state
  let signalStrength = $state({
    strength: 65,
    status: "Strong",
    bars: [true, true, true, true, false]
  });
  
  // Function to generate random change
  const generateRandomChange = () => {
    const isPositive = Math.random() > 0.5;
    const value = (Math.random() * 20).toFixed(1); // 0 to 20%
    return {
      change: `${isPositive ? '+' : '-'}${value}%`,
      up: isPositive
    };
  };
  
  // Function to generate random signal strength
  const generateSignalStrength = () => {
    const strength = Math.floor(Math.random() * 100);
    let status = "Weak";
    if (strength >= 70) status = "Strong";
    else if (strength >= 50) status = "Good";
    
    // Generate active bars based on strength
    const barCount = Math.ceil((strength / 100) * 5);
    const bars = Array.from({ length: 5 }, (_, i) => i < barCount);
    
    return { strength, status, bars };
  };
  
  // Update changes every 2 seconds
  onMount(() => {
    const interval = setInterval(() => {
      stats = stats.map(stat => ({
        ...stat,
        ...generateRandomChange()
      }));
    }, 2000); // Update every 2 seconds
    
    // Update signal strength every 1.5 seconds
    const signalInterval = setInterval(() => {
      signalStrength = generateSignalStrength();
    }, 1500);
    
    return () => {
      clearInterval(interval);
      clearInterval(signalInterval);
    };
  });

  const positions = [
    // ... rest of your positions code
  ];
</script>
<div class="space-y-8">
  <!-- Header -->
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight text-[#dfe2f3]" style="font-family:'Playfair Display',serif;">Trading Overview</h1>
    <p class="text-[#8e90a0] font-light capitalize">Welcome back, {data.profile?.first_name || 'User'} Here's what's happening in your portfolio today.</p>
  </div>

  <!-- Stats Grid -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat}
      <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-[10px] font-bold uppercase tracking-wider text-[#8e90a0]">{stat.label}</CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-[#444654]">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">${stat.value}</div>
          <p class="text-xs mt-1 font-medium {stat.up ? 'text-green-500' : 'text-red-500'}">
            {stat.change} <span class="text-[#444654] font-normal">from last session</span>
          </p>
        </CardContent>
      </Card>
    {/each}
  </div>
  <div class="flex gap-x-2.5">
    <a href="/dashboard/deposit" class='text-center flex-5 p-2 bg-gray-100 text-black text-lg [border-radius:8px] font-bold hover:bg-gray-200'>
      Deposit
    </a>
     <a href="/dashboard/trades" class='text-center flex-5 p-2 bg-red-600 text-white text-lg [border-radius:8px] font-bold hover:bg-red-700'>
      Trade
    </a>
  </div>

  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Chart Section -->
    <div class="lg:col-span-2 space-y-4">
      <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm h-[450px] relative overflow-hidden">
       <!-- TradingView Widget BEGIN -->
<div class="tradingview-widget-container w-full h-full">
  <div class="tradingview-widget-container__widget h-full"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js" async>
  {
  "symbols": [
    [
      "Apple",
      "NASDAQ:AAPL|1D"
    ],
    [
      "Google",
      "NASDAQ:GOOGL|1D"
    ],
    [
      "Microsoft",
      "NASDAQ:MSFT|1D"
    ]
  ],
  "chartOnly": false,
  "width": "100%",
  "height": "100%",
  "locale": "en",
  "colorTheme": "dark",
  "autosize": true,
  "showVolume": false,
  "showMA": false,
  "hideDateRanges": false,
  "hideMarketStatus": false,
  "hideSymbolLogo": false,
  "scalePosition": "right",
  "scaleMode": "Normal",
  "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
  "fontSize": "10",
  "noTimeScale": false,
  "valuesTracking": "1",
  "changeMode": "price-and-percent",
  "chartType": "area",
  "headerFontSize": "medium",
  "lineWidth": 2,
  "lineType": 0,
  "dateRanges": [
    "1d|1",
    "1m|30",
    "3m|60",
    "12m|1D",
    "60m|1W",
    "all|1M"
  ],
  "upColor": "#22ab94",
  "downColor": "#f7525f",
  "borderUpColor": "#22ab94",
  "borderDownColor": "#f7525f",
  "wickUpColor": "#22ab94",
  "wickDownColor": "#f7525f",
  "isTransparent": true
}
  </script>
</div>
<!-- TradingView Widget END -->
        
      </Card>

      <!-- Active Positions -->
      <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm overflow-hidden h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle class="text-sm font-bold uppercase tracking-wider text-[#8e90a0]">Active Positions</CardTitle>
        </CardHeader>
       <!-- TradingView Widget BEGIN -->
<div class="tradingview-widget-container w-full flex-1">
  <div class="tradingview-widget-container__widget h-full"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
  {
  "colorTheme": "dark",
  "dateRange": "12M",
  "showFloatingTooltip": false,
  "isTransparent": true,
  "locale": "en",
  "largeChartUrl": "",
  "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
  "plotLineColorFalling": "rgba(41, 98, 255, 1)",
  "gridLineColor": "rgba(240, 243, 250, 0)",
  "scaleFontColor": "rgba(209, 212, 220, 1)",
  "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
  "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
  "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
  "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
  "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
  "tabs": [
    {
      "title": "Indices",
      "symbols": [
        {
          "s": "FOREXCOM:SPXUSD",
          "d": "S&P 500 Index"
        },
        {
          "s": "FOREXCOM:NSXUSD",
          "d": "US 100 Cash CFD"
        },
        {
          "s": "FOREXCOM:DJI",
          "d": "Dow Jones Industrial Average Index"
        },
        {
          "s": "INDEX:NKY",
          "d": "Japan 225"
        },
        {
          "s": "INDEX:DEU40",
          "d": "DAX Index"
        },
        {
          "s": "FOREXCOM:UKXGBP",
          "d": "FTSE 100 Index"
        }
      ],
      "originalTitle": "Indices"
    },
    {
      "title": "Futures",
      "symbols": [
        {
          "s": "BMFBOVESPA:ISP1!",
          "d": "S&P 500"
        },
        {
          "s": "BMFBOVESPA:EUR1!",
          "d": "Euro"
        },
        {
          "s": "CMCMARKETS:GOLD",
          "d": "Gold"
        },
        {
          "s": "PYTH:WTI3!",
          "d": "WTI Crude Oil"
        },
        {
          "s": "BMFBOVESPA:CCM1!",
          "d": "Corn"
        }
      ],
      "originalTitle": "Futures"
    },
    {
      "title": "Bonds",
      "symbols": [
        {
          "s": "EUREX:FGBL1!",
          "d": "Euro Bund"
        },
        {
          "s": "EUREX:FBTP1!",
          "d": "Euro BTP"
        },
        {
          "s": "EUREX:FGBM1!",
          "d": "Euro BOBL"
        }
      ],
      "originalTitle": "Bonds"
    },
    {
      "title": "Forex",
      "symbols": [
        {
          "s": "FX:EURUSD",
          "d": "EUR to USD"
        },
        {
          "s": "FX:GBPUSD",
          "d": "GBP to USD"
        },
        {
          "s": "FX:USDJPY",
          "d": "USD to JPY"
        },
        {
          "s": "FX:USDCHF",
          "d": "USD to CHF"
        },
        {
          "s": "FX:AUDUSD",
          "d": "AUD to USD"
        },
        {
          "s": "FX:USDCAD",
          "d": "USD to CAD"
        }
      ],
      "originalTitle": "Forex"
    }
  ],
  "support_host": "https://www.tradingview.com",
  "width": "100%",
  "height": "100%",
  "showSymbolLogo": true,
  "showChart": true
}
  </script>
</div>
<!-- TradingView Widget END -->    </Card>
    </div>

    <!-- Quick Trade Section -->
    <div class="space-y-6">
      <!-- Signal Strength Card -->
      <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle class="text-sm font-bold uppercase tracking-wider text-[#8e90a0]">Signal Strength</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Strength Percentage -->
          <div class="flex items-end justify-between">
            <div>
              <p class="text-3xl font-bold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">
                {signalStrength.strength}%
              </p>
              <p class="text-xs text-[#8e90a0] mt-1">
                {signalStrength.status}
              </p>
            </div>
            <!-- Status Indicator -->
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full {signalStrength.status === 'Strong' ? 'bg-green-500' : signalStrength.status === 'Good' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse"></div>
              <span class="text-xs font-semibold {signalStrength.status === 'Strong' ? 'text-green-500' : signalStrength.status === 'Good' ? 'text-yellow-500' : 'text-red-500'}">
                {signalStrength.status}
              </span>
            </div>
          </div>

          <!-- Signal Bars -->
          <div class="flex items-end justify-center gap-2 h-16">
            {#each signalStrength.bars as isActive, index}
              <div
                class="flex-1 rounded-sm transition-all duration-300 ease-out {isActive ? 'bg-gradient-to-t from-[#2563eb] to-[#3b82f6] shadow-lg shadow-blue-500/50' : 'bg-[#1e293b]'}"
                style="height: {(index + 1) * 20}%;"
              ></div>
            {/each}
          </div>

          <!-- Signal Info -->
          <div class="pt-2 border-t border-[#1e90ff]/10">
            <p class="text-[10px] text-[#8e90a0] text-center">
              {signalStrength.status === 'Strong' ? 'Market conditions optimal' : signalStrength.status === 'Good' ? 'Market conditions favorable' : 'Market conditions unstable'}
            </p>
          </div>
        </CardContent>
      </Card>
     
      <!-- Market Ticker Card -->
      <Card class="bg-[#111827]/50 border-[#1e90ff]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle class="text-sm font-bold uppercase tracking-wider text-[#8e90a0]">Market Watch</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="divide-y divide-[#444654]/20">
            {#each [
              { asset: "EUR/USD", price: "1.08420", change: "+0.04%" },
              { asset: "GBP/USD", price: "1.27540", change: "-0.12%" },
              { asset: "USD/JPY", price: "154.32", change: "+0.45%" },
              { asset: "XAU/USD", price: "2,312.40", change: "-0.22%" },
            ] as ticker}
              <div class="flex items-center justify-between px-6 py-3 hover:bg-white/5 cursor-pointer transition-colors">
                <span class="text-sm font-bold text-[#dfe2f3]" style="font-family:'JetBrains Mono',monospace;">{ticker.asset}</span>
                <div class="text-right">
                  <p class="text-sm font-bold text-[#dfe2f3] font-mono">{ticker.price}</p>
                  <p class="text-[10px] {ticker.change.startsWith('+') ? 'text-green-500' : 'text-red-500'} font-bold">{ticker.change}</p>
                </div>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

<style>
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 8px rgba(37, 99, 235, 0.5);
    }
    50% {
      box-shadow: 0 0 16px rgba(37, 99, 235, 0.8);
    }
  }
</style>
