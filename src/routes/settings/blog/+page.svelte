<script lang="ts">
    import type { Blog } from "$lib/types/database.types";
    import type { PageData } from "./$types";
    import { fade } from 'svelte/transition';
    import { onMount } from "svelte";
    import { Search, PlusCircle, Edit, Tag, Eye, EyeOff } from 'lucide-svelte';
    import GlobalProgressBar from "$lib/components/ui/GlobalProgressBar.svelte";
	import BlogPostEditor from "$lib/components/ui/settings_blog/BlogPostEditor.svelte";
    import DeleteBlogDialog from "$lib/components/ui/settings_blog/DeleteBlogDialog.svelte";
    
    
    let { data }: { data: PageData } = $props();
    let blogs = $state<Blog[]>([]);
    let total: number = $state(data.totalBlogs ?? 0);
    $effect(() => {
        blogs = data.blogs ?? [];
        total = data.totalBlogs ?? 0;
    });
    
    let searchQuery = $state('');
    let mounted = $state(false);
    let isEditorOpen = $state(false);
    let currentBlog = $state<Blog | null>(null);
    let isCreating = $state(false);
    
    
    let filteredBlogs = $derived(
        searchQuery 
            ? blogs.filter(blog => 
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (blog.description && blog.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
              )
            : blogs
    );
    
    onMount(() => {
        setTimeout(() => {
            mounted = true;
        }, 0);
    });
    
    function openEditor(blog: Blog | null = null) {
        currentBlog = blog;
        isCreating = !blog;
        isEditorOpen = true;
    }
    
    function closeEditor() {
        isEditorOpen = false;
        setTimeout(() => {
            currentBlog = null;
        }, 300);
    }
    
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('el-GR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function truncateHTML(html: string, maxLength: number = 150) {
        const textOnly = html.replace(/<\/?[^>]+(>|$)/g, " ");
        if (textOnly.length <= maxLength) return textOnly;
        return textOnly.substr(0, maxLength) + '...';
    }
</script>

<GlobalProgressBar />
{#if isEditorOpen}
    <BlogPostEditor 
        bind:isOpen={isEditorOpen} 
        blog={currentBlog} 
        isCreating={isCreating} 
        onClose={closeEditor} 
    />
{:else if mounted}
    <div class="space-y-6 p-4" transition:fade={{ duration: 400, delay: 100 }}>
    
        <div class="flex flex-col pb-2 border-b" in:fade={{ duration: 400, delay: 150 }}>
            <h1 class="text-2xl font-medium text-[#8B6B4A]">Διαχείριση Blog</h1>
            <p class="text-sm pt-2 text-gray-500">Συνολικά άρθρα: {total}</p>
        </div>

    
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between"
             in:fade={{ duration: 500, delay: 200 }}>
            <div class="relative w-full sm:w-96">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Αναζήτηση άρθρου..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-[#8B6B4A] focus:border-transparent
                           placeholder:text-gray-400"
                />
            </div>
            
            <button 
                onclick={() => openEditor()}
                class="flex items-center gap-2 px-4 py-2 bg-[#8B6B4A] text-white rounded-lg hover:bg-[#6F563C] 
                       transition-colors duration-300 w-full sm:w-auto"
            >
                <PlusCircle size={20} />
                <span>Νέο Άρθρο</span>
            </button>
        </div>

        
        <div class="grid grid-cols-1 gap-6" in:fade={{ duration: 500, delay: 300 }}>
            {#each filteredBlogs as blog (blog.id)}
                <div 
                    class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md 
                           transition-all duration-300 overflow-hidden"
                    in:fade={{ duration: 300 }}
                >
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h2 class="text-xl font-medium text-[#8B6B4A] mb-2 flex items-center">
                                    {blog.title}
                                    {#if blog.published}
                                        <span class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                                            <Eye size={12} class="mr-1" /> Δημοσιευμένο
                                        </span>
                                    {:else}
                                        <span class="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                                            <EyeOff size={12} class="mr-1" /> Πρόχειρο
                                        </span>
                                    {/if}
                                </h2>
                                <p class="text-sm text-gray-500 mb-2">
                                    Συντάκτης: {blog.author_id || "Άγνωστος"} • 
                                    {formatDate(blog.created_at)}
                                </p>
                                {#if blog.description}
                                    <p class="text-gray-700 mb-4">{blog.description}</p>
                                {:else}
                                    <p class="text-gray-600 mb-4">{truncateHTML(blog.content)}</p>
                                {/if}
                            </div>
                            
                            <div class="flex gap-2">
                                <button 
                                    onclick={() => openEditor(blog)}
                                    class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 
                                           transition-colors duration-200"
                                    title="Επεξεργασία"
                                >
                                    <Edit size={18} />
                                </button>
                                
                                <DeleteBlogDialog 
                                    blogId={blog.id} 
                                    blogTitle={blog.title}
                                />
                            </div>
                        </div>
                        
                        {#if blog.tags && blog.tags.length > 0}
                            <div class="flex flex-wrap gap-2 mt-4">
                                {#each blog.tags as tag}
                                    <span class="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                                        <Tag size={12} class="mr-1" />
                                        {tag}
                                    </span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}

            {#if filteredBlogs.length === 0}
                <div class="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200" in:fade={{ duration: 300 }}>
                    {searchQuery 
                        ? 'Δεν βρέθηκαν άρθρα που να ταιριάζουν με την αναζήτηση.' 
                        : 'Δεν υπάρχουν διαθέσιμα άρθρα στο blog. Δημιουργήστε το πρώτο σας άρθρο!'}
                </div>
            {/if}
        </div>
    </div>
{/if}