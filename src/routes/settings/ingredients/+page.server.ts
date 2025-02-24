//routes/setting/ingredients/+page.server.ts
import type { PageServerLoad } from './$types';
import type { Ingredient } from '$lib/types/database.types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: Ingredient, error } = await supabase
    .from('ingredients')
    .select(`
        *,
        recipe_ingredients!left(count)
    `)
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

  },

  addIngredient: async({ request, locals: {supabase} }) => {
    const formData = await request.formData();

    const name:string = formData.get('name') as string;
    const description = formData.get('description') as string || null;
    const category = formData.get('category') as string || null;
    const measurement_unit = formData.get('measurement_unit') as string

    console.log(name,description,category,measurement_unit)
    if (!name || !measurement_unit) {
      return fail(400, { 
        message: 'Το όνομα και η μονάδα μέτρησης είναι υποχρεωτικά',
        invalid: true,
        values: {
          name,
          description,
          category,
          measurement_unit
        }
      });
    }

    const { data , error } = await supabase
    .from('ingredients')
    .insert([
      {
        name,
        description, 
        category, 
        measurement_unit 
      }
    ])
    .select();

    if(error){
      return fail(500, {
        message: 'Αποτυχία προσθήκης συστατικού',
        invalid: true,
        values: {
          name,
          description,
          category,
          measurement_unit
        }
      });
    }

    return {
      success: true,
      message: "Το συστατικό προστέθηκε επιτυχώς",
      data
    };
  }
}