<script lang="ts">
    import { fade } from 'svelte/transition';
    import ProgressBar from "./ProgressBar.svelte";
    import { progressStore } from '$lib/stores/progressStore';

</script>

{#if $progressStore.isVisible}
    <div 
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
        in:fade={{ duration: 200 }} 
        out:fade={{ duration: 300 }}
    >
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div class="mb-2 font-medium text-[#8B6B4A]">
                {$progressStore.label}
            </div>
            <ProgressBar 
                value={$progressStore.value} 
                autoHide={$progressStore.isCompleted}
                showValue={true}
                class="w-full"
            />
        </div>
    </div>
{/if}