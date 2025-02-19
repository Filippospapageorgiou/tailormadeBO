<!-- routes/settings/+page.svelte -->
<script lang="ts">
    import Navbar from '$lib/components/ui/Navbar.svelte';
    import IngredientsTab from '$lib/components/settings/IngredientsTab.svelte';
    import type { SettingsPageData } from '$lib/types/database.types';
    
    let { data }: { data: SettingsPageData } = $props();
    let activeTab = $state('ingredients');
    
    const tabs = $state([
        { id: 'ingredients', label: 'ΣΥΣΤΑΤΙΚΑ' },
        { id: 'recipes', label: 'ΣΥΝΤΑΓΕΣ' }
    ]);
</script>

<Navbar />

<div class="container mx-auto px-4 mt-24">
    <!-- Tabs -->
    <div class="border-b border-[#C4A484]/20">
        <nav class="flex space-x-8" aria-label="Tabs">
            {#each tabs as tab}
                <button
                    class="py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                           {activeTab === tab.id
                               ? 'border-[#8B6B4A] text-[#8B6B4A]'
                               : 'border-transparent text-gray-500 hover:text-[#6F563C] hover:border-[#C4A484]/50'}
                           transition-colors duration-200"
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    onclick={() => activeTab = tab.id}
                >
                    {tab.label}
                </button>
            {/each}
        </nav>
    </div>

    <!-- Tab Panels -->
    <div class="mt-8">
        {#if activeTab === 'ingredients'}
            <div class="animate-in fade-in">
                <IngredientsTab {data} />
            </div>
        {:else if activeTab === 'recipes'}
            <div class="animate-in fade-in">
                <!-- Recipes Tab Content -->
                <p>Recipes tab content will go here</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .animate-in {
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>