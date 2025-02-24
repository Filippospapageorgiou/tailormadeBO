<script lang="ts">
    import { Select, type WithoutChildren } from "bits-ui";
    import { Check } from "lucide-svelte";
    import { ChevronDown, ChevronUp } from "lucide-svelte";
   
    type Props = WithoutChildren<Select.RootProps> & {
        placeholder?: string;
        items: { value: string; label: string; disabled?: boolean }[];
        contentProps?: WithoutChildren<Select.ContentProps>;
    };
 
    let { 
        value = $bindable() as string, 
        items, 
        contentProps, 
        placeholder = "Επιλέξτε...", 
        ...restProps 
    }: Props = $props();
 
    // Προσθέστε fallback για περιπτώσεις που δεν υπάρχει επιλεγμένη τιμή
    const selectedLabel = $derived(
        items.find((item) => item.value === value)?.label || placeholder
    );
</script>
   
<Select.Root 
    bind:value={value as never} 
    {...restProps}
    >
    <Select.Trigger
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A] bg-white text-left flex items-center justify-between"
        aria-label={placeholder}
    >
        <span class={value ? "text-neutral-800" : "text-neutral-500"}>
            {selectedLabel}
        </span>
        <ChevronDown class="text-neutral-500 ml-auto size-4" />
    </Select.Trigger>
    <Select.Portal>
        <Select.Content
            class="z-50 bg-white border border-gray-200 shadow-lg rounded-md py-1 w-[var(--bits-select-anchor-width)] overflow-hidden"
            sideOffset={4}
            align="start"
            {...contentProps}
        >
            <Select.ScrollUpButton class="flex w-full items-center justify-center h-6 bg-white border-b border-gray-100">
                <ChevronUp class="size-3 text-neutral-500" />
            </Select.ScrollUpButton>
            <Select.Viewport class="p-1 max-h-60">
                {#each items as item (item.value)}
                    <Select.Item
                        class="flex items-center px-3 py-2 text-sm rounded-md text-neutral-800 hover:bg-[#8B6B4A]/10 data-highlighted:bg-[#8B6B4A]/10 outline-none cursor-pointer"
                        value={item.value}
                        label={item.label}
                        disabled={item.disabled}
                    >
                        {#snippet children({ selected })}
                            <span>{item.label}</span>
                            {#if selected}
                                <div class="ml-auto text-[#8B6B4A]">
                                    <Check size={16} />
                                </div>
                            {/if}
                        {/snippet}
                    </Select.Item>
                {/each}
            </Select.Viewport>
            <Select.ScrollDownButton class="flex w-full items-center justify-center h-6 bg-white border-t border-gray-100">
                <ChevronDown class="size-3 text-neutral-500" />
            </Select.ScrollDownButton>
        </Select.Content>
    </Select.Portal>
</Select.Root>