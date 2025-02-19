<!-- routes/settings/components/IngredientsTab.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SettingsPageData } from '$lib/types/database.types';
    import { Pencil, Trash2, Plus, Search } from 'lucide-svelte';
    import type { Ingredient } from '$lib/types/database.types';

    let { data }: { data: SettingsPageData } = $props();
    
    let searchQuery = $state('');
    let selectedCategory = $state('');
    let selectedUnit = $state('');
    let sortBy = $state('name');
    let sortOrder = $state('asc');
    let showModal = $state(false);
    let editingIngredient = $state<Ingredient | null>(null);

    // Form data for create/edit
    let formData = $state({
        name: '',
        description: '',
        category: '',
        measurement_unit: ''
    });

    function openCreateModal() {
        editingIngredient = null;
        formData = {
            name: '',
            description: '',
            category: '',
            measurement_unit: ''
        };
        showModal = true;
    }

    function openEditModal(ingredient: Ingredient) {
        editingIngredient = ingredient;
        formData = {
            name: ingredient.name,
            description: ingredient.description || '',
            category: ingredient.category || '',
            measurement_unit: ingredient.measurement_unit
        };
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        editingIngredient = null;
    }

    function updateUrl() {
        const url = new URL(window.location.href);
        if (searchQuery) url.searchParams.set('search', searchQuery);
        if (selectedCategory) url.searchParams.set('category', selectedCategory);
        if (selectedUnit) url.searchParams.set('unit', selectedUnit);
        url.searchParams.set('sort', sortBy);
        url.searchParams.set('order', sortOrder);
        history.pushState({}, '', url.toString());
    }

    $effect(() => {
        updateUrl();
    });
</script>

<!-- Filters Section -->
<div class="mb-6 space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Input -->
        <div class="relative flex-1">
            <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Αναζήτηση συστατικού..."
                class="pl-10 w-full rounded-lg border border-gray-300 focus:border-[#C4A484] focus:ring-[#C4A484] 
                       shadow-sm text-sm"
            />
        </div>

        <!-- Category Filter -->
        <select
            bind:value={selectedCategory}
            class="rounded-lg border border-gray-300 focus:border-[#C4A484] focus:ring-[#C4A484] 
                   shadow-sm text-sm"
        >
            <option value="">Όλες οι κατηγορίες</option>
            {#each data.categories as category}
                <option value={category}>{category}</option>
            {/each}
        </select>

        <!-- Unit Filter -->
        <select
            bind:value={selectedUnit}
            class="rounded-lg border border-gray-300 focus:border-[#C4A484] focus:ring-[#C4A484] 
                   shadow-sm text-sm"
        >
            <option value="">Όλες οι μονάδες</option>
            {#each data.units as unit}
                <option value={unit}>{unit}</option>
            {/each}
        </select>

        <!-- Add Button -->
        <button
            onclick={openCreateModal}
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm 
                   font-medium rounded-lg text-white bg-[#8B6B4A] hover:bg-[#6F563C] 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C4A484]
                   transition-colors duration-200"
        >
            <Plus class="h-5 w-5 mr-2" />
            Νέο Συστατικό
        </button>
    </div>
</div>

<!-- Data Table -->
<div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Όνομα
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατηγορία
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Μονάδα Μέτρησης
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Περιγραφή
                </th>
                <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                </th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            {#each data.ingredients as ingredient}
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ingredient.name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ingredient.category || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ingredient.measurement_unit}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {ingredient.description || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end space-x-2">
                            <button
                                onclick={() => openEditModal(ingredient)}
                                class="text-[#8B6B4A] hover:text-[#6F563C] transition-colors duration-200"
                            >
                                <Pencil class="h-5 w-5" />
                            </button>
                            <form 
                                action="?/delete" 
                                method="POST" 
                                use:enhance
                                class="inline"
                            >
                                <input type="hidden" name="id" value={ingredient.id} />
                                <button
                                    type="submit"
                                    class="text-red-600 hover:text-red-900 transition-colors duration-200"
                                >
                                    <Trash2 class="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<!-- Pagination -->
<div class="mt-4 flex items-center justify-between">
    <div class="flex-1 flex justify-between sm:hidden">
        <button
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
                   rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={data.currentPage === 1}
        >
            Previous
        </button>
        <button
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
                   rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={data.currentPage === data.totalPages}
        >
            Next
        </button>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
            <p class="text-sm text-gray-700">
                Showing page <span class="font-medium">{data.currentPage}</span> of{' '}
                <span class="font-medium">{data.totalPages}</span>
            </p>
        </div>
        <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {#each Array(data.totalPages) as _, i}
                    <a
                        href="?page={i + 1}"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
                               {data.currentPage === i + 1
                                   ? 'z-10 bg-[#8B6B4A] border-[#8B6B4A] text-white'
                                   : 'bg-white text-gray-500 hover:bg-gray-50'}
                               first:rounded-l-md last:rounded-r-md"
                    >
                        {i + 1}
                    </a>
                {/each}
            </nav>
        </div>
    </div>
</div>

<!-- Modal for Create/Edit -->
{#if showModal}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
                {editingIngredient ? 'Επεξεργασία' : 'Νέο'} Συστατικό
            </h3>
            <form 
                action={editingIngredient ? '?/update' : '?/create'} 
                method="POST" 
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === 'success') {
                            closeModal();
                        }
                    };
                }}
                class="space-y-4"
            >
                {#if editingIngredient}
                    <input type="hidden" name="id" value={editingIngredient.id} />
                {/if}
                
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Όνομα</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        bind:value={formData.name}
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C4A484] 
                               focus:ring-[#C4A484] sm:text-sm"
                    />
                </div>

                <div>
                    <label for="category" class="block text-sm font-medium text-gray-700">Κατηγορία</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        bind:value={formData.category}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C4A484] 
                               focus:ring-[#C4A484] sm:text-sm"
                    />
                </div>

                <div>
                    <label for="measurement_unit" class="block text-sm font-medium text-gray-700">
                        Μονάδα Μέτρησης
                    </label>
                    <input
                        type="text"
                        id="measurement_unit"
                        name="measurement_unit"
                        bind:value={formData.measurement_unit}
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C4A484] 
                               focus:ring-[#C4A484] sm:text-sm"
                    />
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Περιγραφή</label>
                    <textarea
                        id="description"
                        name="description"
                        bind:value={formData.description}
                        rows="3"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C4A484] 
                               focus:ring-[#C4A484] sm:text-sm"
                    ></textarea>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        type="button"
                        onclick={closeModal}
                        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                               text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-[#C4A484]"
                    >
                        Ακύρωση
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                               text-white bg-[#8B6B4A] hover:bg-[#6F563C] focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-[#C4A484]"
                    >
                        {editingIngredient ? 'Αποθήκευση' : 'Δημιουργία'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}