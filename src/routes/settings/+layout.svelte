<!-- routes/settings/+layout.svelte -->
<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import Navbar from '$lib/components/Navbar.svelte';
	import SettingsTab from '$lib/components/ui/settings/SettingsTab.svelte';
    
    let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

<Navbar />
<div class="container mx-auto px-4 mt-24">
    <SettingsTab />
    {@render children()}
</div>