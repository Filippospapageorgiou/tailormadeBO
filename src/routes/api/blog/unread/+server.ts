import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { BlogWithAuthor } from '$lib/types/database.types';

export const GET: RequestHandler = async ({ url, locals: { supabase, user } }) => {
    if (!user) {
        return json({ blogs: [], count: 0 }, { status: 401 });
    }
    
    try{
        const limitParam = url.searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 5;

        // 1. Πρώτα παίρνουμε όλα τα δημοσιευμένα blogs με τις πληροφορίες συγγραφέα
        const { data: allBlogs, error: blogsError } = await supabase
            .from('blogs')
            .select(`
                id,
                title,
                description,
                images,
                created_at,
                published,
                author:users!blogs_author_id_fkey (
                    username,
                    image_url
                )
            `)
            .eq('published', true) // Μόνο δημοσιευμένα blogs
            .order('created_at', { ascending: false }) // Πιο πρόσφατα πρώτα
            .limit(50) // Περιορίζουμε στα 50 πιο πρόσφατα για απόδοση
            .returns<BlogWithAuthor[]>();

        if (blogsError) {
            console.error('Error fetching blogs:', blogsError);
            return json({ blogs: [], count: 0 }, { status: 500 });
        }

        // 2. Παίρνουμε τα blog IDs που έχει διαβάσει ο χρήστης
        const { data: readBlogIds, error: readsError } = await supabase
            .from('blog_reads')
            .select('blog_id')
            .eq('user_id', user.id);

        if (readsError) {
            console.error('Error fetching read blogs:', readsError);
            return json({ blogs: [], count: 0 }, { status: 500 });
        }

        const readBlogIdSet  = new Set(readBlogIds.map(iteam => iteam.blog_id));

        const unreadBlogs = allBlogs.filter(blog => !readBlogIdSet.has(blog.id));

        const limitedUnreadBlogs = unreadBlogs.slice(0, limit);

        return json({
            blogs: limitedUnreadBlogs,
            count: unreadBlogs.length
        });

    }catch(error){
        console.error('Unexpected error:', error);
        return json({ blogs: [], count: 0 }, { status: 500 });
    }
    
};