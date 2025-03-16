import type { PageServerLoad } from './$types';
import type { Blog, BlogWithAuthor } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:users!blogs_author_id_fkey (
        username,
        image_url
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .returns<BlogWithAuthor[]>();

  if (error) {
    console.error('Error fetching blogs:', error);
    return { blogs: [] };
  }

  return {
    blogs: blogs || []
  };
};