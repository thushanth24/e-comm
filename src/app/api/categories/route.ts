import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { categorySchema } from '@/lib/validations';

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Use the non-public service role key for server-side operations
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular client for read operations
import { supabase } from '@/lib/supabase';

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: CategoryNode[];
  products_count?: number;
}

// Recursive function to build category tree
async function buildCategoryTree(parentId: string | null = null): Promise<CategoryNode[]> {
  console.log('Building category tree for parentId:', parentId);
  
  // Use double quotes around the table name to match the exact case in the database
  let query = supabase
    .from('"Category"')
    .select('*')
    .order('name', { ascending: true });

  // Handle null parentId (top-level categories)
  if (parentId === null) {
    console.log('Fetching top-level categories');
    query = query.is('"parentId"', null);
  } else {
    console.log('Fetching child categories for parent:', parentId);
    query = query.eq('"parentId"', parentId);
  }

  console.log('Executing query for parentId:', parentId);
  const { data: categories, error } = await query;
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  console.log(`Found ${categories?.length || 0} categories for parentId:`, parentId);

  if (!categories || categories.length === 0) {
    return [];
  }

  const tree: CategoryNode[] = [];
  
  for (const category of categories) {
    try {
      // Get product count for this category
      const { count: productsCount, error: countError } = await supabase
        .from('product')
        .select('*', { count: 'exact', head: true })
        .eq('categoryId', category.id);

      if (countError) {
        console.error('Error counting products for category', category.id, countError);
      }

      // Convert category.id to string for consistent type handling
      const categoryId = category.id.toString();
      const children = await buildCategoryTree(categoryId);
      
      tree.push({
        ...category,
        id: parseInt(categoryId, 10), // Ensure ID is a number in the response
        children: children.length > 0 ? children : undefined,
        products_count: productsCount || 0
      });
    } catch (err) {
      console.error('Error processing category', category.id, err);
    }
  }

  return tree;
}

// GET all categories as a tree
export async function GET() {
  try {
    console.log('Fetching categories...');
    
    // Use a direct SQL query to avoid case sensitivity issues with the query builder
    const { data: allCategories, error: directError } = await supabaseAdmin.rpc('get_all_categories');

    if (directError) {
      console.error('Direct query error:', directError);
      throw directError;
    }
    
    console.log(`Direct query successful. Found ${allCategories?.length || 0} categories.`);
    
    if (!allCategories || allCategories.length === 0) {
      console.warn('No categories found in the database.');
      return NextResponse.json([], { status: 200 });
    }
    
    // Build the category tree from the flat list
    const buildTree = (parentId: number | null = null): CategoryNode[] => {
      return allCategories
        .filter((cat: CategoryNode) => (parentId === null && !cat.parentId) || cat.parentId === parentId)
        .map((category: CategoryNode) => ({
          ...category,
          children: buildTree(category.id)
        }));
    };
    
    const categoryTree = buildTree();
    console.log(`Successfully built category tree with ${categoryTree.length} root categories`);
    
    return NextResponse.json(categoryTree);
    
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body (this validates name and slug)
    const validatedData = categorySchema.parse(body);

    // Check if slug is unique using the database function
    const { data: existingCategoryJson, error: slugError } = await supabase.rpc('check_category_slug', {
      p_slug: validatedData.slug
    });

    if (slugError) {
      console.error('Error checking for existing slug:', slugError);
      throw new Error('Error checking for existing category');
    }

    const existingCategory = existingCategoryJson && existingCategoryJson !== 'null' ? JSON.parse(existingCategoryJson) : null;

    if (existingCategory) {
      return NextResponse.json(
        { message: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Create new category using raw SQL to avoid case sensitivity issues
    const { data: category, error: insertError } = await supabaseAdmin.rpc('create_category', {
      p_name: validatedData.name,
      p_slug: validatedData.slug,
      p_parent_id: body.parentId ? parseInt(body.parentId, 10) : null
    });

    if (insertError) {
      console.error('Error creating category:', insertError);
      throw new Error('Error creating category');
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error in categories POST:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error creating category' },
      { status: 500 }
    );
  }
}

