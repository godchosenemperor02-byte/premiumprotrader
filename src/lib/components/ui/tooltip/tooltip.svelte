<script>
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	let { open = $bindable(false), delayDuration = 700, children, ...restProps } = $props();
</script>

<TooltipPrimitive.Root bind:open {delayDuration} {...restProps}>
	{@render children?.()}
</TooltipPrimitive.Root>
