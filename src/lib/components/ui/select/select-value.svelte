<script>
	import { Select as SelectPrimitive } from "bits-ui";

	let { placeholder, ...restProps } = $props();
</script>

<SelectPrimitive.Value {placeholder} {...restProps} />
