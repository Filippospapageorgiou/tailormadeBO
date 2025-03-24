// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import type { BlogWithAuthor } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  // Αν δεν υπάρχει συνδεδεμένος χρήστης, δεν χρειάζεται να ελέγξουμε για μη αναγνωσμένα άρθρα
  if (!user) {
    return {
      unreadBlogs: []
    };
  }

  try {
    // 1. Παίρνουμε τα πιο πρόσφατα δημοσιευμένα blogs
    const { data: allBlogs, error: blogsError } = await supabase
      .from('blogs')
      .select(`
        id,
        title,
        description,
        images,
        created_at,
        author:users!blogs_author_id_fkey (
          username,
          image_url
        )
      `)
      .eq('published', true) // Μόνο δημοσιευμένα blogs
      .order('created_at', { ascending: false }) // Πιο πρόσφατα πρώτα
      .limit(20) // Περιορίζουμε στα 20 πιο πρόσφατα για απόδοση
      .returns<BlogWithAuthor[]>();

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
      return { unreadBlogs: [] };
    }

    // 2. Παίρνουμε τα blog IDs που έχει διαβάσει ο χρήστης
    const { data: readBlogIds, error: readsError } = await supabase
      .from('blog_reads')
      .select('blog_id')
      .eq('user_id', user.id);

    if (readsError) {
      console.error('Error fetching read blogs:', readsError);
      return { unreadBlogs: [] };
    }

    // Δημιουργούμε ένα Set με τα IDs των blogs που έχει διαβάσει ο χρήστης
    const readBlogIdSet = new Set(readBlogIds.map(item => item.blog_id));

    // 3. Φιλτράρουμε τα blogs που δεν έχει διαβάσει ο χρήστης
    const unreadBlogs = allBlogs.filter(blog => !readBlogIdSet.has(blog.id));

    // 4. Περιορίζουμε στα 5 πιο πρόσφατα μη αναγνωσμένα
    const limitedUnreadBlogs = unreadBlogs.slice(0, 5);

    let userAccepted:boolean = false;
    const { data:AcceptedTerms, error:AcceptedTermsError } = await supabase
      .from("user_term_acceptance")
      .select("*")
      .eq("user_id",user.id);

    if(AcceptedTermsError){
      console.error('Error fetching read blogs:', readsError);
      return { userAccepted };
    }

    if(AcceptedTerms.length > 0){
      userAccepted = true;
    }


    return {
      unreadBlogs: limitedUnreadBlogs,
      userAccepted: userAccepted
    };
  } catch (error) {
    console.error('Error loading data to landing page', error);
    return {
      unreadBlogs: []
    };
  }
};