// src/routes/api/auth/logout/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Error during logout:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
    
    return json({ success: true });
};