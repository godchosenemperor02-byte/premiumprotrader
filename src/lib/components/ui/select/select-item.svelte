<script>
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import CheckIcon from '@lucide/svelte/icons/check';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	class={cn(
		"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
	{...restProps}
>
	{#snippet children({ selected })}
		<span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			{#if selected}
				<CheckIcon class="size-4" />
			{/if}
		</span>
		{@render children?.()}
	{/snippet}
</SelectPrimitive.Item>
