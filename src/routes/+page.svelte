<script lang="ts">
    import type { PageData } from './$types';
    
    let { data } = $props<{ data: PageData }>();
    let { beverages } = $derived(data);
</script>
    
<div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Ροφήματα</h1>
      
      {#each beverages as beverage}
        <div class="mb-8 p-4 border rounded-lg">
          <h2 class="text-xl font-semibold">{beverage.name}</h2>
          <p class="text-gray-600 mb-4">{beverage.description}</p>
          
          <h3 class="font-medium mb-2">Συστατικά:</h3>
          <ul class="space-y-2">
            {#each beverage.recipe_ingredients as recipe}
              <li>
                <span class="font-medium">{recipe.ingredients.name}:</span>
                {recipe.quantity} {recipe.ingredients.measurement_unit}
                {#if recipe.notes}
                  <br>
                  <span class="text-sm text-gray-500">{recipe.notes}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
</div>