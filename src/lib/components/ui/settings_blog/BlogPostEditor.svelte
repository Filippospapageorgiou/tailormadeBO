<!-- Ενημέρωση του BlogPostEditor.svelte -->
<script lang="ts">
    import type { Blog } from "$lib/types/database.types";
    import { fade, fly } from 'svelte/transition';
    import { X, Image, Check, Save, EyeOff, Eye, AtSign, Upload } from 'lucide-svelte';
    import { invalidateAll } from "$app/navigation";
    import { progressStore } from '$lib/stores/progressStore';
    import Label from "$lib/components/ui/Label.svelte";
    import { enhance } from "$app/forms";
    
    let {
        isOpen = $bindable(false),
        blog = null,
        isCreating = true,
        onClose = () => {}
    } = $props<{
        isOpen: boolean;
        blog: Blog | null;
        isCreating: boolean;
        onClose: () => void;
    }>();
    
    // Form fields
    let title = $state(blog?.title || '');
    let description = $state(blog?.description || '');
    let content = $state(blog?.content || '');
    let tagsString = $state(blog?.tags ? blog.tags.join(', ') : '');
    let published = $state(blog?.published || false);
    let isSubmitting = $state(false);
    
    // Προσθήκη μεταβλητών για το ανέβασμα εικόνων
    let uploadedImages = $state<File[]>([]);
    let uploadedImagePreviews = $state<string[]>([]);
    let existingImages = $state<string[]>(blog?.images || []);
    let imageUploading = $state(false);
    let dragActive = $state(false);
    
    // Συνάρτηση για προσθήκη εικόνων
    function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        
        processFiles(Array.from(input.files));
        input.value = ''; // Καθαρισμός του input για μελλοντικά uploads
    }
    
    // Συνάρτηση για drag & drop
    function handleDragEnter(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = true;
    }
    
    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = false;
    }
    
    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = true;
    }
    
    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = false;
        
        if (e.dataTransfer?.files?.length) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    }
    
    // Επεξεργασία των επιλεγμένων αρχείων
    function processFiles(files: File[]) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        // Έλεγχος μεγέθους (έως 5MB ανά αρχείο)
        const validSizeFiles = imageFiles.filter(file => file.size <= 5 * 1024 * 1024);
        
        if (validSizeFiles.length !== imageFiles.length) {
            alert('Κάποιες εικόνες υπερβαίνουν το μέγιστο μέγεθος των 5MB και παραλείφθηκαν.');
        }
        
        // Δημιουργία previews για τα αρχεία
        validSizeFiles.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                    uploadedImagePreviews = [...uploadedImagePreviews, result];
                    uploadedImages = [...uploadedImages, file];
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Αφαίρεση εικόνας από τη λίστα επιλεγμένων
    function removeUploadedImage(index: number) {
        uploadedImages = uploadedImages.filter((_, i) => i !== index);
        uploadedImagePreviews = uploadedImagePreviews.filter((_, i) => i !== index);
    }
    
    // Αφαίρεση υπάρχουσας εικόνας
    function removeExistingImage(index: number) {
        existingImages = existingImages.filter((_, i) => i !== index);
    }
    
    async function handleSubmit() {
        isSubmitting = true;
        
        progressStore.startProgress(isCreating ? 'Δημιουργία άρθρου...' : 'Ενημέρωση άρθρου...');
        
        try {
            const formData = new FormData();
            
            if (!isCreating && blog) {
                formData.append('id', blog.id.toString());
            }
            
            formData.append('title', title);
            formData.append('description', description || '');
            formData.append('content', content);
            formData.append('tags', tagsString);
            formData.append('published', published.toString());
            
            // Προσθήκη των υπαρχόντων εικόνων που δεν αφαιρέθηκαν
            formData.append('existingImages', JSON.stringify(existingImages));
            
            // Προσθήκη των νέων εικόνων
            uploadedImages.forEach((image, index) => {
                if (image && image.name) { // Βεβαιωνόμαστε ότι το αρχείο είναι έγκυρο
                    formData.append(`image_${index}`, image);
                }
            });
            
            const endpoint = isCreating ? '?/createBlog' : '?/updateBlog';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Σφάλμα κατά την αποθήκευση');
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
        
            progressStore.completeProgress(800);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await invalidateAll();
            isOpen = false;
            if (onClose) onClose();
            
        } catch (error) {
            console.error('Σφάλμα:', error);
            progressStore.completeProgress();
        } finally {
            isSubmitting = false;
        }
    }
    
    function togglePublished() {
        published = !published;
    }
    
    $effect(() => {
        if (isOpen && blog) {
            setTimeout(() => {
                title = blog.title || '';
                description = blog.description || '';
                content = blog.content || '';
                tagsString = blog.tags ? blog.tags.join(', ') : '';
                published = blog.published || false;
                existingImages = blog.images || [];
                // Καθαρισμός των uploaded images κάθε φορά που ανοίγει το modal με υπάρχον blog
                uploadedImages = [];
                uploadedImagePreviews = [];
            }, 100);
        }
    });
</script>

