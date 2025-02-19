// routes/settings/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import type { Ingredient } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const searchQuery = url.searchParams.get('search') || '';
    const categoryFilter = url.searchParams.get('category') || '';
    const unitFilter = url.searchParams.get('unit') || '';
    const sortBy = url.searchParams.get('sort') || 'name';
    const sortOrder = url.searchParams.get('order') || 'asc';

    let query = supabase
        .from('ingredients')
        .select('*', { count: 'exact' });

    // Apply filters
    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
    }
    if (categoryFilter) {
        query = query.eq('category', categoryFilter);
    }
    if (unitFilter) {
        query = query.eq('measurement_unit', unitFilter);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: ingredients, error: ingredientsError, count } = await query;

    if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError);
        throw error(500, 'Error fetching ingredients');
    }

    // Get unique categories and measurement units for filters
    const { data: categories } = await supabase
        .from('ingredients')
        .select('category')
        .not('category', 'is', null);

    const { data: units } = await supabase
        .from('ingredients')
        .select('measurement_unit')
        .not('measurement_unit', 'is', null);

    const uniqueCategories = [...new Set(categories?.map(i => i.category))];
    const uniqueUnits = [...new Set(units?.map(i => i.measurement_unit))];

    return {
        ingredients,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        categories: uniqueCategories,
        units: uniqueUnits
    };
};

export const actions: Actions = {
    create: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const ingredient: Partial<Ingredient> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            measurement_unit: formData.get('measurement_unit') as string
        };

        const { error: createError } = await supabase
            .from('ingredients')
            .insert(ingredient);

        if (createError) {
            return { success: false, error: 'Failed to create ingredient' };
        }

        return { success: true };
    },

    update: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const ingredient: Partial<Ingredient> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            measurement_unit: formData.get('measurement_unit') as string
        };

        const { error: updateError } = await supabase
            .from('ingredients')
            .update(ingredient)
            .eq('id', id);

        if (updateError) {
            return { success: false, error: 'Failed to update ingredient' };
        }

        return { success: true };
    },

    delete: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        const { error: deleteError } = await supabase
            .from('ingredients')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return { success: false, error: 'Failed to delete ingredient' };
        }

        return { success: true };
    }
};