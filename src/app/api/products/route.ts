import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';

// GET all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const limit = searchParams.get('limit');
    
    // Build filter conditions
    const where: any = {};
    
    if (category) {
      where.category = {
        slug: category,
      };
    }
    
    if (featured === 'true') {
      where.featured = true;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    // Query products
    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit ? { take: parseInt(limit) } : {}),
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error fetching products' },
      { status: 500 }
    );
  }
}

// POST create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 Incoming product data:', body);

    // ✅ Normalize image data to just an array of URL strings
    const normalizedBody = {
      ...body,
      images: body.images.map((img: any) => typeof img === 'string' ? img : img.url),
    };

    // ✅ Validate normalized data
    const validatedData = productSchema.parse(normalizedBody);

    // ✅ Check for existing slug
    const existingProductSlug = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProductSlug) {
      return NextResponse.json(
        { message: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    // ✅ Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 400 }
      );
    }

    // ✅ Create product
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: validatedData.price,
        inventory: validatedData.inventory,
        featured: validatedData.featured || false,
        categoryId: validatedData.categoryId,
        images: {
          create: validatedData.images.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Zod validation error:', error.errors);
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      { message: 'Error creating product' },
      { status: 500 }
    );
  }
}


