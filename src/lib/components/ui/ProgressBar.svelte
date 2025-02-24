<script lang="ts">
    import { Progress, useId } from "bits-ui";
    import { fade } from 'svelte/transition';
    
    let {
        value = $bindable(0),
        max = 100,
        min = 0,
        label = '',
        showValue = true,
        autoHide = false,
        class: className = ''
    } = $props();
    
    const labelId = useId();
    let visible = $state(true);
    
    // Αυτόματη απόκρυψη μετά την ολοκλήρωση αν είναι ενεργοποιημένο το autoHide
    $effect(() => {
        if (autoHide && value >= max) {
            const timer = setTimeout(() => {
                visible = false;
            }, 800); // Καθυστέρηση πριν την απόκρυψη
            
            return () => clearTimeout(timer);
        }
    });
</script>

{#if visible}
<div 
    class={`transition-opacity duration-300 ${className}`}
    transition:fade={{ duration: 300 }}
>
    <div class="flex items-center justify-between text-sm font-medium mb-1.5">
        {#if label}
            <span id={labelId}>{label}</span>
        {/if}
        {#if showValue}
            <span class="text-[#8B6B4A] font-medium">{value}%</span>
        {/if}
    </div>
    <Progress.Root
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? "Progress bar" : undefined}
        value={value}
        {max}
        {min}
        class="bg-gray-100 shadow-inner relative h-2 w-full overflow-hidden rounded-full"
    >
        <div
            class="bg-[#8B6B4A] h-full w-full flex-1 rounded-full transition-all duration-500 ease-in-out"
            style={`transform: translateX(-${100 - (100 * (value ?? 0)) / 100}%)`}
        ></div>
    </Progress.Root>
</div>
{/if}