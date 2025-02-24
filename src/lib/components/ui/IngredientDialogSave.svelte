<script lang="ts">
	import type { Snippet } from "svelte";
	import { Dialog, type WithoutChild } from "bits-ui";
	import { fade, fly } from 'svelte/transition';
	import { Plus } from "lucide-svelte";
    import { invalidateAll } from "$app/navigation"; 
	import Label from "./Label.svelte";
    import Select from "./Select.svelte";
    import ProgressBar from "./ProgressBar.svelte";
 
	type Props = Dialog.RootProps & {
		buttonText: string;
		title: Snippet;
		description: Snippet;
		contentProps?: WithoutChild<Dialog.ContentProps>;
	};
 
	let {
		open = $bindable(false),
		children,
		buttonText,
		contentProps,
		title,
		description,
		...restProps
	}: Props = $props();
	
	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			setTimeout(() => {
			}, 300);
		}
	}

    function wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    
     // Κατηγορίες συστατικών
     const categoryItems = [
        { value: "Γαλακτοκομικά", label: "Γαλακτοκομικά" },
        { value: "Κάφες", label: "Κάφες" },
        { value: "Νέρο", label: "Νέρο" },
        { value: "Τσαι", label: "Τσάι" },
        { value: "Matcha", label: "Matcha" },
    ];
    
    // Μονάδες μέτρησης
    const unitItems = [
        { value: "γραμμάρια (g)", label: "γραμμάρια (g)" },
        { value: "κιλά (kg)", label: "κιλά (kg)" },
        { value: "μιλιλίτρα (ml)", label: "μιλιλίτρα (ml)" },
        { value: "λίτρα (l)", label: "λίτρα (l)" },
        { value: "κουταλιά της σούπας (tbsp)", label: "κουταλιά της σούπας (tbsp)" },
    ];

    let category = $state("");
    let unit = $state("");
</script>
 
<Dialog.Root bind:open onOpenChange={handleOpenChange} {...restProps}>
	<Dialog.Trigger class="flex items-center gap-2 px-4 py-2 bg-[#8B6B4A] text-white rounded-lg hover:bg-[#6F563C] transition-colors duration-300 w-full sm:w-auto">
		<span class="flex items-center gap-2">
		  <Plus />{buttonText}
		</span>
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
								{@render title()}
							</Dialog.Title>
							<Dialog.Description class="text-sm text-neutral-500">
								{@render description()}
							</Dialog.Description>
						</div>
						
						
						{@render children?.()}
                        
                        <form method="post" action="?/addIngredient" class="space-y-4"
                            onsubmit={async () => {
                                await wait(1000);
                                open = false;
                                await invalidateAll();
                            }}
                        >
                            <div class="space-y-2">
                                <Label for="name" required>
                                    Όνομα Συστατικού
                                </Label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    required                                       
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                                    placeholder="Αλέσμενος κάφες"
                                />
                            </div>
                            
                            <div class="space-y-2">
                                <Label for="category" required>
                                    Κατηγορία Συστατικού
                                </Label>
                                <Select 
                                    type="single"
                                    items={categoryItems} 
                                    bind:value={category}
                                    placeholder="Επιλέξτε κατηγορία (προαιρετικό)"
                                />
                                <input type="hidden" name="category" value={category} required/>
                            </div>
                            
                            <div class="space-y-2">
                                <Label for="measurement_unit" required>
                                    Μονάδα Μέτρησης
                                </Label>
                                <Select 
                                    type="single"
                                    items={unitItems} 
                                    bind:value={unit}
                                    placeholder="Επιλέξτε μονάδα μέτρησης"
                                    required
                                />
                                <input type="hidden" name="measurement_unit" value={unit} required />
                            </div>
                            
                            <div class="space-y-2">
                                <Label for="description">
                                    Περιγραφή
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                                    placeholder="Προαιρετική περιγραφή του συστατικού..."
                                ></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button" 
                                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2"
                                    onclick={() => open = false}
                                >
                                    Ακύρωση
                                </button>
                                <button 
                                    type="submit" 
                                    class="px-4 py-2 text-sm font-medium text-white bg-[#8B6B4A] border border-transparent rounded-md shadow-sm hover:bg-[#6F563C] focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2"
                                >
                                    Αποθήκευση
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