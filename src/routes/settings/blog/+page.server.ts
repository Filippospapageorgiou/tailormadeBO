import type { PageServerLoad } from './$types';
import type { Blog, CreateBlogData, UpdateBlogData } from '$lib/types/database.types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { v4 as uuidv4 } from 'uuid'; // Προσθέστε αυτό στις εξαρτήσεις αν δεν υπάρχει ήδη

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

  const processedBlogs = blogs?.map(blog => {
    return {
      ...blog,
      images: Array.isArray(blog.images) ? blog.images : []
    };
  }) || [];

  return {
    blogs: processedBlogs,
    totalBlogs: processedBlogs.length
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

    // Διαχείριση εικόνων
    const uploadedImages: string[] = [];
    
    // Συλλογή όλων των αρχείων εικόνων από το FormData
    const imageFiles: { file: File, index: number }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        const index = parseInt(key.split('_')[1]);
        imageFiles.push({ file: value, index });
      }
    }
    
    // Ταξινόμηση βάσει του index για να διατηρήσουμε τη σειρά
    imageFiles.sort((a, b) => a.index - b.index);
    
    // Ανέβασμα των εικόνων στο storage
    for (const { file } of imageFiles) {
      if (file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('blog_images')
          .upload(filePath, file);
        
        if (error) {
          console.error('Error uploading image:', error);
          continue; // Συνεχίζουμε με την επόμενη εικόνα σε περίπτωση σφάλματος
        }
        
        // Δημιουργία του URL για την εικόνα
        const { data: urlData } = supabase.storage
          .from('blog_images')
          .getPublicUrl(filePath);
        
        if (urlData?.publicUrl) {
          uploadedImages.push(urlData.publicUrl);
        }
      }
    }
    
    const blogData: CreateBlogData = {
      title,
      description,
      content,
      tags: tagsArray,
      author_id: user?.id || null,
      published,
      images: uploadedImages
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

  updateBlog: async ({ request, locals: { supabase, user } }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || null;
    const content = formData.get('content') as string;
    const tags = formData.get('tags') as string;
    const published = formData.get('published') === 'true';
    const existingImagesJson = formData.get('existingImages') as string || '[]';
    let existingImages: string[] = [];
    
    try {
      existingImages = JSON.parse(existingImagesJson);
    } catch (e) {
      console.error('Error parsing existing images JSON:', e);
      existingImages = [];
    }

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

    // Διαχείριση νέων εικόνων
    const uploadedImages: string[] = [...existingImages]; // Ξεκινάμε με τις υπάρχουσες εικόνες
    
    // Συλλογή όλων των αρχείων εικόνων από το FormData
    const imageFiles: { file: File, index: number }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        const index = parseInt(key.split('_')[1]);
        imageFiles.push({ file: value, index });
      }
    }
    
    // Ταξινόμηση βάσει του index για να διατηρήσουμε τη σειρά
    imageFiles.sort((a, b) => a.index - b.index);
    
    // Ανέβασμα των νέων εικόνων στο storage
    for (const { file } of imageFiles) {
      if (file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('blog_images')
          .upload(filePath, file);
        
        if (error) {
          console.error('Error uploading image:', error);
          continue; // Συνεχίζουμε με την επόμενη εικόνα σε περίπτωση σφάλματος
        }
        
        // Δημιουργία του URL για την εικόνα
        const { data: urlData } = supabase.storage
          .from('blog_images')
          .getPublicUrl(filePath);
        
        if (urlData?.publicUrl) {
          uploadedImages.push(urlData.publicUrl);
        }
      }
    }
    
    // Εύρεση εικόνων που αφαιρέθηκαν
    const { data: currentBlog } = await supabase
      .from('blogs')
      .select('images')
      .eq('id', id)
      .single();
      
    const currentImages = currentBlog?.images || [];
    
    // Βρίσκουμε εικόνες που έχουν αφαιρεθεί για να τις διαγράψουμε από το storage
    const removedImages: string[] = currentImages.filter((url: string) => !existingImages.includes(url));
    
    // Διαγραφή των εικόνων που αφαιρέθηκαν από το storage
    for (const url of removedImages) {
      try {
        // Εξαγωγή του path από το URL
        const pathMatch = url.match(/\/blog_images\/([^?]+)/);
        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);
          
          const { error } = await supabase.storage
            .from('blog_images')
            .remove([filePath]);
            
          if (error) {
            console.error('Error removing image:', error);
          }
        }
      } catch (e) {
        console.error('Error parsing image URL for deletion:', e);
      }
    }

    const blogData: UpdateBlogData = {
      title,
      description,
      content,
      tags: tagsArray,
      published,
      images: uploadedImages
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
    
    // Πρώτα παίρνουμε τις εικόνες του blog για να τις διαγράψουμε από το storage
    const { data: blog, error: fetchError } = await supabase
      .from('blogs')
      .select('images')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching blog for deletion:', fetchError);
    } else if (blog && blog.images && blog.images.length > 0) {
      // Διαγραφή των εικόνων από το storage
      for (const url of blog.images) {
        try {
          // Εξαγωγή του path από το URL
          const pathMatch = url.match(/\/blog_images\/([^?]+)/);
          if (pathMatch && pathMatch[1]) {
            const filePath = decodeURIComponent(pathMatch[1]);
            
            const { error } = await supabase.storage
              .from('blog_images')
              .remove([filePath]);
              
            if (error) {
              console.error('Error removing image during blog deletion:', error);
            }
          }
        } catch (e) {
          console.error('Error parsing image URL for deletion during blog deletion:', e);
        }
      }
    }

    // Τώρα διαγράφουμε το blog από τη βάση δεδομένων
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