import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { categorySchema } from '@/lib/validations';

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular client for read operations
import { supabase } from '@/lib/supabase';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// GET a single category by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const categoryId = parseInt((await params).id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Get category
    const { data: category, error: fetchError } = await supabase
      .from('category')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }
    
    // Get product count
    const { count: productsCount } = await supabase
      .from('Product')
      .select('*', { count: 'exact', head: true })
      .eq('categoryId', categoryId);
    
    return NextResponse.json({
      ...category,
      products_count: productsCount || 0
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { message: 'Error fetching category' },
      { status: 500 }
    );
  }
}

// PATCH update a category
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const categoryId = parseInt((await params).id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('category')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = categorySchema.parse(body);
    
    // Check if slug is unique (if different from current)
    if (validatedData.slug !== existingCategory.slug) {
      const { data: slugExists, error: slugError } = await supabase
        .from('category')
        .select('id')
        .eq('slug', validatedData.slug)
        .single();
      
      if (slugError && slugError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw slugError;
      }
      
      if (slugExists) {
        return NextResponse.json(
          { message: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update category using admin client to bypass RLS
    const { data: updatedCategory, error: updateError } = await supabaseAdmin
      .from('category')
      .update({
        name: validatedData.name,
        slug: validatedData.slug,
        parentId: body.parentId ?? existingCategory.parentId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating category:', updateError);
      throw new Error('Error updating category');
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error in categories PATCH:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error updating category' },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const categoryId = parseInt((await params).id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const { data: category, error: fetchError } = await supabase
      .from('category')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }
    
    // Check if category has products
    const { count: productsCount } = await supabase
      .from('Product')
      .select('*', { count: 'exact', head: true })
      .eq('categoryId', categoryId);
    
    if ((productsCount || 0) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete a category that has products' },
        { status: 400 }
      );
    }
    
    // Check if category has children
    const { count: childCategoriesCount } = await supabase
      .from('category')
      .select('*', { count: 'exact', head: true })
      .eq('parentId', categoryId);
    
    if ((childCategoriesCount || 0) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete a category that has subcategories' },
        { status: 400 }
      );
    }
    
    // Delete the category using admin client to bypass RLS
    const { error: deleteError } = await supabaseAdmin
      .from('category')
      .delete()
      .eq('id', categoryId);
    
    if (deleteError) {
      console.error('Error deleting category:', deleteError);
      throw new Error('Error deleting category');
    }
    
    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in categories DELETE:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error deleting category' },
      { status: 500 }
    );
  }
}
