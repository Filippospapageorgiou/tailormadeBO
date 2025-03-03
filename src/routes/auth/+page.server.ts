import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { SignUpFormData, LoginFormData, User } from '$lib/types/database.types';
import { fail } from '@sveltejs/kit';

const DEFAULT_AVATAR_URL:string = 'https://uhrpdmoknmrbosqenotk.supabase.co/storage/v1/object/public/avatars_url//default.png';

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const data: SignUpFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      username: formData.get('username') as string || undefined
    };

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw redirect(303, '/auth/error');
    }

    if (authData.user) {
      const newUser: Omit<User, 'created_at' | 'updated_at'> = {
        id: authData.user.id,
        email: authData.user.email!,
        image_url: DEFAULT_AVATAR_URL,
        username: data.username || data.email.split('@')[0],
        role: 'employee'
      };

      const { error: dbError } = await supabase
        .from('users')
        .insert(newUser);

      if (dbError) {
        console.error('Database error:', dbError);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
        if (deleteError) console.error('Error deleting auth user:', deleteError);
        throw redirect(303, '/auth/error');
      }
    }

    throw redirect(303, '/');
  },

  login: async ({ request, locals ,locals: { supabase } }) => {
    const formData = await request.formData();
    const data: LoginFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    // Προσπάθεια login
    const { data: { user }, error:signInError } = await supabase.auth.signInWithPassword(data);
    if (signInError) {
      return fail(400, { message: 'user doesnt exist with email or password' });
    }
    
    if (user) {
      // Έλεγχος αν ο χρήστης υπάρχει στη βάση
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single<User>();

      if (!dbUser) {
        // Δημιουργία νέου χρήστη στον πίνακα users
        const newUser: Omit<User, 'created_at' | 'updated_at'> = {
          id: user.id,
          email: user.email!,
          image_url: DEFAULT_AVATAR_URL,
          username: user.email!.split('@')[0],
          role: 'employee'
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert(newUser);

        if (insertError) {
          console.error('Error creating user in database:', insertError);
          await supabase.auth.signOut();
          throw redirect(303, '/auth/error');
        }

        console.log('Created new user in database:', newUser);
      }
    }

    throw redirect(303, '/');
  },

  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut();
    throw redirect(303, '/');
  }
};