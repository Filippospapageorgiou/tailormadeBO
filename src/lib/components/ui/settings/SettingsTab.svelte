<!-- lib/components/SettingsNavigation.svelte -->
<script lang="ts">
    import { page } from '$app/state';
    
    const navigationItems = [
        { path: '/settings/ingredients', label: 'ΣΥΣΤΑΤΙΚΑ' },
        { path: '/settings/recipe_ingredients', label: 'ΣΥΝΤΑΓΕΣ' }
    ];

    let currentPath = $state('');

    $effect(() => {
        currentPath = page.url.pathname;
    });
</script>

<div class="container mx-auto px-4">
    <div class="border-b border-[#C4A484]/20">
        <nav class="flex space-x-8" aria-label="Settings navigation">
            {#each navigationItems as item}
                <a
                    href={item.path}
                    class="py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                           {currentPath === item.path
                               ? 'border-[#8B6B4A] text-[#8B6B4A]'
                               : 'border-transparent text-gray-500 hover:text-[#6F563C] hover:border-[#C4A484]/50'}
                           transition-colors duration-200"
                    aria-current={currentPath === item.path ? 'page' : undefined}
                >
                    {item.label}
                </a>
            {/each}
        </nav>
    </div>
</div>

<style>
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