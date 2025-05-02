<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Beverage } from '$lib/types/database.types';
	import { Dialog, type WithoutChild } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import { Pencil, Upload } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import Label from '$lib/components/ui/Label.svelte';

	type Props = Dialog.RootProps & {
		beverage: Beverage;
		title?: Snippet;
		description?: Snippet;
		execution?: Snippet;
		contentProps?: WithoutChild<Dialog.ContentProps>;
	};

	let {
		open = $bindable(false),
		beverage,
		title,
		description,
		execution,
		contentProps,
		...restProps
	}: Props = $props();

	let name = $state(beverage.name || '');
	let beverageDescription = $state(beverage.description || '');
	let beverageExecution = $state(beverage.execution || '');
	let imageUrl = $state(beverage.image_url || '');
	let isLoading = $state(false);

	$effect(() => {
		if (beverage) {
			name = beverage.name || '';
			beverageDescription = beverage.description || '';
			imageUrl = beverage.image_url || '';
		}
	});

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			setTimeout(() => {}, 300);
		}
	}

	function wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function handleSubmit() {
		isLoading = true;

		try {
			await wait(800);
			await invalidateAll();
			open = false;
		} catch (error) {
			console.error('Σφάλμα κατά την ενημέρωση ροφήματος:', error);
		} finally {
			isLoading = false;
		}
	}


    let isDragging:boolean = $state(false);
	let selectedFile: File | null = $state(null);
    let fileError:string = $state('');

    function handleDragEnter(e: DragEvent){
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
    }

    function handleDragLeave(e: DragEvent){
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
  
        const files = e.dataTransfer?.files;
        if (files?.length) {
            validateAndSetFile(files[0]);
        }
    }

	function handleFileSelected(e: Event) {
		const files = (e.target as HTMLInputElement)?.files;
		if (files?.length) {
			validateAndSetFile(files[0]);
		}
	}

    function validateAndSetFile(file: File) {
        if (!file.type.match('image.*')) {
            fileError = 'Μόνο εικόνες επιτρέπονται';
            selectedFile = null;
            return;
        } 
  
        // Έλεγχος μεγέθους (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            fileError = 'Η εικόνα δεν πρέπει να ξεπερνά τα 5MB';
            selectedFile = null;
            return;
        }
        fileError = '';
        selectedFile = file ;
    }


