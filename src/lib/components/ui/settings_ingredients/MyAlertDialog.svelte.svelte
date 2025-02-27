<script lang="ts">
  import type { Snippet } from "svelte";
  import { AlertDialog, type WithoutChild } from "bits-ui";
  import { Trash2 } from "lucide-svelte";
  import { progressStore } from '$lib/stores/progressStore';

  type Props = AlertDialog.RootProps & {
      buttonText: string;
      title: Snippet;
      description: Snippet;
      preventScroll: boolean;
      contentProps?: WithoutChild<AlertDialog.ContentProps>;
      onConfirm?: () => void;
      onCancel?: () => void;
      hiddenInputs?: Snippet; 
      ingredientId: number;  
      ingredientName: string;
  };

  let {
      open = $bindable(false),
      children,
      buttonText,
      contentProps,
      title,
      description,
      hiddenInputs,
      onConfirm,
      onCancel,
      preventScroll,
      ingredientId,    
      ingredientName,
      ...restProps
  }: Props = $props();

  function wait(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let isDeleting = $state(false);

  // Χειρισμός διαγραφής
  async function handleDelete() {
      isDeleting = true;
      
      // Περίμενε λίγο για εφέ
      await wait(200);
      
      // Κλείσε το dialog
      open = false;
      
      // Εκκίνηση του progress bar αφού κλείσει το dialog
      await wait(200); // Περίμενε να κλείσει το dialog
      progressStore.startProgress(`Διαγραφή συστατικού: ${ingredientName}...`);
      
      try {
          // Δημιουργία και αποστολή του αιτήματος διαγραφής
          const formData = new FormData();
          formData.append('id', ingredientId.toString());
          
          const response = await fetch('?/deleteIngredient', {
              method: 'POST',
              body: formData
          });
          
          if (!response.ok) {
              throw new Error('Σφάλμα κατά τη διαγραφή');
          }
          
          // Περιμένουμε λίγο ακόμα για να δείξουμε την πρόοδο
          await wait(800);
          
          // Ολοκληρώνουμε την πρόοδο ΠΡΙΝ την ανακατεύθυνση με μεγαλύτερη καθυστέρηση
          progressStore.completeProgress(1000);
          
          // Περιμένουμε να ολοκληρωθεί το animation του progress bar
          await wait(1000);
          
          // Ανανέωση των δεδομένων με πλήρη ανακατεύθυνση αφού ολοκληρωθεί η διαγραφή
          window.location.href = window.location.pathname;
          
      } catch (error) {
          console.error('Σφάλμα:', error);
          progressStore.completeProgress();
          // Εδώ θα μπορούσες να προσθέσεις ένα μήνυμα σφάλματος
      } finally {
          // Επαναφορά κατάστασης
          setTimeout(() => {
              isDeleting = false;
          }, 500);
      }
  }
  
  function handleOpenChange(isOpen: boolean) {
      if (!isOpen && onCancel) {
          onCancel();
      }
      
      if (!isOpen) {
          setTimeout(() => {
              isDeleting = false;
          }, 300);
      }
  }
</script>

<AlertDialog.Root bind:open {...restProps} onOpenChange={handleOpenChange}>
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
    <AlertDialog.Content {...contentProps}
      class="rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-7 sm:max-w-lg md:w-full "
    >
      <div class="flex flex-col gap-4 pb-6">
        <AlertDialog.Title class="text-lg font-semibold tracking-tight">
          {@render title()}
        </AlertDialog.Title>
        <AlertDialog.Description class="text-foreground-alt text-sm">
          {@render description()}
        </AlertDialog.Description>
      </div>

      {@render children?.()}
      <form 
          onsubmit={async (e) => {
              e.preventDefault(); // Αποτρέπουμε το προεπιλεγμένο submit
              await handleDelete(); // Ξεκινάμε τη διαδικασία διαγραφής που τώρα περιλαμβάνει την υποβολή της φόρμας
          }}
        >
          <!-- Το input id δεν είναι απαραίτητο πλέον εδώ καθώς το χειριζόμαστε στη συνάρτηση handleDelete -->

          <div class="flex w-full items-center justify-center gap-2">
            <AlertDialog.Cancel
              disabled={isDeleting}
              type="button"
              class="h-input rounded-input bg-muted shadow-mini hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              disabled={isDeleting}
              type="submit"
              class="h-input rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Continue
            </AlertDialog.Action>
          </div>
      </form>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>