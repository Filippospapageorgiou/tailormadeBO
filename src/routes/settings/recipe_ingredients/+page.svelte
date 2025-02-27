<script lang="ts">
    import type { PageData } from "./$types";
    import type { Beverage, Ingredient, RecipeIngredient } from "$lib/types/database.types";
    import { fade } from 'svelte/transition';
    import { Search, Plus } from 'lucide-svelte';
    import { onMount } from "svelte";
    import { invalidateAll } from "$app/navigation";
    import GlobalProgressBar from "$lib/components/ui/GlobalProgressBar.svelte";
    import BeverageCard from "$lib/components/ui/settings_recipes/BeverageCard.svelte";
    import NewBeverageDialog from "$lib/components/ui/settings_recipes/NewBeverageDialog.svelte";
    
    let { data }: { data: PageData } = $props();
    const beverages: Beverage[] = data.beverages ?? [];
    const ingredients: Ingredient[] = data.ingredients ?? [];
    const total: number = data.totalBeverages ?? 0;
    
    let searchQuery = $state('');
    let mounted = $state(false);
    let isDialogOpen = $state(false);
    
    // Φιλτραρισμένα ροφήματα με βάση την αναζήτηση
    let filteredBeverages = $derived(
        searchQuery 
            ? beverages.filter(beverage => 
                beverage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (beverage.description && beverage.description.toLowerCase().includes(searchQuery.toLowerCase()))
              )
            : beverages
    );
    
    onMount(() => {
        setTimeout(() => {
            mounted = true;
        }, 0);
    });
</script>

<!-- Progress Bar -->
<GlobalProgressBar />

{#if mounted}
<div class="space-y-4 pl-3 pb-3.5" transition:fade={{ duration: 400, delay: 100 }}>
    <!-- Header Section -->
    <div class="flex flex-col mx-auto pt-2" in:fade={{ duration: 400, delay: 150 }}>
        <p class="text-sm text-[#8B6B4A]">Διαθέσιμα Ροφήματα: {total}</p>
    </div>

    <!-- Search and Actions Bar -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between"
         in:fade={{ duration: 500, delay: 200 }}>
        <div class="relative w-full sm:w-96">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Αναζήτηση ροφήματος..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#8B6B4A] focus:border-transparent
                       placeholder:text-gray-400"
            />
        </div>
        
        <NewBeverageDialog bind:open={isDialogOpen} buttonText="Νέο Ρόφημα" />
    </div>

    <!-- Λίστα Ροφημάτων -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
         in:fade={{ duration: 500, delay: 300 }}>
        {#each filteredBeverages as beverage (beverage.id)}
            <BeverageCard {beverage} {ingredients} />
        {/each}

        {#if filteredBeverages.length === 0}
            <div class="col-span-full p-8 text-center text-gray-500" in:fade={{ duration: 300 }}>
                {searchQuery 
                    ? 'Δεν βρέθηκαν ροφήματα που να ταιριάζουν με την αναζήτηση.' 
                    : 'Δεν υπάρχουν διαθέσιμα ροφήματα. Προσθέστε το πρώτο σας ρόφημα!'}
            </div>
        {/if}
    </div>
</div>
{/if}
