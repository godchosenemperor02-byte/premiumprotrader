<script>
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

	let { data } = $props();

	// Reactive State (Svelte 5 Runes)
	let amount = $state('');
	let stopLoss = $state('');
	let takeProfit = $state('');
	let showAlert = $state(false);
	let alertMessage = $state('');
	let isSuccess = $state(true);

	let timer;

	const handleMax = () => {
		amount = data.profile.balance;
	};

	const trade = (type) => {
		const tradeAmount = parseFloat(amount);

		if (!tradeAmount || tradeAmount <= 0) {
			alertMessage = "Please enter a valid trade amount.";
			isSuccess = false;
		} else if (tradeAmount > data.profile.balance) {
			alertMessage = "Your balance is too low for this order.";
			isSuccess = false;
		} else {
			alertMessage = `Your ${type.toUpperCase()} trade for $${tradeAmount} has been placed. Contact your account manager for details.`;
			isSuccess = true;
		}

		showAlert = true;

		// Clear previous timeout if user clicks rapidly
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			showAlert = false;
		}, 5000);
	};
</script>

<div class="space-y-4">
	<!-- Top Bar / Header -->
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
		<section>
			<h2 class="text-2xl font-serif font-bold py-1 italic text-white">Live Trading</h2>
			<h5 class="text-sm text-[#8e90a0] italic font-medium">
				Professional trading with realtime market data
			</h5>
		</section>

		<Card class="bg-[#111827]/40 border-[#1e90ff]/10 backdrop-blur-md min-w-[220px]">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-[10px] font-bold uppercase tracking-wider text-[#8e90a0]">
					Available Balance
				</CardTitle>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					class="h-4 w-4 text-[#e6c364]"
				>
					<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
				</svg>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white font-mono">
					${data.profile.balance}
				</div>
				<p class="text-xs mt-1 font-medium">
					<span class="text-[#8e90a0] font-normal tracking-tight">from last session</span>
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- TradingView Chart Widget -->
	<Card class="bg-[#0a0e1a] border-[#1e90ff]/10 h-[500px] relative overflow-hidden shadow-2xl shadow-blue-900/10">
		<div class="tradingview-widget-container h-full w-full">
			<div class="tradingview-widget-container__widget h-full w-full"></div>
			<script
				type="text/javascript"
				src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
				async
			>
				{
					"autosize": true,
					"symbol": "BINANCE:BTCUSDT",
					"interval": "1",
					"timezone": "Etc/UTC",
					"theme": "dark",
					"style": "1",
					"locale": "en",
					"enable_publishing": false,
					"hide_side_toolbar": false,
					"allow_symbol_change": true,
					"calendar": false,
					"backgroundColor": "rgba(10, 14, 26, 1)",
					"gridColor": "rgba(30, 144, 255, 0.05)",
					"hide_top_toolbar": false,
					"save_image": false,
					"support_host": "https://www.tradingview.com"
				}
			</script>
		</div>
	</Card>

	<!-- Order Execution Card -->
	<Card class="bg-[#111827]/60 border-[#1e90ff]/20 backdrop-blur-xl border-t-2 border-t-[#1e90ff]/40">
		<CardHeader class="pb-2 border-b border-[#1e90ff]/5 mb-4">
			<div class="flex justify-between items-center">
				<CardTitle class="text-white font-bold text-lg tracking-tight">Quick Trade</CardTitle>
				<div class="flex items-center gap-1.5">
					<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
					<span class="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live</span>
				</div>
			</div>
		</CardHeader>

		<CardContent class="space-y-6">
			<!-- Pair Banner -->
			<div class="flex items-center justify-between bg-[#0a0e1a]/80 p-4 rounded-xl border border-[#1e90ff]/10 shadow-inner">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-[#f7931a] rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(247,147,26,0.3)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M11.75 8a2 2 0 1 0-2 2"/><path d="M18 12a2 2 0 1 0-2 2"/><path d="M7 12a2 2 0 1 0-2 2"/><path d="M11.75 16a2 2 0 1 0-2 2"/><path d="M13 10a2 2 0 1 0-2-2"/><path d="M8 14a2 2 0 1 0-2-2"/><path d="M16 14a2 2 0 1 0-2-2"/><path d="M13 18a2 2 0 1 0-2-2"/><circle cx="12" cy="12" r="10"/>
						</svg>
					</div>
					<div>
						<p class="text-sm font-bold text-white leading-none mb-1">BTC/USDT</p>
						<p class="text-[10px] text-[#8e90a0] font-medium">Bitcoin / Tether</p>
					</div>
				</div>
				<div class="text-right">
					<p class="text-[10px] text-green-400/70 font-medium">+1.24%</p>
				</div>
			</div>

			<!-- Amount Input -->
			<div class="space-y-2">
				<div class="flex justify-between items-end mb-1">
					<label for="amount" class="text-[10px] font-bold uppercase text-[#8e90a0] tracking-widest">Amount (USD)</label>
					<button type="button" onclick={handleMax} class="text-[10px] text-[#1e90ff] font-bold hover:underline uppercase">
						Balance: ${data.profile.balance}
					</button>
				</div>
				<div class="relative group">
					<input
						id="amount"
						type="number"
						step="0.01"
						bind:value={amount}
						placeholder="0.00"
						class="w-full bg-[#0a0e1a] border border-[#1e90ff]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e90ff]/40 transition-all text-white font-mono placeholder:text-gray-700 group-hover:border-[#1e90ff]/20"
					/>
					<div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
						<div class="h-4 w-[1px] bg-[#1e90ff]/20"></div>
						<button type="button" onclick={handleMax} class="text-[10px] font-black text-[#1e90ff] hover:text-[#b7c4ff] transition-colors">
							MAX
						</button>
					</div>
				</div>
			</div>

			<!-- Buy/Sell Buttons -->
			<div class="grid grid-cols-2 gap-4">
				<button
					type="button"
					onclick={() => trade('buy')}
					class="group relative overflow-hidden p-4 bg-green-500/5 border border-green-500/20 rounded-2xl transition-all hover:bg-green-500/10 active:scale-[0.97] hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
				>
					<div class="relative z-10 flex items-center justify-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
						<p class="text-xs font-bold text-green-500 uppercase tracking-widest">Buy / Long</p>
					</div>
				</button>

				<button
					type="button"
					onclick={() => trade('sell')}
					class="group relative overflow-hidden p-4 bg-red-500/5 border border-red-500/20 rounded-2xl transition-all hover:bg-red-500/10 active:scale-[0.97] hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
				>
					<div class="relative z-10 flex items-center justify-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
						<p class="text-xs font-bold text-red-500 uppercase tracking-widest">Sell / Short</p>
					</div>
				</button>
			</div>

			<!-- Risk Parameters -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="stopLoss" class="text-[10px] font-bold uppercase text-[#c9c9c9] tracking-widest">Stop Loss</label>
					<input
						id="stopLoss"
						type="number"
						step="0.01"
						bind:value={stopLoss}
						placeholder="Price target"
						class="w-full bg-[#0a0e1a]/50 border border-[#1e90ff]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1e90ff]/30 text-white placeholder:text-gray-700"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="takeProfit" class="text-[10px] font-bold uppercase text-[#c9c9c9] tracking-widest">Take Profit</label>
					<input
						id="takeProfit"
						type="number"
						step="0.01"
						bind:value={takeProfit}
						placeholder="Price target"
						class="w-full bg-[#0a0e1a]/50 border border-[#1e90ff]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1e90ff]/30 text-white placeholder:text-gray-700"
					/>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Notification Toast -->
	{#if showAlert}
		<div
			class="w-full max-w-lg mx-auto rounded-xl border px-4 py-3 shadow-lg fixed bottom-6 inset-x-0 z-50 transition-all backdrop-blur-md
			{isSuccess
				? 'bg-green-950/90 border-green-500/40 text-green-200'
				: 'bg-red-950/90 border-red-500/40 text-red-200'}"
		>
			<div class="flex items-center gap-3">
				<span class="text-base">{isSuccess ? '✅' : '⚠️'}</span>
				<p class="font-medium text-xs sm:text-sm">{alertMessage}</p>
			</div>
		</div>
	{/if}
</div>