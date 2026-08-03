<script>
	import { onMount } from "svelte";
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
		amount = data.profile?.capital ?? 0;
	};

	const trade = (type) => {
		const tradeAmount = parseFloat(amount);
		const userCapital = parseFloat(data.profile?.capital ?? 0);

		if (!tradeAmount || tradeAmount <= 0) {
			alertMessage = "Please enter a valid trade amount.";
			isSuccess = false;
		} else if (tradeAmount > userCapital) {
			alertMessage = "Your available capital is too low for this order.";
			isSuccess = false;
		} else {
			alertMessage = `Your ${type.toUpperCase()} trade for ${data.profile?.currency || '$'}${tradeAmount.toLocaleString()} with ${leverage} leverage for ${duration} has been placed. Contact your account manager for details.`;
			isSuccess = true;
		}

		showAlert = true;

		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			showAlert = false;
		}, 5000);
	};

	// Safe TradingView script injector
	function loadTradingViewScript() {
		const container = document.getElementById("tv-advanced-chart");
		if (!container) return;
		container.innerHTML = "";

		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
		script.async = true;
		script.innerHTML = JSON.stringify({
			autosize: true,
			symbol: "BINANCE:BTCUSDT",
			interval: "1",
			timezone: "Etc/UTC",
			theme: "dark",
			style: "1",
			locale: "en",
			enable_publishing: false,
			hide_side_toolbar: false,
			allow_symbol_change: true,
			calendar: false,
			backgroundColor: "rgba(15, 23, 42, 0.6)",
			gridColor: "rgba(30, 41, 59, 0.5)",
			hide_top_toolbar: false,
			save_image: false,
			support_host: "https://www.tradingview.com"
		});
		container.appendChild(script);
	}

	onMount(() => {
		loadTradingViewScript();
		return () => {
			if (timer) clearTimeout(timer);
		};
	});
</script>

