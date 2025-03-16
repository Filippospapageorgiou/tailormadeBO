<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import { Trash2 } from "lucide-svelte";
    import { progressStore } from '$lib/stores/progressStore';
    import { invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
  
    let {
        blogId,
        blogTitle
    } = $props<{
        blogId: number;
        blogTitle: string;
    }>();
    
    let open = $state(false);
    let isDeleting = $state(false);
  
    function wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    // Χειρισμός διαγραφής
    async function handleDelete() {
        isDeleting = true;
        
        // Περίμενε λίγο για εφέ
        await wait(200);
        
        // Κλείσε το dialog
        open = false;
        
        // Εκκίνηση του progress bar αφού κλείσει το dialog
        await wait(200);
        progressStore.startProgress(`Διαγραφή άρθρου: ${blogTitle}...`);
        
        try {
            // Δημιουργία και αποστολή του αιτήματος διαγραφής
            const formData = new FormData();
            formData.append('id', blogId.toString());
            
            const response = await fetch('?/deleteBlog', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Σφάλμα κατά τη διαγραφή');
            }
            
            // Περιμένουμε λίγο ακόμα για να δείξουμε την πρόοδο
            await wait(800);
            
            // Ολοκληρώνουμε την πρόοδο
            progressStore.completeProgress(800);
            
            // Περιμένουμε να ολοκληρωθεί το animation του progress bar
            await wait(1000);
            
            // Ανανέωση των δεδομένων
            await invalidateAll();
            
        } catch (error) {
            console.error('Σφάλμα:', error);
            progressStore.completeProgress();
        } finally {
            // Επαναφορά κατάστασης
            setTimeout(() => {
                isDeleting = false;
            }, 500);
        }
    }
    
    function handleOpenChange(isOpen: boolean) {
        if (!isOpen) {
            setTimeout(() => {
                isDeleting = false;
            }, 300);
        }
    }
</script>
  
<AlertDialog.Root bind:open onOpenChange={handleOpenChange}>
    <AlertDialog.Trigger>
        <button
            class="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600
                transition-colors duration-200"
            title="Διαγραφή"
        >
            <Trash2 size={18} />
        </button>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
      />
      <AlertDialog.Content
        class="rounded-lg bg-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 sm:max-w-lg md:w-full"
      >
        <div class="flex flex-col gap-4">
          <AlertDialog.Title class="text-xl font-semibold text-gray-900">
            Διαγραφή άρθρου
          </AlertDialog.Title>
          <AlertDialog.Description class="text-gray-600">
            <p>Είστε σίγουροι ότι θέλετε να διαγράψετε το άρθρο <strong>"{blogTitle}"</strong>;</p>
            <p class="mt-2 text-amber-600">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
          </AlertDialog.Description>
        </div>
  
        <form 
            use:enhance
            onsubmit={async (e) => {
                await handleDelete();
            }}
        >
          <div class="flex items-center justify-end gap-3 pt-4">
            <AlertDialog.Cancel
              disabled={isDeleting}
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2"
            >
              Ακύρωση
            </AlertDialog.Cancel>
            <AlertDialog.Action
              disabled={isDeleting}
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {#if isDeleting}
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Διαγραφή...
                </span>
              {:else}
                Διαγραφή
              {/if}
            </AlertDialog.Action>
          </div>
        </form>
      </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>