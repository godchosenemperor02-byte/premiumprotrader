<script>
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

	let { data } = $props();

	// Reactive State (Svelte 5 Runes)
	let amount = $state('');
	let stopLoss = $state('');
	let takeProfit = $state('');
	let leverage = $state('1x');
	let duration = $state('1h');
	let showAlert = $state(false);
	let alertMessage = $state('');
	let isSuccess = $state(true);

	let timer;

	const leverageOptions = ['1x', '2x', '5x', '10x', '25x', '50x', '100x'];
	const durationOptions = ['5m', '15m', '30m', '1h', '4h', '1d', '1w'];

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
			const leverageValue = leverage.replace('x', '');
			alertMessage = `Your ${type.toUpperCase()} trade for $${tradeAmount} with ${leverage} leverage for ${duration} has been placed. Contact your account manager for details.`;
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
					Available Capital
				</CardTitle>
				
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white font-mono">
					{data.profile.currency} {data.profile.capital}
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
	<Card class="bg-gradient-to-br from-[#111827] to-[#0a0e1a] border-[#1e90ff]/20 backdrop-blur-xl border-t-2 border-t-[#1e90ff]/40 shadow-xl">
		<CardHeader class="pb-4 border-b border-[#1e90ff]/10 mb-6">
			<div class="flex justify-between items-center">
				<div>
					<CardTitle class="text-white font-bold text-xl tracking-tight mb-1">Quick Trade Execution</CardTitle>
					<p class="text-xs text-[#8e90a0]">Execute trades with precision risk management and advanced options</p>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
					<span class="text-[11px] font-semibold text-green-400 uppercase tracking-widest">Market Open</span>
				</div>
			</div>
		</CardHeader>

		<CardContent class="space-y-7">
			<!-- Pair Banner -->
			<div class="flex items-center justify-between bg-gradient-to-r from-[#0a0e1a]/60 to-[#1a1f3a]/40 p-5 rounded-lg border border-[#1e90ff]/15 shadow-lg">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-gradient-to-br from-[#f7931a] to-[#e68a1a] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(247,147,26,0.4)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M11.75 8a2 2 0 1 0-2 2"/><path d="M18 12a2 2 0 1 0-2 2"/><path d="M7 12a2 2 0 1 0-2 2"/><path d="M11.75 16a2 2 0 1 0-2 2"/><path d="M13 10a2 2 0 1 0-2-2"/><path d="M8 14a2 2 0 1 0-2-2"/>
						</svg>
					</div>
					<div>
						<p class="text-base font-bold text-white leading-none mb-1">BTC/USDT</p>
						<p class="text-xs text-[#8e90a0] font-medium">Bitcoin / Tether USDT</p>
					</div>
				</div>
				<div class="text-right">
					<p class="text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">+1.24%</p>
				</div>
			</div>

			<!-- Amount Input -->
			<div class="space-y-3">
				<div class="flex justify-between items-end mb-2">
					<label for="amount" class="text-xs font-bold uppercase text-[#8e90a0] tracking-wider">Trade Amount ({data.profile.currency})</label>
					<button type="button" onclick={handleMax} class="text-xs text-[#1e90ff] font-semibold hover:text-[#b7c4ff] transition-colors uppercase tracking-wider">
						Max: ${data.profile.capital}
					</button>
				</div>
				<div class="relative group">
					<input
						id="amount"
						type="number"
						step="0.01"
						bind:value={amount}
						placeholder="Enter amount"
						class="w-full bg-[#0a0e1a]/80 border border-[#1e90ff]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1e90ff]/60 focus:bg-[#0a0e1a] focus:shadow-[0_0_15px_rgba(30,144,255,0.2)] transition-all text-white font-mono placeholder:text-[#404854]"
					/>
					<div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
						<div class="h-5 w-px bg-[#1e90ff]/20"></div>
						<button type="button" onclick={handleMax} class="text-xs font-bold text-[#1e90ff] hover:text-[#b7c4ff] transition-colors">
							MAX
						</button>
					</div>
				</div>
			</div>

			<!-- Leverage and Duration Controls -->
			<div class="grid grid-cols-2 gap-4">
				<!-- Leverage Selector -->
				<div class="space-y-2">
					<label for="leverage" class="text-xs font-bold uppercase text-[#8e90a0] tracking-wider">Leverage</label>
					<select
						id="leverage"
						bind:value={leverage}
						class="w-full bg-[#0a0e1a]/80 border border-yellow-500/20 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-yellow-500/60 focus:shadow-[0_0_12px_rgba(234,179,8,0.15)] transition-all text-white font-semibold placeholder:text-[#404854] appearance-none cursor-pointer"
					>
						{#each leverageOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<!-- Duration Selector -->
				<div class="space-y-2">
					<label for="duration" class="text-xs font-bold uppercase text-[#8e90a0] tracking-wider">Trade Duration</label>
					<select
						id="duration"
						bind:value={duration}
						class="w-full bg-[#0a0e1a]/80 border border-purple-500/20 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all text-white font-semibold placeholder:text-[#404854] appearance-none cursor-pointer"
					>
						{#each durationOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Risk Parameters -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="stopLoss" class="text-xs font-bold uppercase text-[#8e90a0] tracking-wider">Stop Loss ({data.profile.currency})</label>
					<input
						id="stopLoss"
						type="number"
						step="0.01"
						bind:value={stopLoss}
						placeholder="Price level"
						class="w-full bg-[#0a0e1a]/80 border border-red-500/20 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-red-500/60 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)] transition-all text-white font-mono placeholder:text-[#404854]"
					/>
				</div>
				<div class="space-y-2">
					<label for="takeProfit" class="text-xs font-bold uppercase text-[#8e90a0] tracking-wider">Take Profit ({data.profile.currency})</label>
					<input
						id="takeProfit"
						type="number"
						step="0.01"
						bind:value={takeProfit}
						placeholder="Price level"
						class="w-full bg-[#0a0e1a]/80 border border-green-500/20 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-green-500/60 focus:shadow-[0_0_12px_rgba(34,197,94,0.15)] transition-all text-white font-mono placeholder:text-[#404854]"
					/>
				</div>
			</div>

			<!-- Buy/Sell Buttons -->
			<div class="grid grid-cols-2 gap-4 pt-2">
				<button
					type="button"
					onclick={() => trade('buy')}
					class="group relative overflow-hidden p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all hover:shadow-[0_0_25px_rgba(34,197,94,0.15)] active:scale-95"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-green-500/10 group-hover:to-green-500/5 transition-all"></div>
					<div class="relative z-10 flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
							<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
							<polyline points="17 6 23 6 23 12"></polyline>
						</svg>
						<span class="text-sm font-bold text-green-400 uppercase tracking-wide">Buy / Long</span>
					</div>
				</button>

				<button
					type="button"
					onclick={() => trade('sell')}
					class="group relative overflow-hidden p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] active:scale-95"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:via-red-500/10 group-hover:to-red-500/5 transition-all"></div>
					<div class="relative z-10 flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
							<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
							<polyline points="17 18 23 18 23 12"></polyline>
						</svg>
						<span class="text-sm font-bold text-red-400 uppercase tracking-wide">Sell / Short</span>
					</div>
				</button>
			</div>

			<!-- Trade Summary Box -->
			<div class="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-[#0a0e1a]/40 to-[#1a1f3a]/20 border border-[#1e90ff]/10 rounded-lg">
				<div class="text-center">
					<p class="text-[10px] text-[#8e90a0] font-semibold uppercase tracking-wider mb-1">Leverage</p>
					<p class="text-sm font-bold text-yellow-400">{leverage}</p>
				</div>
				<div class="text-center border-l border-r border-[#1e90ff]/10">
					<p class="text-[10px] text-[#8e90a0] font-semibold uppercase tracking-wider mb-1">Duration</p>
					<p class="text-sm font-bold text-purple-400">{duration}</p>
				</div>
				<div class="text-center">
					<p class="text-[10px] text-[#8e90a0] font-semibold uppercase tracking-wider mb-1">Position Size</p>
					<p class="text-sm font-bold text-blue-400">${(parseFloat(amount) * parseInt(leverage)).toFixed(2) || '0.00'}</p>
				</div>
			</div>

			<!-- Info Text -->
			<div class="pt-2 px-3 py-3 bg-[#0a0e1a]/60 border border-[#1e90ff]/10 rounded-lg">
				<p class="text-xs text-[#8e90a0] leading-relaxed">
					<span class="text-[#1e90ff] font-semibold">⚡ Tip:</span> Set stop loss and take profit levels to automate your risk management strategy. Higher leverage increases both potential profits and risks.
				</p>
			</div>
		</CardContent>
	</Card>

	<!-- Notification Toast -->
	{#if showAlert}
		<div
			class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
		>
			<div
				class="rounded-lg border backdrop-blur-xl shadow-2xl p-4 flex items-start gap-4
				{isSuccess
					? 'bg-gradient-to-r from-green-950/80 to-green-900/60 border-green-500/40 shadow-green-500/20'
					: 'bg-gradient-to-r from-red-950/80 to-red-900/60 border-red-500/40 shadow-red-500/20'}"
			>
				<!-- Icon -->
				<div class="flex-shrink-0 mt-0.5">
					{#if isSuccess}
						<div class="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</div>
					{:else}
						<div class="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</div>
					{/if}
				</div>

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<h3 class={`font-semibold text-sm mb-1 ${isSuccess ? 'text-green-200' : 'text-red-200'}`}>
						{isSuccess ? 'Trade Placed Successfully' : 'Trade Error'}
					</h3>
					<p class={`text-xs leading-relaxed ${isSuccess ? 'text-green-300/80' : 'text-red-300/80'}`}>
						{alertMessage}
					</p>
				</div>

				<!-- Close Button -->
				<button
					type="button"
					onclick={() => (showAlert = false)}
					class={`flex-shrink-0 text-xl leading-none transition-colors ${
						isSuccess
							? 'text-green-400/60 hover:text-green-400'
							: 'text-red-400/60 hover:text-red-400'
					}`}
				>
					✕
				</button>
			</div>
		</div>
	{/if}
</div>
