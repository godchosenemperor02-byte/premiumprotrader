<script>
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(undefined),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<TabsPrimitive.Root
	bind:ref
	bind:value
	class={cn("flex flex-col", className)}
	{...restProps}
>
	{@render children?.()}
</TabsPrimitive.Root>
