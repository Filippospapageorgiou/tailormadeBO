import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: {supabase, user} }) => {
    if(!user){
        return json({ success: false, message: "Unauthorized"}, {status: 401});
    }

    try{
        const { blog_id } = await request.json();

        if(!blog_id){
            return json({ success: false, message: 'Blog ID is required' }, { status: 400 });
        }

        const {data: existingRead, error: searchError } = await supabase
            .from('blog_reads')
            .select('id')
            .eq('user_id',user.id)
            .eq('blog_id',blog_id)
            .maybeSingle();

        if (searchError) {
            console.error('Error checking for existing read:', searchError);
            return json({ success: false, message: 'Error checking read status' }, { status: 500 });
        }

        const now = new Date().toISOString();

        if (existingRead) {
            const { error: updateError } = await supabase
                .from('blog_reads')
                .update({ read_at: now })
                .eq('id', existingRead.id);

            if (updateError) {
                console.error('Error updating read timestamp:', updateError);
                return json({ success: false, message: 'Error updating read status' }, { status: 500 });
            }

            return json({ success: true, updated: true });
        } else {
            const { error: insertError } = await supabase
                .from('blog_reads')
                .insert([{ user_id: user.id, blog_id, read_at: now }]);

            if (insertError) {
                console.error('Error inserting new read:', insertError);
                return json({ success: false, message: 'Error recording read status' }, { status: 500 });
            }

            return json({ success: true, created: true });
        }


    }catch(error){
        console.error("Unexepected error", error);
        return json({success: false, message: 'An unexpected error occured'}, {status: 500});
    }

}