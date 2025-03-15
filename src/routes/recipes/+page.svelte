<script lang="ts">
    import type { PageData } from './$types';
    import Navbar from '$lib/components/Navbar.svelte';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    let { data }: { data: PageData } = $props();
    const { beverages } = $derived(data);
    
    let mounted = $state(false);

    onMount(() => {
        setTimeout(() => {
            mounted = true;
        }, 0);
    });

    const handleBeverageClick = (id: number) => {
        goto(`/recipes/${id}`);
    };
</script>

<Navbar />
{#if mounted}
<div class="min-h-screen bg-white" transition:fade={{ duration: 400, delay: 100 }}>
    <main class="container mx-auto px-4 md:px-6 pt-32 pb-20">
        <div class="mb-12 flex flex-col items-start gap-2">
            <h1 class="text-4xl font-mono tracking-wider text-neutral-800">BEVERAGES</h1>
            <p class="text-sm text-[#8B6B4A]">Available Products: {beverages.length}</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {#each beverages as beverage (beverage.id)}
                <div 
                    role="button"
                    tabindex="0"
                    onclick={() => handleBeverageClick(beverage.id)}
                    onkeydown={(e) => e.key === 'Enter' && handleBeverageClick(beverage.id)}
                    class="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out overflow-hidden cursor-pointer"
                >
                    <div class="aspect-square w-full overflow-hidden">
                        <img
                            src={beverage.image_url}
                            alt={beverage.name}
                            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div class="p-3">
                        <p class="text-xs text-[#8B6B4A] mb-1">#{beverage.id}</p>
                        <h2 class="text-base font-medium text-neutral-800 tracking-wide mb-1">{beverage.name}</h2>
                        {#if beverage.description}
                            <p class="text-xs text-neutral-600 line-clamp-2">{beverage.description}</p>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </main>
</div>
{/if}