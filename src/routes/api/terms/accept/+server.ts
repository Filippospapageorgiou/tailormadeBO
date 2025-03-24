// src/routes/api/terms/accept/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase, user } }) => {
    if (!user) {
        return json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        // Έλεγχος αν υπάρχει ήδη εγγραφή αποδοχής
        const { data: existingAcceptance, error: searchError } = await supabase
            .from('user_term_acceptance')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (searchError) {
            console.error('Error checking for existing acceptance:', searchError);
            return json({ success: false, message: 'Σφάλμα ελέγχου αποδοχής όρων' }, { status: 500 });
        }

        // Αν υπάρχει ήδη, επιστρέφουμε επιτυχία χωρίς νέα εισαγωγή
        if (existingAcceptance) {
            return json({ success: true, message: 'Οι όροι έχουν ήδη γίνει αποδεκτοί' });
        }

        // Αποθήκευση της νέας αποδοχής
        const now = new Date().toISOString();
        const { error: insertError } = await supabase
            .from('user_term_acceptance')
            .insert([{ 
                user_id: user.id, 
                is_accepted: true,
                created_at: now
            }]);

        if (insertError) {
            console.error('Error inserting acceptance:', insertError);
            return json({ success: false, message: 'Σφάλμα αποθήκευσης αποδοχής όρων' }, { status: 500 });
        }

        return json({ 
            success: true, 
            message: 'Οι όροι χρήσης έγιναν αποδεκτοί επιτυχώς' 
        });
    } catch (error) {
        console.error("Unexpected error", error);
        return json({ success: false, message: 'Προέκυψε απρόβλεπτο σφάλμα' }, { status: 500 });
    }
}