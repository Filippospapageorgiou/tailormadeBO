<!-- src/lib/components/ui/NewBlogNotification.svelte -->
<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { X, BookOpen, ChevronRight } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { BlogWithAuthor } from '$lib/types/database.types';
    
    // Props που θα δέχεται το component
    let {
        blogs = $bindable([]) as BlogWithAuthor[],
        onClose = $bindable(() => {}) as () => void,
        onReadAll = $bindable(() => {}) as () => void
    } = $props();
    
    let isVisible = $state(false);
    let isMobile = $state(false);
    
    // Έλεγχος αν η συσκευή είναι mobile
    function checkMobile() {
        isMobile = window.innerWidth < 640;
    }
    
    // Εμφάνιση με καθυστέρηση για καλύτερη UX
    onMount(() => {
        // Έλεγχος για mobile
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        if (blogs.length > 0) {
            setTimeout(() => {
                isVisible = true;
            }, 1500); // Εμφάνιση μετά από 1.5 δευτερόλεπτα
        }
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    });
    
    // Διαχείριση κλεισίματος με animation
    function handleClose() {
        isVisible = false;
        setTimeout(() => {
            onClose();
        }, 300); // Αναμονή για να ολοκληρωθεί το animation
    }
    
    // Άνοιγμα της σελίδας blogs
    function navigateToBlog() {
        goto('/blog');
        handleClose();
    }
    
    // Μορφοποίηση ημερομηνίας
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('el-GR', {
            day: '2-digit',
            month: '2-digit'
        }).format(date);
    }
</script>

{#if isVisible && blogs.length > 0}
<div 
    class={`fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200
          transition-all duration-300 ease-in-out ${isMobile 
          ? 'bottom-0 left-0 right-0 max-h-[60vh] rounded-b-none' 
          : 'bottom-4 right-4 max-w-sm w-full'}`}
    in:fly={{ y: 20, duration: 400, delay: 150 }}
    out:fade={{ duration: 300 }}
>
    <div class="p-4">
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
                <BookOpen size={18} class="text-[#8B6B4A]" />
                <h3 class="text-lg font-semibold text-gray-900">Νέα Άρθρα</h3>
                <span class="ml-2 bg-[#8B6B4A] text-white text-xs font-medium rounded-full px-2 py-0.5">
                    {blogs.length}
                </span>
            </div>
            <button 
                onclick={handleClose}
                class="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Κλείσιμο"
            >
                <X size={18} />
            </button>
        </div>
        
        <div class={`overflow-y-auto ${isMobile ? 'max-h-[40vh]' : 'max-h-60'} -mr-4 pr-4`}>
            {#each blogs.slice(0, isMobile ? (blogs.length > 5 ? 5 : blogs.length) : 3) as blog, i (blog.id)}
                <button 
                    class="mb-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                    onclick={navigateToBlog}
                    in:fade={{ duration: 300, delay: 150 + (i * 100) }}
                >
                    <div class="flex items-start gap-3">
                        {#if blog.images && blog.images.length > 0}
                            <div class="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                <img src={blog.images[0]} alt={blog.title} class="h-full w-full object-cover" />
                            </div>
                        {:else}
                            <div class="h-12 w-12 flex-shrink-0 rounded bg-[#8B6B4A]/10 flex items-center justify-center">
                                <BookOpen size={16} class="text-[#8B6B4A]" />
                            </div>
                        {/if}
                        
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-medium text-gray-900 truncate">{blog.title}</h4>
                            <p class="text-xs text-gray-500 mt-0.5">
                                {formatDate(blog.created_at)}
                            </p>
                        </div>
                        
                        {#if isMobile}
                            <ChevronRight size={16} class="text-gray-400 mt-1" />
                        {/if}
                    </div>
                </button>
            {/each}
            
            {#if (isMobile && blogs.length > 5) || (!isMobile && blogs.length > 3)}
                <p class="text-xs text-center text-gray-500 mt-2 mb-1">
                    + {isMobile ? blogs.length - 5 : blogs.length - 3} ακόμα 
                    {isMobile ? (blogs.length - 5 === 1 ? 'άρθρο' : 'άρθρα') : (blogs.length - 3 === 1 ? 'άρθρο' : 'άρθρα')}
                </p>
            {/if}
        </div>
        
        <div class={`mt-3 flex ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
            {#if isMobile}
                <button 
                    onclick={navigateToBlog}
                    class="w-full py-2.5 bg-[#8B6B4A] text-white text-sm font-medium rounded-md hover:bg-[#6F563C] transition-colors flex items-center justify-center"
                >
                    Προβολή όλων
                </button>
            {:else}
                <button 
                    onclick={navigateToBlog}
                    class="text-xs bg-[#8B6B4A] text-white px-3 py-1 rounded-md hover:bg-[#6F563C] transition-colors"
                >
                    Προβολή όλων
                </button>
            {/if}
        </div>
    </div>
</div>
{/if}