</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange} {...restProps}>
	<Dialog.Trigger
		class="rounded-full border border-transparent bg-white p-1
        text-[#8B6B4A] shadow-sm transition-all duration-200
        hover:border-[#8B6B4A]/20 hover:text-[#6F563C] hover:shadow-md"
	>
		<Pencil size={14} />
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay forceMount>
			{#snippet child({ props, open: isOpen })}
				{#if isOpen}
					<div
						{...props}
						transition:fade={{ duration: 200 }}
						class="fixed inset-0 z-50 bg-black/50"
					></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>
		<Dialog.Content
			forceMount
			class="rounded-lg shadow-lg"
			onInteractOutside={(e) => {
				if (open) e.preventDefault();
			}}
		>
			{#snippet child({ props, open: isOpen })}
				{#if isOpen}
					<div
						{...props}
						transition:fly={{ duration: 300, y: 10 }}
						class="fixed top-[50%] left-[50%] z-50 grid max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
					>
						<div class="flex flex-col gap-2">
							<Dialog.Title class="text-xl font-semibold text-neutral-900">
								{#if title}
									{@render title()}
								{:else}
									Επεξεργασία Ροφήματος
								{/if}
							</Dialog.Title>
							<Dialog.Description class="text-sm text-neutral-500">
								{#if description}
									{@render description()}
								{:else}
									Τροποποιήστε τις πληροφορίες του ροφήματος.
								{/if}
							</Dialog.Description>
						</div>

						<form method="post" action="?/updateBeverage" class="space-y-4" enctype="multipart/form-data" onsubmit={handleSubmit}>
							<input type="hidden" name="id" value={beverage.id} />

							<div class="space-y-2">
								<Label for="name" required>Όνομα Ροφήματος</Label>
								<input
									type="text"
									id="name"
									name="name"
									required
									bind:value={name}
									class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#8B6B4A] focus:ring-[#8B6B4A] focus:outline-none"
									placeholder="Cappuccino"
								/>
							</div>

							<div class="space-y-2">
								<Label for="description">Περιγραφή</Label>
								<textarea
									id="description"
									name="description"
									rows="3"
									bind:value={beverageDescription}
									class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#8B6B4A] focus:ring-[#8B6B4A] focus:outline-none"
									placeholder="Προαιρετική περιγραφή του ροφήματος..."
								></textarea>
							</div>

							<div class="space-y-2">
								<Label for="execution">Υλοποιήση συνταγής</Label>
								<textarea
									id="execution"
									name="execution"
									rows="3"
									bind:value={beverageExecution}
									class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#8B6B4A] focus:ring-[#8B6B4A] focus:outline-none"
									placeholder="Προαιρετική υλοποιήση του ροφήματος..."
								></textarea>
							</div>

							<div class="space-y-2">
								<Label for="image_url">Εικόνα Ροφήματος</Label>
								{#if imageUrl}
									<div class="relative h-48 w-full overflow-hidden rounded-lg">
										<img src={imageUrl} alt={name} class="h-full w-full object-cover" />
										<button
											type="button"
											class="absolute top-2 right-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
											aria-label="Αφαίρεση εικόνας"
											onclick={() => (imageUrl = '')}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="text-red-500"
											>
												<path d="M18 6 6 18" />
												<path d="m6 6 12 12" />
											</svg>
										</button>
									</div>
									<input type="hidden" name="image_url" value={imageUrl} />
								{:else}
									<!-- Περιοχή για ανέβασμα εικόνων -->
									<div
										class="flex w-full items-center justify-center"
										role="button"
										tabindex="0"
										aria-label="Περιοχή για ανέβασμα εικόνας"
										ondragenter={handleDragEnter}
										ondragleave={handleDragLeave}
										ondragover={handleDragOver}
										ondrop={handleDrop}
									>
										<label
											for="dropzone-file"
											class={`flex h-48 w-full cursor-pointer flex-col items-center justify-center
                                                    rounded-lg border-2 border-dashed
                                                    transition-colors duration-200 hover:bg-gray-100
                                                     ${isDragging ? 'border-[#8B6B4A] bg-[#8B6B4A]/5' : 'border-gray-300'}`}
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
												name="image_file"
												type="file"
												accept="image/*"
												class="hidden"
												onchange={handleFileSelected}
											/>
										</label>
									</div>
									{#if selectedFile}
										<p class="mt-1 text-sm text-green-600">
											Επιλεγμένο αρχείο: {selectedFile.name}
										</p>
									{/if}
									{#if fileError}
										<p class="mt-1 text-sm text-red-500">{fileError}</p>
									{/if}
								{/if}
							</div>

							<div class="flex justify-end gap-3 pt-4">
								<button
									type="button"
									class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2 focus:outline-none"
									onclick={() => (open = false)}
									disabled={isLoading}
								>
									Ακύρωση
								</button>
								<button
									type="submit"
									class="inline-flex items-center justify-center rounded-md border border-transparent bg-[#8B6B4A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#6F563C] focus:ring-2 focus:ring-[#8B6B4A] focus:ring-offset-2 focus:outline-none"
									disabled={isLoading}
								>
									{#if isLoading}
										<svg
											class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									{/if}
									Ενημέρωση
								</button>
							</div>
						</form>

						<Dialog.Close
							class="absolute top-4 right-4 rounded-full p-1.5 text-neutral-500 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-800"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-x"
							>
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
						</Dialog.Close>
					</div>
				{/if}
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
