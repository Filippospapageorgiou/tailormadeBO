import type { PageServerLoad } from './$types';
import type { Blog, CreateBlogData, UpdateBlogData } from '$lib/types/database.types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select(`
      *,
      users!blogs_author_id_fkey (
        username,
        image_url
      )
    `)
    .order('created_at', { ascending: false })
    .returns<Blog[]>();

  if (blogsError) {
    console.error('Error fetching blogs:', blogsError);
    return { blogs: [], totalBlogs: 0 };
  }

  return {
    blogs: blogs ?? [],
    totalBlogs: blogs?.length ?? 0
  };
};

export const actions: Actions = {
  createBlog: async ({ request, locals: { supabase, user } }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || null;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const published = formData.get('published') === 'true';

    if (!title || !content) {
      return fail(400, {
        message: 'Ο τίτλος και το περιεχόμενο είναι υποχρεωτικά',
        invalid: true,
        values: { title, description, content, tags, published }
      });
    }

    const tagsArray = tags 
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
      : [];

    const blogData: CreateBlogData = {
      title,
      description,
      content,
      tags: tagsArray,
      author_id: user?.id || null,
      published
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select();

    

    if (error) {
      console.error('Error creating blog post:', error);
      return fail(500, {
        message: 'Αποτυχία δημιουργίας blog post',
        invalid: true,
        values: { title, description, content, tags, published }
      });
    }

    return {
      success: true,
      message: "Το blog post δημιουργήθηκε επιτυχώς",
      data
    };
  },

  updateBlog: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || null;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const published = formData.get('published') === 'true';

    if (!id || !title || !content) {
      return fail(400, {
        message: 'Το ID, ο τίτλος και το περιεχόμενο είναι υποχρεωτικά',
        invalid: true,
        values: { id, title, description, content, tags, published }
      });
    }

    const tagsArray = tags 
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
      : [];

    const blogData: UpdateBlogData = {
      title,
      description,
      content,
      tags: tagsArray,
      published
    };

    const { data, error } = await supabase
      .from('blogs')
      .update(blogData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating blog post:', error);
      return fail(500, {
        message: 'Αποτυχία ενημέρωσης blog post',
        invalid: true,
        values: { id, title, description, content, tags, published }
      });
    }

    return {
      success: true,
      message: "Το blog post ενημερώθηκε επιτυχώς",
      data
    };
  },

  deleteBlog: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return fail(400, { message: 'ID is required' });
    }

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return fail(500, { message: 'Failed to delete blog post' });
    }

    return { success: true };
  }
};