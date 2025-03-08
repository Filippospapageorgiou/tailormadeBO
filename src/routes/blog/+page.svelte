<!-- routes/philosophy/+page.svelte -->
<script lang="ts">
    import type { PageData } from '../blog/$types';
    import Navbar from '$lib/components/Navbar.svelte';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    let { data }: { data: PageData } = $props();
    
    let mounted = $state(false);

    onMount(() => {
        // Μικρή καθυστέρηση για να διασφαλίσουμε ότι το DOM είναι έτοιμο
        setTimeout(() => {
            mounted = true;
        }, 0);
    });
</script>

<Navbar />
<div class="h-screen bg-white flex items-center justify-center">
    {#if mounted}
    <main class="container mx-auto px-4 md:px-6"
          transition:fade={{ duration: 800, delay: 200 }}>
        <h1 class="font-light text-gray-500 text-center text-3xl">UNDER CONSTRUCTION</h1>
    </main>
    {/if}
</div>