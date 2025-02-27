import type { RecipeIngredient } from '$lib/types/database.types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
    const beverage_id = url.searchParams.get('beverage_id');

    if (!beverage_id) {
        return json([], { status: 400 });
    }

    try {
        const { data, error } = await supabase
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
            .eq('beverage_id', beverage_id);

        if (error) {
            console.error('Error fetching recipe ingredients:', error);
            return json([], { status: 500 });
        }

        // Επιστροφή των δεδομένων ως JSON
        return json(data || []);
    } catch (error) {
        console.error('Unexpected error:', error);
        return json([], { status: 500 });
    }
};