{#if isOpen}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" transition:fade={{ duration: 200 }}>
    <div 
        class="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
        transition:fly={{ duration: 300, y: 20 }}
    >
        
        <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-xl font-semibold text-gray-900">
                {isCreating ? 'Δημιουργία νέου άρθρου' : 'Επεξεργασία άρθρου'}
            </h2>
            <button 
                onclick={() => {
                    isOpen = false;
                    if (onClose) onClose();
                }}
                class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                disabled={isSubmitting}
            >
                <X size={20} />
            </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
            <form 
                use:enhance
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                class="space-y-6"
            >
                <div class="space-y-4">
                    <div>
                        <Label for="title" required>Τίτλος</Label>
                        <input 
                            type="text" 
                            id="title" 
                            bind:value={title}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                            placeholder="Εισάγετε τον τίτλο του άρθρου"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div>
                        <Label for="description">Περιγραφή</Label>
                        <textarea
                            id="description"
                            bind:value={description}
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                            placeholder="Προαιρετική συνοπτική περιγραφή του άρθρου"
                        ></textarea>
                    </div>
                    
                    <div>
                        <Label for="content" required>Περιεχόμενο</Label>
                        <div class="border border-gray-300 rounded-md shadow-sm overflow-hidden">
                            <div class="flex items-center gap-1 p-2 bg-gray-50 border-b">
                                <button 
                                    type="button"
                                    class="p-1.5 rounded hover:bg-gray-200 text-gray-700"
                                    title="Προσθήκη εικόνας"
                                >
                                    <Image size={16} />
                                </button>
                                <button 
                                    type="button"
                                    class="p-1.5 rounded hover:bg-gray-200 text-gray-700"
                                    title="Προσθήκη mention"
                                >
                                    <AtSign size={16} />
                                </button>
                            </div>
                            
                            <textarea
                                id="content"
                                bind:value={content}
                                required
                                rows="15"
                                class="w-full px-3 py-2 focus:outline-none focus:ring-[#8B6B4A] border-none"
                                placeholder="Γράψτε εδώ το περιεχόμενο του άρθρου..."
                                disabled={isSubmitting}
                            ></textarea>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">
                            Μπορείτε να χρησιμοποιήσετε Markdown για τη μορφοποίηση του κειμένου.
                        </p>
                    </div>
                    
                    <div>
                        <Label for="tags">Tags</Label>
                        <input 
                            type="text" 
                            id="tags" 
                            bind:value={tagsString}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B6B4A] focus:border-[#8B6B4A]"
                            placeholder="Διαχωρίστε τα tags με κόμμα (πχ. καφές, συνταγές, τεχνικές)"
                        />
                    </div>
                    
                    <!-- Εμφάνιση υπαρχόντων εικόνων (αν υπάρχουν) -->
                    {#if existingImages.length > 0}
                        <div>
                            <Label>Υπάρχουσες Εικόνες</Label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                                {#each existingImages as image, i}
                                    <div class="relative group">
                                        <img 
                                            src={image} 
                                            alt="Blog" 
                                            class="w-full h-32 object-cover rounded-lg shadow-sm"
                                        />
                                        <button 
                                            type="button"
                                            onclick={() => removeExistingImage(i)}
                                            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Αφαίρεση εικόνας"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Εμφάνιση νέων εικόνων που έχουν επιλεγεί -->
                    {#if uploadedImagePreviews.length > 0}
                        <div>
                            <Label>Νέες Εικόνες</Label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                                {#each uploadedImagePreviews as preview, i}
                                    <div class="relative group">
                                        <img 
                                            src={preview} 
                                            alt="Upload preview" 
                                            class="w-full h-32 object-cover rounded-lg shadow-sm"
                                        />
                                        <button 
                                            type="button"
                                            onclick={() => removeUploadedImage(i)}
                                            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Αφαίρεση εικόνας"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Περιοχή για ανέβασμα εικόνων -->
                    <div
                        class="flex w-full items-center justify-center"
                        role="button"
                        tabindex="0"
                        aria-label="Περιοχή για ανέβασμα εικόνων"
                        ondragenter={handleDragEnter}
                        ondragleave={handleDragLeave}
                        ondragover={handleDragOver}
                        ondrop={handleDrop}
                    >
                        <label
                            for="dropzone-file"
                            class={`flex h-48 w-full flex-col items-center justify-center border-2
                                    cursor-pointer rounded-lg border-dashed
                                    transition-colors duration-200 hover:bg-gray-100
                                    ${dragActive ? 'border-[#8B6B4A] bg-[#8B6B4A]/5' : 'border-gray-300'}`}
                        >
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload class="mb-4 h-8 w-8 text-gray-500" />
                                <p class="mb-2 text-sm text-gray-500">
                                    <span class="font-semibold">Πατήστε για ανέβασμα</span> ή σύρετε και αφήστε
                                </p>
                                <p class="text-xs text-gray-500">
                                    Αποδεκτοί τύποι: JPG, PNG, GIF, SVG (έως 5MB/αρχείο)
                                </p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                accept="image/*"
                                multiple
                                class="hidden"
                                onchange={handleImageUpload}
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>
                </div>
            </form>
        </div>
        
        <!-- Footer -->
        <div class="flex items-center justify-between p-4 border-t bg-gray-50">
            <div>
                <button 
                    type="button"
                    onclick={togglePublished}
                    class={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full ${
                        published 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                >
                    {#if published}
                        <Eye size={16} class="mr-1.5" />
                        Δημοσιευμένο
                    {:else}
                        <EyeOff size={16} class="mr-1.5" />
                        Πρόχειρο
                    {/if}
                </button>
            </div>
            <div class="flex gap-3">
                <button 
                    type="button"
                    onclick={() => {
                        isOpen = false;
                        if (onClose) onClose();
                    }}
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2"
                    disabled={isSubmitting}
                >
                    Ακύρωση
                </button>
                <button 
                    type="button"
                    onclick={handleSubmit}
                    class="px-4 py-2 text-sm font-medium text-white bg-[#8B6B4A] border border-transparent rounded-md shadow-sm hover:bg-[#6F563C] focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2 inline-flex items-center"
                    disabled={isSubmitting}
                >
                    {#if isSubmitting}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Αποθήκευση...
                    {:else}
                        <Save size={16} class="mr-1.5" />
                        Αποθήκευση
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>
{/if}