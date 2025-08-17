import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase-client';
import { productSchema } from '@/lib/validations';

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

// GET a single product by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const productId = parseInt((await params).id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('Product')
      .select(`
        *,
        ProductImage(*),
        categories!inner(id, name, slug)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { message: 'Error fetching product' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Format the response to match the expected format
    const formattedProduct = {
      ...product,
      category: product.categories,
      images: product.ProductImage || []
    };

    // Remove the categories property to avoid confusion
    delete formattedProduct.categories;
    delete formattedProduct.ProductImage;

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update a product
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const productId = parseInt((await params).id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('Product')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Normalize images to string[] in case they are objects
    const normalizedBody = {
      ...body,
      images: body.images.map((img: any) => typeof img === 'string' ? img : img.url),
    };

    const validatedData = productSchema.parse(normalizedBody);

    // Check if slug is being changed and if new slug already exists
    if (validatedData.slug !== existingProduct.slug) {
      const { data: slugExists, error: slugError } = await supabase
        .from('Product')
        .select('id')
        .eq('slug', validatedData.slug)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { message: 'A product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Start a transaction
    const { data: updatedProduct, error: updateError } = await supabase
      .rpc('update_product_with_images', {
        p_id: productId,
        p_name: validatedData.name,
        p_slug: validatedData.slug,
        p_description: validatedData.description,
        p_price: validatedData.price,
        p_inventory: validatedData.inventory,
        p_featured: validatedData.featured,
        categoryId: validatedData.categoryId,
        p_images: validatedData.images
      });

    if (updateError) {
      console.error('Error updating product:', updateError);
      throw updateError;
    }

    // Fetch the updated product with its images and category
    const { data: fullProduct, error: fetchUpdatedError } = await supabase
      .from('Product')
      .select(`
        *,
        ProductImage(*),
        categories!inner(*)
      `)
      .eq('id', productId)
      .single();

    if (fetchUpdatedError || !fullProduct) {
      console.error('Error fetching updated product:', fetchUpdatedError);
      throw new Error('Failed to fetch updated product');
    }

    // Format the response
    const formattedProduct = {
      ...fullProduct,
      category: fullProduct.categories,
images: fullProduct.ProductImage || []
    };

    delete formattedProduct.categories;
    delete formattedProduct.ProductImage;

    return NextResponse.json(formattedProduct);

  } catch (error) {
    console.error('Error updating product:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error updating product' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const productId = parseInt((await params).id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('Product')
      .select('id')
      .eq('id', productId)
      .single();
    
    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product (foreign key constraint will handle the images)
    const { error: deleteError } = await supabase
      .from('Product')
      .delete()
      .eq('id', productId);
    
    if (deleteError) throw deleteError;
    
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Error deleting product' },
      { status: 500 }
    );
  }
}
