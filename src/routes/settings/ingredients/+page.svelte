<script lang="ts">
    import type { Ingredient } from "$lib/types/database.types";
    import type { PageData } from "./$types";
    import { fade } from 'svelte/transition';
    import { Search } from 'lucide-svelte';
    import { onMount } from "svelte";
    import MyAlertDialog from "$lib/components/ui/settings_ingredients/MyAlertDialog.svelte.svelte";
    import EditIngredientDialog from "$lib/components/ui/settings_ingredients/EditIngredientDialog.svelte";
    import IngredientDialogSave from "$lib/components/ui/settings_ingredients/IngredientDialogSave.svelte";
    import GlobalProgressBar from "$lib/components/ui/GlobalProgressBar.svelte";
    
    
    
    let { data }: { data: PageData } = $props();
    const ingredients: Ingredient[] = data.ingredients ?? [];
    const total: number = data.total ?? 0;
    
    let searchQuery = $state('');
    let mounted = $state(false);
    let isDialogOpen = $state(false);
    
    onMount(() => {
        setTimeout(() => {
            mounted = true;
        }, 0);
    });
</script>

<!-- Προσθήκη του GlobalProgressBar -->
<GlobalProgressBar />

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
        
        <IngredientDialogSave bind:open={isDialogOpen} buttonText="Νέο Συστατικό">
            {#snippet title()}
                Προσθήκη Νέου Συστατικού
            {/snippet}
            
            {#snippet description()}
                Συμπληρώστε τα παρακάτω στοιχεία για να προσθέσετε ένα νέο συστατικό στη βάση δεδομένων.
            {/snippet}
        </IngredientDialogSave>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" in:fade={{ duration: 500, delay: 300 }}>
        {#each ingredients as ingredient (ingredient.id)}
            <div
                class="group bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300
                    border border-gray-100 hover:border-[#8B6B4A]/20 relative"
                in:fade={{ duration: 300 }}
            >
                
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center">
                        <span class="text-xs text-[#8B6B4A] mr-1">#{ingredient.id}</span>
                        <h3 class="text-base font-medium text-neutral-800 pl-1">{ingredient.name}</h3>
                    </div>
                    
                    <!-- Action Buttons δίπλα στο όνομα -->
                    <div class="flex gap-1">
                        <EditIngredientDialog ingredient={ingredient}>
                            {#snippet title()}
                                Επεξεργασία Συστατικού
                            {/snippet}
                            {#snippet description()}
                                Τροποποιήστε τις πληροφορίες του συστατικού "{ingredient.name}"
                            {/snippet}
                        </EditIngredientDialog>
                        <MyAlertDialog
                            buttonText="Open Dialog"
                            preventScroll={true}
                            ingredientId={ingredient.id}
                            ingredientName={ingredient.name}
                        >
                            {#snippet title()}
                                Είστε σίγουροι ότι θέλετε να διαγράψετε αύτο το Συστατικό με όνομα {ingredient.name}
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
                </div>
                
                <!-- Πληροφορίες κάτω από το όνομα -->
                <div class="grid grid-cols-1 gap-1">
                    <!-- Κατηγορία και μονάδα μέτρησης -->
                    <div class="flex justify-between items-center">
                        <span class="text-xs px-1.5 py-0.5 bg-[#8B6B4A]/10 text-[#8B6B4A] rounded-full">
                            {ingredient.category || 'Χωρίς κατηγορία'}
                        </span>
                        <span class="text-xs text-neutral-700">
                            {ingredient.measurement_unit || '-'}
                        </span>
                    </div>
                    
                    <!-- Περιγραφή (αν υπάρχει) -->
                    {#if ingredient.description}
                        <p class="text-xs text-neutral-600 line-clamp-2">{ingredient.description}</p>
                    {/if}
                    
                    <!-- Ημερομηνία στο κάτω μέρος -->
                    <div class="text-right">
                        <span class="text-xs text-neutral-400">
                            {new Date(ingredient.updated_at).toLocaleDateString('el-GR')}
                        </span>
                    </div>
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