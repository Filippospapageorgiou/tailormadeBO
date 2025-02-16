// routes/beverages/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import type { Beverage, RecipeIngredient } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
    // Φέρνουμε το συγκεκριμένο beverage
    const { data: beverage, error: beverageError } = await supabase
        .from('beverages')
        .select('*')
        .eq('id', params.id)
        .single<Beverage>();

    if (beverageError) {
        console.error('Error fetching beverage:', beverageError);
        return {
            beverage: null,
            recipeIngredients: []
        };
    }

    // Φέρνουμε τα recipe ingredients με τα ingredients data
    const { data: recipeIngredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
            id,
            beverage_id,
            ingredient_id,
            quantity,
            notes,
            ingredients (
                name,
                measurement_unit
            )
        `)
        .eq('beverage_id', params.id)
        .returns<RecipeIngredient[]>();

    if (ingredientsError) {
        console.error('Error fetching recipe ingredients:', ingredientsError);
        return {
            beverage,
            recipeIngredients: []
        };
    }

    return {
        beverage,
        recipeIngredients
    };
};