<div class="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100">
	<!-- Top Bar / Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/60 pb-6">
		<div class="space-y-1">
			<h1 class="text-3xl font-extrabold tracking-tight text-white font-serif">Live Trading</h1>
			<p class="text-slate-400 text-sm">
				Professional trading terminal powered by real-time market orderbooks.
			</p>
		</div>

		<Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-sm min-w-[240px]">
			<CardHeader class="pb-2">
				<CardTitle class="text-xs font-bold uppercase tracking-wider text-slate-400">
					Available Capital
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-slate-100 font-mono tracking-tight">
					{data.profile?.currency || '$'} {Number(data.profile?.capital ?? 0).toLocaleString()}
				</div>
				<p class="text-[11px] mt-1 text-slate-500 font-medium">Synced with current session</p>
			</CardContent>
		</Card>
	</div>

	<!-- TradingView Chart Widget -->
	<Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md overflow-hidden min-h-[520px] shadow-sm">
		<div id="tv-advanced-chart" class="w-full h-[520px]"></div>
	</Card>

	<!-- Order Execution Section -->
	<Card class="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-md overflow-hidden">
		<CardHeader class="border-b border-slate-800/60 py-4">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<div>
					<CardTitle class="text-lg font-bold text-slate-100 tracking-tight">Quick Trade Execution</CardTitle>
					<p class="text-xs text-slate-400 mt-0.5">Execute leveraged orders with customized stop parameters</p>
				</div>
				<div class="flex items-center gap-2 self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
					<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
					<span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Market Open</span>
				</div>
			</div>
		</CardHeader>

		<CardContent class="p-6 space-y-6">
			<!-- Pair Banner -->
			<div class="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
				<div class="flex items-center gap-3.5">
					<div class="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold font-mono">
						₿
					</div>
					<div>
						<p class="text-sm font-bold text-white font-mono leading-none">BTC/USDT</p>
						<p class="text-xs text-slate-400 mt-1">Bitcoin / Tether Perpetual</p>
					</div>
				</div>
				<div class="text-right">
					<span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
						+1.24%
					</span>
				</div>
			</div>

			<!-- Amount Input -->
			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<label for="amount" class="text-xs font-bold uppercase tracking-wider text-slate-400">
						Trade Amount ({data.profile?.currency || '$'})
					</label>
					<button 
						type="button" 
						onclick={handleMax} 
						class="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
					>
						Max: {data.profile?.currency || '$'}{Number(data.profile?.capital ?? 0).toLocaleString()}
					</button>
				</div>
				<div class="relative">
					<input
						id="amount"
						type="number"
						step="0.01"
						bind:value={amount}
						placeholder="0.00"
						class="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-4 pr-16 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
					/>
					<button 
						type="button" 
						onclick={handleMax} 
						class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors"
					>
						MAX
					</button>
				</div>
			</div>

			<!-- Controls Grid (Leverage & Duration) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="leverage" class="text-xs font-bold uppercase tracking-wider text-slate-400">Leverage</label>
					<select
						id="leverage"
						bind:value={leverage}
						class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500/80 transition-all cursor-pointer"
					>
						{#each leverageOptions as option}
							<option value={option} class="bg-slate-900 text-slate-200">{option}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<label for="duration" class="text-xs font-bold uppercase tracking-wider text-slate-400">Trade Duration</label>
					<select
						id="duration"
						bind:value={duration}
						class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500/80 transition-all cursor-pointer"
					>
						{#each durationOptions as option}
							<option value={option} class="bg-slate-900 text-slate-200">{option}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Risk Parameters Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="stopLoss" class="text-xs font-bold uppercase tracking-wider text-slate-400">
						Stop Loss ({data.profile?.currency || '$'})
					</label>
					<input
						id="stopLoss"
						type="number"
						step="0.01"
						bind:value={stopLoss}
						placeholder="Price level"
						class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500/80 transition-all"
					/>
				</div>

				<div class="space-y-2">
					<label for="takeProfit" class="text-xs font-bold uppercase tracking-wider text-slate-400">
						Take Profit ({data.profile?.currency || '$'})
					</label>
					<input
						id="takeProfit"
						type="number"
						step="0.01"
						bind:value={takeProfit}
						placeholder="Price level"
						class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/80 transition-all"
					/>
				</div>
			</div>

			<!-- Buy/Sell Execution Buttons -->
			<div class="grid grid-cols-2 gap-4 pt-2">
				<button
					type="button"
					onclick={() => trade('buy')}
					class="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
					</svg>
					<span>Buy / Long</span>
				</button>

				<button
					type="button"
					onclick={() => trade('sell')}
					class="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
					</svg>
					<span>Sell / Short</span>
				</button>
			</div>

			<!-- Order Summary Display -->
			<div class="grid grid-cols-3 gap-3 p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
				<div class="text-center">
					<p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Leverage</p>
					<p class="text-sm font-bold text-amber-400 font-mono">{leverage}</p>
				</div>
				<div class="text-center border-x border-slate-800/80">
					<p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Duration</p>
					<p class="text-sm font-bold text-indigo-400 font-mono">{duration}</p>
				</div>
				<div class="text-center">
					<p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Position Size</p>
					<p class="text-sm font-bold text-blue-400 font-mono">
						{data.profile?.currency || '$'}{((parseFloat(amount) || 0) * parseInt(leverage)).toFixed(2)}
					</p>
				</div>
			</div>

			<!-- Helper Information Footnote -->
			<div class="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
				<p class="text-xs text-slate-400 leading-relaxed flex items-center gap-2">
					<span class="text-blue-400 font-bold shrink-0">⚡ Tip:</span>
					Set stop loss and take profit parameters prior to order dispatch to automate risk mitigation.
				</p>
			</div>
		</CardContent>
	</Card>

	<!-- Notification Toast Container -->
	{#if showAlert}
		<div class="fixed bottom-15 right-10 max-w-md z-50 transition-all duration-300">
			<div
				class={`rounded-xl border backdrop-blur-md shadow-xl p-4 flex items-start gap-3.5 ${
					isSuccess
						? 'bg-slate-900/95 border-emerald-500/40 text-emerald-200'
						: 'bg-slate-900/95 border-rose-500/40 text-rose-200'
				}`}
			>
				<div class="shrink-0 mt-0.5">
					{#if isSuccess}
						<div class="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{:else}
						<div class="p-1 rounded-full bg-rose-500/20 text-rose-400">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
					{/if}
				</div>

				<div class="flex-1 min-w-0">
					<h3 class="font-bold text-sm">
						{isSuccess ? 'Trade Executed' : 'Order Error'}
					</h3>
					<p class="text-xs text-slate-300 mt-1 leading-relaxed">
						{alertMessage}
					</p>
				</div>

				<button
					type="button"
					onclick={() => (showAlert = false)}
					class="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
				>
					✕
				</button>
			</div>
		</div>
	{/if}
</div>
