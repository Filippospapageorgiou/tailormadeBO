import type { PageServerLoad } from './$types';
import type { Beverage, Ingredient, RecipeIngredient } from '$lib/types/database.types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

const defaultInageUrl:string = "https://uhrpdmoknmrbosqenotk.supabase.co/storage/v1/object/public/beverages//default_url.png";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  // Φέρνουμε όλα τα ροφήματα
  const { data: beverages, error: beveragesError } = await supabase
    .from('beverages')
    .select('*')
    .order('id')
    .returns<Beverage[]>();

  if (beveragesError) {
    console.error('Error fetching beverages:', beveragesError);
    return { beverages: [], ingredients: [], totalBeverages: 0 };
  }

  
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')
    .returns<Ingredient[]>();

  if (ingredientsError) {
    console.error('Error fetching ingredients:', ingredientsError);
    return { beverages: beverages ?? [], ingredients: [], totalBeverages: beverages?.length ?? 0 };
  }

  return {
    beverages: beverages ?? [],
    ingredients: ingredients ?? [],
    totalBeverages: beverages?.length ?? 0
  };
};

export const actions: Actions = {
  // Προσθήκη νέου ροφήματος
  addBeverage: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string || null;
    const image_url = defaultInageUrl;
    const execution = formData.get('execution') as string || null;

    if (!name) {
      return fail(400, {
        message: 'Το όνομα του ροφήματος είναι υποχρεωτικό',
        invalid: true,
        values: { name, description, image_url }
      });
    }

    // Έλεγχος αν υπάρχει ήδη ρόφημα με το ίδιο όνομα
    const { data: existingBeverage, error: searchError } = await supabase
      .from('beverages')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    if (searchError) {
      console.error('Error checking for existing beverage:', searchError);
      return fail(500, {
        message: 'Σφάλμα κατά τον έλεγχο για υπάρχον ρόφημα',
        invalid: true,
        values: { name, description, image_url }
      });
    }

    if (existingBeverage) {
      return fail(400, {
        message: 'Υπάρχει ήδη ρόφημα με αυτό το όνομα',
        invalid: true,
        values: { name, description, image_url }
      });
    }

    const { data, error } = await supabase
      .from('beverages')
      .insert([{ name, description, image_url, execution }])
      .select();

    if (error) {
      return fail(500, {
        message: 'Αποτυχία προσθήκης ροφήματος',
        invalid: true,
        values: { name, description, image_url }
      });
    }

    return {
      success: true,
      message: "Το ρόφημα προστέθηκε επιτυχώς",
      data
    };
  },

  // Ενημέρωση υπάρχοντος ροφήματος
  updateBeverage: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string || null;
    const existing_image_url = formData.get('image_url') as string || null;
    const execution = formData.get('execution') as string || null;

    const imageFile = formData.get("image_file") as File || null;

    console.log("File parsing : " + existing_image_url);
    console.log("File came " + imageFile);

    if (!id || !name) {
      return fail(400, {
        message: 'Το ID και το όνομα του ροφήματος είναι υποχρεωτικά',
        invalid: true,
        values: { id, name, description, url:existing_image_url }
      });
    }



    // Έλεγχος αν υπάρχει ήδη ρόφημα με το ίδιο όνομα (εκτός από το τρέχον)
    const { data: existingBeverage, error: searchError } = await supabase
      .from('beverages')
      .select('id')
      .neq('id', id)
      .ilike('name', name)
      .maybeSingle();

    if (searchError) {
      console.error('Error checking for existing beverage:', searchError);
      return fail(500, {
        message: 'Σφάλμα κατά τον έλεγχο για υπάρχον ρόφημα',
        invalid: true,
        values: { id, name, description, url:existing_image_url ,execution }
      });
    }

    if (existingBeverage) {
      return fail(400, {
        message: 'Υπάρχει ήδη ρόφημα με αυτό το όνομα',
        invalid: true,
        values: { id, name, description, url:existing_image_url }
      });
    }


    //Αν υπάρχει νέο αρχείο εικόνας ανέβασμα στο supabase storage
    let image_url = existing_image_url;
    if(imageFile instanceof File && imageFile.size > 0){

      if(!imageFile.type.startsWith('image/')){
        return fail(400,{
          message: 'Μη έγκυρος τύπος αρχείου. Μόνο εικόνες επιτρέπονται.',
          invalid: true,
          values: { id, name, description, image_url }
        })
      }

      // Έλεγχος μεγέθους (5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return fail(400, {
          message: 'Το μέγεθος της εικόνας δεν πρέπει να ξεπερνά τα 5MB',
          invalid: true,
          values: { id, name, description, image_url }
        });
      }

      //ανεβάσμα στο storage
      try{
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `beverage-${id}-${Date.now()}.${fileExt}`;

        const arrayBuffer = await imageFile.arrayBuffer();

        const { data, error } = await supabase.storage
          .from('beverages')
          .upload(fileName, arrayBuffer, {
            contentType: imageFile.type,
            upsert: false
          });
        
        if (error) throw error;

          // Δημιουργία του public URL
        const { data: publicUrlData } = supabase.storage
          .from('beverages')
          .getPublicUrl(data.path);
    
        image_url = publicUrlData.publicUrl;
      }catch (error) {
        console.error('Σφάλμα κατά το ανέβασμα της εικόνας:', error);
        return fail(500, {
          message: 'Σφάλμα κατά το ανέβασμα της εικόνας',
          invalid: true,
          values: { id, name, description, image_url: existing_image_url }
        });
      }
    }else if(existing_image_url === ''){
        // Αν το image_url είναι κενό, αλλά δεν έχει σταλεί νέο αρχείο,
        // σημαίνει ότι ο χρήστης αφαίρεσε την εικόνα
        image_url = null;
    }


    const { data, error } = await supabase
      .from('beverages')
      .update({ name, description, image_url , execution })
      .eq('id', id)
      .select();

    if (error) {
      return fail(500, {
        message: 'Αποτυχία ενημέρωσης ροφήματος',
        invalid: true,
        values: { id, name, description, image_url }
      });
    }

    return {
      success: true,
      message: "Το ρόφημα ενημερώθηκε επιτυχώς",
      data
    };
  },

  // Διαγραφή ροφήματος
  deleteBeverage: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return fail(400, { message: 'ID is required' });
    }

    // Πρώτα διαγράφουμε όλα τα συστατικά συνταγής που σχετίζονται με το ρόφημα
    const { error: recipeIngredientsError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('beverage_id', id);

    if (recipeIngredientsError) {
      console.error('Error deleting recipe ingredients:', recipeIngredientsError);
      return fail(500, { message: 'Failed to delete related recipe ingredients' });
    }

    // Μετά διαγράφουμε το ρόφημα
    const { error } = await supabase
      .from('beverages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beverage:', error);
      return fail(500, { message: 'Failed to delete beverage' });
    }

    return { success: true };
  },

  // Προσθήκη συστατικού σε συνταγή
  addRecipeIngredient: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const beverage_id = formData.get('beverage_id') as string;
    const ingredient_id = formData.get('ingredient_id') as string;
    const quantity = formData.get('quantity') as string;
    const notes = formData.get('notes') as string || null;

    if (!beverage_id || !ingredient_id || !quantity) {
      return fail(400, {
        message: 'Το ρόφημα, το συστατικό και η ποσότητα είναι υποχρεωτικά',
        invalid: true,
        values: { beverage_id, ingredient_id, quantity, notes }
      });
    }

    
    const { data: existingIngredient, error: searchError } = await supabase
      .from('recipe_ingredients')
      .select('id')
      .eq('beverage_id', beverage_id)
      .eq('ingredient_id', ingredient_id)
      .maybeSingle();

    if (searchError) {
      console.error('Error checking for existing recipe ingredient:', searchError);
      return fail(500, {
        message: 'Σφάλμα κατά τον έλεγχο για υπάρχον συστατικό στη συνταγή',
        invalid: true,
        values: { beverage_id, ingredient_id, quantity, notes }
      });
    }

    if (existingIngredient) {
      return fail(400, {
        message: 'Το συστατικό υπάρχει ήδη στη συνταγή',
        invalid: true,
        values: { beverage_id, ingredient_id, quantity, notes }
      });
    }

    // Μετατροπή του quantity σε αριθμό
    const numericQuantity = parseFloat(quantity);

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert([{
        beverage_id,
        ingredient_id,
        quantity: numericQuantity,
        notes
      }])
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
      `);

    if (error) {
      return fail(500, {
        message: 'Αποτυχία προσθήκης συστατικού στη συνταγή',
        invalid: true,
        values: { beverage_id, ingredient_id, quantity, notes }
      });
    }

    return {
      success: true,
      message: "Το συστατικό προστέθηκε επιτυχώς στη συνταγή",
      data
    };
  },

  // Ενημέρωση συστατικού συνταγής
  updateRecipeIngredient: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const quantity = formData.get('quantity') as string;
    const notes = formData.get('notes') as string || null;

    if (!id || !quantity) {
      return fail(400, {
        message: 'Το ID και η ποσότητα είναι υποχρεωτικά',
        invalid: true,
        values: { id, quantity, notes }
      });
    }

    // Μετατροπή του quantity σε αριθμό
    const numericQuantity = parseFloat(quantity);

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .update({
        quantity: numericQuantity,
        notes
      })
      .eq('id', id)
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
      `);

    if (error) {
      return fail(500, {
        message: 'Αποτυχία ενημέρωσης συστατικού συνταγής',
        invalid: true,
        values: { id, quantity, notes }
      });
    }

    return {
      success: true,
      message: "Το συστατικό της συνταγής ενημερώθηκε επιτυχώς",
      data
    };
  },

  // Διαγραφή συστατικού από συνταγή
  deleteRecipeIngredient: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return fail(400, { message: 'ID is required' });
    }

    const { error } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipe ingredient:', error);
      return fail(500, { message: 'Failed to delete recipe ingredient' });
    }

    return { success: true };
  },

  getRecipeIngredients: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const beverage_id = formData.get('beverage_id');

    if (!beverage_id) {
      return fail(400, { message: 'Beverage ID is required' });
    }

    try {
      const { data : recipe_ingredients, error } = await supabase
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
        return fail(500, { message: 'Failed to fetch recipe ingredients' });
      }
      
      // Επιστροφή καθαρών δεδομένων από το supabase
      return {
        success: true,
        data: recipe_ingredients,
        message : "Συστατίκα βρέθηκαν επίτυχως"
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return fail(500, { message: 'An unexpected error occurred' });
    }
  }
};