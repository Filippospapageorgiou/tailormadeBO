// User related types
export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  image_url: string;
  created_at: string;
  updated_at: string;
}


export interface AuthUser {
  id: string;
  email: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
}

export interface BlogPost { 
  id: number;
  user_id: string;
  title: string;
  description: string;
  image_urls: string[];
  tags: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}


export interface Session {
  user: AuthUser | null;
  expires_at?: number;
}



export interface Ingredient {
  id: number;
  name: string;
  category?: string;
  description?: string;
  measurement_unit?: string;
  recipe_ingredients: { count: number }[]; 
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: number;
  beverage_id: number;
  ingredient_id: number;
  quantity: number;
  notes?: string;
  ingredients: Pick<Ingredient, 'name' | 'measurement_unit'>;
  created_at: string;
  updated_at: string;
}

export interface Beverage {
  id: number;
  name: string;
  description: string;
  execution: string | null,
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Page Data types
export interface PageData {
  session?: Session | null;
  user?: User | null;
  beverages?: Beverage[];
}

// Τύπος για τα form data
export interface SignUpFormData {
  email: string;
  password: string;
  username?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Προσθέστε αυτό στο database.types.ts
export interface SettingsPageData {
  ingredients: Ingredient[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  categories: string[];
  units: string[];
}

export interface Blog {
  id: number;
  title: string;
  description : string | null;
  content: string
  images: any;
  tags: string[];
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogRead {
  id: number;
  user_id: string;
  blog_id: string;
  read_at: string;
}

export interface CreateBlogData {
  title: string;
  description?: string | null;
  content: string;
  images?: Record<string, any>;
  tags?: string[];
  author_id: string | null;
  published?: boolean;
}

export interface UpdateBlogData {
  title?: string;
  description?: string | null;
  content?: string;
  images?: Record<string, any>; 
  tags?: string[];
  published?: boolean;
}


export interface BlogPageData {
  blogs: Blog[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  tags?: string[]; 
}


export interface BlogWithAuthor extends Blog {
  author: {
    username: string;
    image_url: string | null;
  }
}