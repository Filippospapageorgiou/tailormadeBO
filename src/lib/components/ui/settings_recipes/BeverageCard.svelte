<script lang="ts">
	import type { Beverage, Ingredient, RecipeIngredient } from '$lib/types/database.types';
	import { invalidateAll } from '$app/navigation';
	import { Pencil, Trash2, Plus, Info } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import EditBeverageDialog from './EditBeverageDialog.svelte';
	import DeleteBeverageDialog from './DeleteBeverageDialog.svelte';
	import RecipeIngredientDialog from './RecipeIngredientDialog.svelte';
	import { progressStore } from '$lib/stores/progressStore';

	let { beverage, ingredients } = $props<{
		beverage: Beverage;
		ingredients: Ingredient[];
	}>();

	let isExpanded = $state(false);
	let recipeIngredients = $state<RecipeIngredient[]>([]);
	let isLoading = $state(false);
	let showRecipeDialog = $state(false);

	// Φόρτωση των συστατικών της συνταγής όταν το card αναπτύσσεται
	async function toggleExpand() {
		isExpanded = !isExpanded;

		if (isExpanded && recipeIngredients.length === 0) {
			loadIngredients();
		}
	}
	// Φόρτωση των συστατικών για το συγκεκριμένο ρόφημα
	async function loadIngredients() {
		isLoading = true;

		try {
			// Χρησιμοποιούμε ένα GET αίτημα σε ειδικό endpoint
			const response = await fetch(
				`/settings/recipe_ingredients/api/get-ingredients?beverage_id=${beverage.id}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json'
					}
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log(data);
			// Βεβαιωνόμαστε ότι τα δεδομένα είναι πίνακας
			if (Array.isArray(data)) {
				recipeIngredients = data;
				console.log(recipeIngredients);
			} else {
				console.error('Μη αναμενόμενος τύπος δεδομένων:', data);
				recipeIngredients = [];
			}
		} catch (error) {
			console.error('Σφάλμα κατά τη φόρτωση συστατικών:', error);
			recipeIngredients = [];
		} finally {
			isLoading = false;
		}
	}

	// Διαγραφή συστατικού από τη συνταγή
	async function deleteIngredient(id: number, name: string) {
		progressStore.startProgress(`Διαγραφή συστατικού: ${name}...`);

		try {
			const formData = new FormData();
			formData.append('id', id.toString());

			const response = await fetch('?/deleteRecipeIngredient', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Αφαίρεση του συστατικού από την τοπική λίστα
				recipeIngredients = recipeIngredients.filter((item) => item.id !== id);
				progressStore.completeProgress();
			} else {
				throw new Error('Σφάλμα κατά τη διαγραφή');
			}
		} catch (error) {
			console.error('Σφάλμα:', error);
			progressStore.completeProgress();
		}
	}
</script>

<div
	class="relative overflow-hidden rounded-lg border border-gray-100 bg-white p-4
    shadow-sm transition-all duration-300 hover:border-[#8B6B4A]/20 hover:shadow-md"
	in:fade={{ duration: 300 }}
>
	<!-- Κεφαλίδα Κάρτας -->
	<div class="mb-2 flex items-start justify-between">
		<div class="flex items-center">
			<span class="mr-1 text-xs text-[#8B6B4A]">#{beverage.id}</span>
			<h3 class="pl-1 text-base font-medium text-neutral-800">{beverage.name}</h3>
		</div>

		<!-- Buttons ενεργειών -->
		<div class="flex gap-1">
			<EditBeverageDialog {beverage}>
				{#snippet title()}
					Επεξεργασία Ροφήματος
				{/snippet}
				{#snippet description()}
					Τροποποιήστε τις πληροφορίες του ροφήματος "{beverage.name}"
				{/snippet}
			</EditBeverageDialog>

			<DeleteBeverageDialog beverageId={beverage.id} beverageName={beverage.name} />
		</div>
	</div>

	<!-- Εικόνα (σταθερό μέγεθος με placeholder αν δεν υπάρχει) -->
	<div class="mb-3 h-48 w-full overflow-hidden rounded-md bg-gray-100">
		<img
			src={beverage.image_url}
			alt={beverage.name}
			class="h-full w-full object-cover"
		/>
	</div>

	<!-- Περιγραφή -->
	{#if beverage.description}
		<p class="mb-3 text-sm text-neutral-600">{beverage.description}</p>
	{/if}

	<!-- Expand button για τα συστατικά -->
	<button
		onclick={toggleExpand}
		class="mt-2 flex w-full items-center justify-between rounded-md border border-gray-200
               px-3 py-2 text-sm text-neutral-700
               transition-colors duration-200 hover:border-[#8B6B4A]/20 hover:bg-[#8B6B4A]/5"
	>
		<span class="flex items-center gap-1">
			<Info size={16} />
			<span>{isExpanded ? 'Απόκρυψη' : 'Προβολή'} Συστατικών</span>
		</span>
		<svg
			class={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Περιοχή συστατικών (εμφανίζεται όταν είναι expanded) -->
	{#if isExpanded}
		<div class="mt-3 border-t border-gray-100 pt-3" transition:fade={{ duration: 200 }}>
			<div class="mb-3 flex items-center justify-between">
				<h4 class="text-sm font-medium text-[#8B6B4A]">Συστατικά Συνταγής</h4>
				<button
					class="flex items-center gap-1 rounded p-1 text-xs
                   text-[#8B6B4A] transition-colors duration-200 hover:bg-[#8B6B4A]/10 hover:text-[#6F563C]"
					onclick={() => (showRecipeDialog = true)}
				>
					<Plus size={14} />
					<span>Προσθήκη</span>
				</button>
			</div>

			{#if isLoading}
				<div class="py-2 text-center text-neutral-500">
					<svg
						class="mx-auto mb-1 h-4 w-4 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<p class="text-xs">Φόρτωση συστατικών...</p>
				</div>
			{:else if recipeIngredients.length === 0}
				<div class="py-2 text-center text-neutral-500">
					<p class="text-sm">Δεν υπάρχουν συστατικά. Προσθέστε το πρώτο συστατικό στη συνταγή!</p>
				</div>
			{:else}
				<!-- Λίστα συστατικών - απλή μορφή -->
				<div class="space-y-1">
					{#each recipeIngredients as ingredient, index (ingredient.id)}
						<div
							class="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5 transition-colors duration-200 hover:border-[#8B6B4A]/20"
							transition:fade={{ duration: 150 }}
						>
							<!-- Αριστερή πλευρά - Όνομα συστατικού -->
							<div class="flex items-center gap-2">
								<span class="text-xs font-medium text-[#8B6B4A]">{index + 1}.</span>
								<span class="text-sm text-neutral-800">
									{ingredient.ingredients?.name || 'Άγνωστο συστατικό'}
								</span>
							</div>

							<!-- Μεσαία πλευρά - Ποσότητα με μονάδα μέτρησης -->
							<div class="text-sm text-[#8B6B4A]">
								{ingredient.quantity}
								{ingredient.ingredients?.measurement_unit || ''}
							</div>

							<!-- Δεξιά πλευρά - Κουμπιά ενεργειών -->
							<div class="ml-2 flex items-center gap-1">
								<RecipeIngredientDialog
									mode="edit"
									recipeIngredient={ingredient}
									{ingredients}
									beverageId={beverage.id}
								/>

								<button
									class="rounded-full border border-transparent bg-white p-1
                                text-red-500 shadow-sm transition-all duration-200
                                hover:border-red-200 hover:text-red-600 hover:shadow-md"
									onclick={() =>
										deleteIngredient(
											ingredient.id,
											ingredient.ingredients?.name || 'Άγνωστο συστατικό'
										)}
									title="Διαγραφή συστατικού"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Modal για προσθήκη συστατικού -->
	{#if showRecipeDialog}
		<RecipeIngredientDialog
			mode="add"
			bind:open={showRecipeDialog}
			{ingredients}
			beverageId={beverage.id}
			onSuccess={loadIngredients}
		/>
	{/if}
</div>
