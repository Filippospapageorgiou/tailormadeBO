<script lang="ts">
    import { Label } from "bits-ui";
    import type { Snippet } from "svelte";

    let {
        id = '',
        for: htmlFor = '',
        required = false,
        children,
        class: className = '',
        ...rest
    } = $props<{
        id?: string;
        for?: string;
        required?: boolean;
        children: Snippet;
        class?: string;
        [key: string]: any;
    }>();
</script>

<Label.Root
    {id}
    for={htmlFor}
    class={`block text-sm font-medium text-neutral-700 mb-1.5 ${className}`}
    {...rest}
>
    {@render children()}
    {#if required}
        <span class="text-red-500 ml-0.5">*</span>
    {/if}
</Label.Root>