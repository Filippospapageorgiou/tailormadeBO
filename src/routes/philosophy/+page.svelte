<script lang="ts">
    import type { PageData } from './$types';
    import Navbar from '$lib/components/ui/Navbar.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Navbar />