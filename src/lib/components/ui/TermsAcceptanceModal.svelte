<!-- src/lib/components/ui/TermsAcceptanceModal.svelte -->
<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    let {
        termsText = $bindable(''),
        onAccept = $bindable(() => {}) as () => void,
    } = $props();
    
    let isChecked = $state(false);
    let isProcessing = $state(false);
    
    onMount(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    });
    
    async function handleAccept() {
        if (!isChecked) return;
        
        isProcessing = true;
        await onAccept();
        isProcessing = false;
    }
</script>

<div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    transition:fade={{ duration: 300 }}
>
    <div 
        class="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        transition:fly={{ y: 20, duration: 400 }}
    >
        <div class="p-6 md:p-8">
            <h2 class="text-xl md:text-2xl font-semibold text-[#8B6B4A] mb-4">
                Όροι Χρήσης
            </h2>
            
            <div class="my-6 h-64 md:h-80 overflow-y-auto p-4 border border-gray-200 rounded-md bg-gray-50">
                <p class="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {termsText}
                </p>
            </div>
            
            <div class="mt-6">
                <label class="flex items-start gap-3 cursor-pointer group">
                    <div class="flex h-6 items-center">
                        <input
                            type="checkbox"
                            bind:checked={isChecked}
                            class="h-5 w-5 rounded border-2 border-gray-300 text-[#8B6B4A] focus:ring-[#8B6B4A]
                                   checked:border-[#8B6B4A] transition-colors group-hover:border-[#8B6B4A]"
                        />
                    </div>
                    <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Έχω διαβάσει και αποδέχομαι τους όρους και τις προϋποθέσεις χρήσης
                    </span>
                </label>
            </div>
            
            <div class="mt-8 flex justify-end">
                <button
                    onclick={handleAccept}
                    disabled={!isChecked || isProcessing}
                    class="px-6 py-2.5 bg-[#8B6B4A] text-white rounded-lg font-medium 
                           shadow-sm hover:bg-[#6F563C] disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 ease-in-out flex items-center"
                >
                    {#if isProcessing}
                        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Αποδοχή...
                    {:else}
                        Αποδοχή
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>