import type { PageServerLoad } from './$types';
import type { Beverage } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: beverages, error } = await supabase
    .from('beverages')
    .select('*')
    .order('id')
    .returns<Beverage[]>();
  if (error) {
    console.error('Error fetching beverages:', error);
    return { beverages: [] };
  }

  return {
    beverages: beverages ?? []
  };
};