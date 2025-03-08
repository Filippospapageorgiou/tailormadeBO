<script lang="ts">
	import type { Snippet } from "svelte";
	import type { Beverage } from "$lib/types/database.types";
	import { Dialog, type WithoutChild } from "bits-ui";
	import { fade, fly } from 'svelte/transition';
	import { Pencil } from "lucide-svelte";
    import { invalidateAll } from "$app/navigation";
	import Label from "$lib/components/ui/Label.svelte";
 
	type Props = Dialog.RootProps & {
		beverage: Beverage;
		title?: Snippet;
		description?: Snippet;
        execution?: Snippet;
		contentProps?: WithoutChild<Dialog.ContentProps>;
	};
 
	let {
		open = $bindable(false),
		beverage,
		title,
		description,
        execution,
		contentProps,
		...restProps
	}: Props = $props();
	
	
    let name = $state(beverage.name || "");
    let beverageDescription = $state(beverage.description || "");
    let beverageExecution = $state(beverage.execution || "");
    let imageUrl = $state(beverage.image_url || "");
    let isLoading = $state(false);
   
    $effect(() => {
        if (beverage) {
            name = beverage.name || "";
            beverageDescription = beverage.description || "";
            imageUrl = beverage.image_url || "";
        }
    });
	
	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			setTimeout(() => {
			}, 300);
		}
	}

    function wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    
    async function handleSubmit() {
        isLoading = true;
        
        try {
            await wait(800); 
            await invalidateAll();
            open = false;
        } catch (error) {
            console.error("Σφάλμα κατά την ενημέρωση ροφήματος:", error);
        } finally {
            isLoading = false;
        }
    }
</script>
 
<Dialog.Root bind:open onOpenChange={handleOpenChange} {...restProps}>
	<Dialog.Trigger class="p-1 rounded-full bg-white shadow-sm hover:shadow-md
        text-[#8B6B4A] hover:text-[#6F563C] transition-all duration-200
        border border-transparent hover:border-[#8B6B4A]/20">
		<Pencil size={14} />
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay forceMount>
			{#snippet child({ props, open: isOpen })}
				{#if isOpen}
					<div 
						{...props} 
						transition:fade={{ duration: 200 }}
						class="fixed inset-0 z-50 bg-black/50"
					></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>
		<Dialog.Content 
			forceMount
			class="rounded-lg shadow-lg"
			onInteractOutside={(e) => {
				if (open) e.preventDefault();
			}}
		>
			{#snippet child({ props, open: isOpen })}
				{#if isOpen}
					<div 
						{...props} 
						transition:fly={{ duration: 300, y: 10 }}
						class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-white p-6 shadow-lg rounded-lg max-h-[90vh] overflow-y-auto"
					>
						<div class="flex flex-col gap-2">
							<Dialog.Title class="text-xl font-semibold text-neutral-900">
								{#if title}
                                    {@render title()}
                                {:else}
                                    Επεξεργασία Ροφήματος
                                {/if}
							</Dialog.Title>
							<Dialog.Description class="text-sm text-neutral-500">
								{#if description}
                                    {@render description()}
                                {:else}
                                    Τροποποιήστε τις πληροφορίες του ροφήματος.
                                {/if}
							</Dialog.Description>
						</div>
                        
                        <form method="post" action="?/updateBeverage" class="space-y-4"
                            onsubmit={handleSubmit}
                        >
                            <input type="hidden" name="id" value={beverage.id} />
                            
                            <div class="space-y-2">
                                <Label for="name" required>
                                    Όνομα Ροφήματος
                                </Label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    required
                                    bind:value={name}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                                    placeholder="Cappuccino"
                                />
                            </div>
                            
                            <div class="space-y-2">
                                <Label for="description">
                                    Περιγραφή
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    bind:value={beverageDescription}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                                    placeholder="Προαιρετική περιγραφή του ροφήματος..."
                                ></textarea>
                            </div>

                            <div class="space-y-2">
                                <Label for="execution">
                                    Υλοποιήση συνταγής
                                </Label>
                                <textarea
                                    id="execution"
                                    name="execution"
                                    rows="3"
                                    bind:value={beverageExecution}
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                                    placeholder="Προαιρετική υλοποιήση του ροφήματος..."
                                ></textarea>
                            </div>
                            
                            <div class="space-y-2">
                                <Label for="image_url">
                                    URL Εικόνας
                                </Label>
                                <input 
                                    type="text"
                                    id="image_url" 
                                    name="image_url"
                                    readonly
                                    bind:value={imageUrl}
                                    class="w-full px-3 py-2 shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button" 
                                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2"
                                    onclick={() => open = false}
                                    disabled={isLoading}
                                >
                                    Ακύρωση
                                </button>
                                <button 
                                    type="submit" 
                                    class="px-4 py-2 text-sm font-medium text-white bg-[#8B6B4A] border border-transparent rounded-md shadow-sm hover:bg-[#6F563C] focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2 inline-flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    {#if isLoading}
                                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    {/if}
                                    Ενημέρωση
                                </button>
                            </div>
                        </form>
						
						<Dialog.Close class="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-all duration-200">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
								<path d="M18 6 6 18"/>
								<path d="m6 6 12 12"/>
							</svg>
						</Dialog.Close>
					</div>
				{/if}
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>