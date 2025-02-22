import type { PageServerLoad } from './$types';
import type { Ingredient } from '$lib/types/database.types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: Ingredient, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('id')
    .returns<Ingredient[]>();

    const total:number = Ingredient?.length || 0;
  if (error) {
    console.error('Error fetching beverages:', error);
    return { beverages: [] };
  }

  return {
    ingredients: Ingredient ?? [],
    total : total
  };
};

export const actions:Actions = {
  deleteIngredient: async({ request, locals: {supabase} }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if(!id){
      return fail(400, {message: 'ID is required'});
    }

    const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id',id);

    if (error) {
      console.error('Error deleting ingredient:', error);
      return fail(500, { message: 'Failed to delete ingredient' });
    }

    return { success: true };

  }
}