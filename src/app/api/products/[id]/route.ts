import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
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
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: true,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product' },
      { status: 500 }
    );
  }
}

// PATCH update a product
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

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // ✅ Normalize images to string[] in case they are objects
    const normalizedBody = {
      ...body,
      images: body.images.map((img: any) => typeof img === 'string' ? img : img.url),
    };

    const validatedData = productSchema.parse(normalizedBody);

    if (validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { message: 'A product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.productImage.deleteMany({
        where: { productId },
      });

      return tx.product.update({
        where: { id: productId },
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          price: validatedData.price,
          inventory: validatedData.inventory,
          featured: validatedData.featured,
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
    });

    return NextResponse.json(updatedProduct);

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
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product (images will be cascade deleted)
    await prisma.product.delete({
      where: { id: productId },
    });
    
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
