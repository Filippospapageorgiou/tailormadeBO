<script lang="ts">
    import type { Ingredient } from "$lib/types/database.types";
    import type { PageData } from "./$types";
    import { fade } from 'svelte/transition';
    import { Search, Plus,Pencil } from 'lucide-svelte';
    import { onMount } from "svelte";
    import MyAlertDialog from "$lib/components/ui/MyAlertDialog.svelte.svelte";
    
	
    
    let { data }: { data: PageData } = $props();
    const ingredients: Ingredient[] = data.ingredients ?? [];
    const total: number = data.total ?? 0;
    
    let searchQuery = $state('');
    let mounted = $state(false);
    

    onMount(() => {
        setTimeout(() => {
            mounted = true;
        }, 0);
    });


	const handleEdit = (id: number) => {
        console.log('Edit ingredient:', id);
    };
</script>

{#if mounted}
<div class="space-y-4 pl-3 pb-3.5" transition:fade={{ duration: 400, delay: 100 }}>
    <!-- Header Section -->
    <div class="flex flex-col mx-auto pt-2" in:fade={{ duration: 400, delay: 150 }}>
        <p class="text-sm text-[#8B6B4A]">Διαθέσιμα Συστατικά: {total}</p>
    </div>

    <!-- Search and Actions Bar -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between"
         in:fade={{ duration: 500, delay: 200 }}>
        <div class="relative w-full sm:w-96">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Αναζήτηση συστατικού..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#8B6B4A] focus:border-transparent
                       placeholder:text-gray-400"
            />
        </div>
        
        <button 
            class="flex items-center gap-2 px-4 py-2 bg-[#8B6B4A] text-white rounded-lg
                   hover:bg-[#6F563C] transition-colors duration-300 w-full sm:w-auto"
        >
            <Plus size={20} />
            <span>Νέο Συστατικό</span>
        </button>
    </div>

     
	 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
	 in:fade={{ duration: 500, delay: 300 }}>
	{#each ingredients as ingredient (ingredient.id)}
		<div 
			class="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300
				   border border-gray-100 hover:border-[#8B6B4A]/20 relative"
			in:fade={{ duration: 300 }}
		>
			<!-- Action Buttons - εμφανίζονται στο hover -->
			<div class="absolute top-13 right-3 flex gap-2">
				<button
					onclick={() => handleEdit(ingredient.id)}
					class="p-1.5 rounded-full bg-white shadow-sm hover:shadow-md
						   text-[#8B6B4A] hover:text-[#6F563C] transition-all duration-200
						   border border-transparent hover:border-[#8B6B4A]/20"
				>
					<Pencil size={16} />
				</button>
				<MyAlertDialog 
                    buttonText="Open Dialog" 
                    preventScroll={true}
                    ingredientId={ingredient.id}
                    ingredientName={ingredient.name}
                >
                    {#snippet title()}
                        Είστε σίγουροι ότι θέλετε να διαγραψέτε αύτο το Συστατικό με όνομα {ingredient.name}
                    {/snippet}
                    {#snippet description()}
                        {#if ingredient.recipe_ingredients[0]?.count > 0}
                            <div class="text-amber-600 font-medium text-sm">
                                <span class="flex items-center gap-2">
                                    ⚠️ Προσοχή! 
                                    <span class="font-normal">
                                         συστατικό χρησιμοποιείται σε 
                                        <span class="font-semibold">{ingredient.recipe_ingredients[0]?.count}</span> 
                                        {ingredient.recipe_ingredients[0]?.count === 1 ? 'συνταγή' : 'συνταγές'}
                                    </span>
                                </span>
                            </div>
                        {:else}
                            <div class="text-neutral-600 text-sm">
                            Μπορείτε να προχωρήσετε με τη διαγραφή
                            </div>
                        {/if}
                    {/snippet}
                </MyAlertDialog>
			</div>

			<div class="flex justify-between items-start mb-2">
				<div>
					<p class="text-xs text-[#8B6B4A] mb-1">#{ingredient.id}</p>
					<h3 class="text-lg font-medium text-neutral-800">{ingredient.name}</h3>
				</div>
				<span class="text-xs font-medium px-2 py-1 bg-[#8B6B4A]/10 text-[#8B6B4A] rounded-full">
					{ingredient.category || 'Χωρίς κατηγορία'}
				</span>
			</div>
			
			{#if ingredient.description}
				<p class="text-sm text-neutral-600 line-clamp-2 mb-3">{ingredient.description}</p>
			{/if}
            <span class="text-xs font-medium">
                Συνταγές: {ingredient.recipe_ingredients[0]?.count || 0}
            </span>
			
			<div class="flex justify-between items-center text-sm text-neutral-500">
				<span>Μονάδα: {ingredient.measurement_unit || '-'}</span>
				<span class="text-xs">
					{new Date(ingredient.updated_at).toLocaleDateString('el-GR')}
				</span>
			</div>
		</div>
	{/each}
</div>
</div>
{/if}




<style>
    /* Προσθήκη ομαλής μετάβασης στο hover των καρτών */
    .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
    }
</style>