<script lang="ts">
    import type { Snippet } from "svelte";
    import { AlertDialog, type WithoutChild } from "bits-ui";
	  import { Trash2 } from "lucide-svelte";
	  import { invalidateAll } from "$app/navigation";
    import ProgressBar from "./ProgressBar.svelte";
 
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
    let progressValue = $state(0);
    let showProgress = $state(false);

    async function simulateProgress(){
      showProgress = true;
      progressValue = 0;

      // Αρχική πρόοδος γρήγορα
      for (let i = 0; i <= 60; i += 20) {
            progressValue = i;
            await wait(100);
        }
        
        // Μεσαία πρόοδος λίγο πιο αργά
        for (let i = 60; i <= 85; i += 5) {
            progressValue = i;
            await wait(80);
        }
        
        // Τελική πρόοδος πιο αργά
        for (let i = 85; i < 100; i += 3) {
            progressValue = i;
            await wait(60);
        }
        
        // Τελική τιμή
        progressValue = 100;
    }

    // Χειρισμός διαγραφής
    async function handleDelete() {
        isDeleting = true;
        
        // Έναρξη προσομοίωσης προόδου
        simulateProgress();
        
        // Περιμένουμε για να προσομοιώσουμε τη διαδικασία διαγραφής
        await wait(1200);
        
        // Επαναφορά των state μετά την ολοκλήρωση
        setTimeout(() => {
            isDeleting = false;
            progressValue = 0;
            showProgress = false;
        }, 500);
    }
    
    function handleOpenChange(isOpen: boolean) {
        if (!isOpen && onCancel) {
            onCancel();
        }
        
        if (!isOpen) {
            setTimeout(() => {
                isDeleting = false;
                progressValue = 0;
                showProgress = false;
            }, 300);
        }
    }

</script>

<AlertDialog.Root bind:open {...restProps} onOpenChange={(isOpen) => {
    if (!isOpen && onCancel) onCancel();}}>
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

        {#if showProgress}
            <div class="mb-4">
                <ProgressBar 
                    value={progressValue} 
                    label="Διαγραφή συστατικού..." 
                    autoHide={true}
                />
            </div>
        {/if}

        {@render children?.()}
        <form 
            method="POST" 
            action="?/deleteIngredient"
            onsubmit={async () => {
              await handleDelete();
                await wait(1000);
                open = false;
                await invalidateAll();
            }}
          >
            <input type="hidden" name="id" value={ingredientId} />
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