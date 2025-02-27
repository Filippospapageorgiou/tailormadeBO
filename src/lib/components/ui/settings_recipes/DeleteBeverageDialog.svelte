<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import { Trash2 } from "lucide-svelte";
    import { progressStore } from '$lib/stores/progressStore';
  
    let {
        beverageId,
        beverageName
    } = $props<{
        beverageId: number;
        beverageName: string;
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
        await wait(200); // Περίμενε να κλείσει το dialog
        progressStore.startProgress(`Διαγραφή ροφήματος: ${beverageName}...`);
        
        try {
            // Δημιουργία και αποστολή του αιτήματος διαγραφής
            const formData = new FormData();
            formData.append('id', beverageId.toString());
            
            const response = await fetch('?/deleteBeverage', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Σφάλμα κατά τη διαγραφή');
            }
            
            // Περιμένουμε λίγο ακόμα για να δείξουμε την πρόοδο
            await wait(800);
            
            // Ολοκληρώνουμε την πρόοδο ΠΡΙΝ την ανακατεύθυνση
            progressStore.completeProgress(1000);
            
            // Περιμένουμε να ολοκληρωθεί το animation του progress bar
            await wait(1000);
            
            // Ανανέωση των δεδομένων με πλήρη ανακατεύθυνση
            window.location.href = window.location.pathname;
            
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
        class="p-1.5 rounded-full bg-white shadow-sm hover:shadow-md
          text-red-500 hover:text-red-600 transition-all duration-200
           border border-transparent hover:border-red-200"
        >
        <Trash2 size={16} />
        </button>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
      />
      <AlertDialog.Content
        class="rounded-lg bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-7 sm:max-w-lg md:w-full"
      >
        <div class="flex flex-col gap-4 pb-6">
          <AlertDialog.Title class="text-lg font-semibold tracking-tight">
            Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το ρόφημα;
          </AlertDialog.Title>
          <AlertDialog.Description class="text-foreground-alt text-sm">
            <p>Η διαγραφή του ροφήματος <strong>"{beverageName}"</strong> θα αφαιρέσει επίσης όλα τα συστατικά της συνταγής του.</p>
            <p class="mt-2 text-amber-600">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
          </AlertDialog.Description>
        </div>
  
        <form 
            onsubmit={async (e) => {
                e.preventDefault(); // Αποτρέπουμε το προεπιλεγμένο submit
                await handleDelete(); // Ξεκινάμε τη διαδικασία διαγραφής
            }}
          >
            <div class="flex w-full items-center justify-center gap-2">
              <AlertDialog.Cancel
                disabled={isDeleting}
                type="button"
                class="h-10 rounded-md bg-muted shadow-sm hover:bg-gray-200 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Ακύρωση
              </AlertDialog.Cancel>
              <AlertDialog.Action
                disabled={isDeleting}
                type="submit"
                class="h-10 rounded-md bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500 focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Διαγραφή
              </AlertDialog.Action>
            </div>
        </form>
      </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>