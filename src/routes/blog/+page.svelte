<script lang="ts">
    import type { PageData } from './$types';
    import type { BlogWithAuthor } from '$lib/types/database.types';
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import Navbar from '$lib/components/Navbar.svelte';
    import { Tag, Calendar } from 'lucide-svelte';
    
    let { data } = $props();
    let blogs = $derived(data.blogs as BlogWithAuthor[]);
    
    let mounted = $state(false);

    onMount(() => {
        setTimeout(() => {
            mounted = true;
        }, 100);
    });
    
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('el-GR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }
</script>

<Navbar />

{#if mounted}
<main class="min-h-screen bg-white pt-24 pb-16" transition:fade={{ duration: 500, delay: 200 }}>
    <div class="container mx-auto px-4">
        <header class="mb-12 text-center">
            <h1 class="text-4xl md:text-5xl font-display font-medium text-[#8B6B4A] mb-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
                Tailomade Blog
            </h1>
        </header>
        {#if blogs.length > 0}
            <div class="max-w-4xl mx-auto space-y-8">
                {#each blogs as blog, index (blog.id)}
                    <div 
                        class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                        in:fade={{ duration: 500, delay: 600 + (index * 100) }}
                    >
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center">
                                    <img 
                                        src={blog.author?.image_url || '/placeholder-user.jpg'} 
                                        alt={blog.author?.username || "Συντάκτης"}
                                        class="w-8 h-8 rounded-full object-cover mr-3"
                                    />
                                    <span class="text-sm text-gray-600">{blog.author?.username || "Συντάκτης"}</span>
                                </div>
                                
                                <div class="flex items-center text-sm text-gray-500">
                                    <Calendar size={14} class="mr-1.5" />
                                    {formatDate(blog.created_at)}
                                </div>
                            </div>
                            
                            <div class="flex flex-col md:flex-row gap-6">
                                {#if blog.images && blog.images.length > 0}
                                    <div class="md:w-1/3 h-48 md:h-auto bg-gray-100 overflow-hidden rounded-lg">
                                        <img 
                                            src={blog.images[0]} 
                                            alt={blog.title}
                                            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        />
                                    </div>
                                {/if}
                                
                                <!-- Περιεχόμενο -->
                                <div class={blog.images && blog.images.length > 0 ? "md:w-2/3" : "w-full"}>
                                    <h2 class="text-xl md:text-2xl font-display font-medium text-gray-900 mb-2">
                                        {blog.title}
                                    </h2>
                                    
                                    <p class="text-gray-600 mb-4">
                                        {blog.description}
                                    </p>
                                    <p class="text-gray-600 mb-4">
                                        {blog.content}
                                    </p>
                                    
                                    <!-- Tags -->
                                    {#if blog.tags && blog.tags.length > 0}
                                        <div class="flex flex-wrap gap-2 mt-4">
                                            {#each blog.tags as tag}
                                                <span class="inline-flex items-center text-xs font-medium text-[#8B6B4A]">
                                                    <Tag size={12} class="mr-1" />
                                                    {tag}
                                                </span>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-center py-16" in:fade={{ duration: 800, delay: 600 }}>
                <p class="text-gray-500 text-lg">
                    Δεν υπάρχουν διαθέσιμα άρθρα στο blog αυτή τη στιγμή.
                </p>
            </div>
        {/if}
    </div>
</main>
{/if}