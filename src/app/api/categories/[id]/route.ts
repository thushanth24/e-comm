import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a single category by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
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
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = categorySchema.parse(body);
    
    // Check if slug is unique (if different from current)
    if (validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { message: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
      },
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error updating category' },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category with associated products. Please remove or reassign all products first.' },
        { status: 400 }
      );
    }
    
    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });
    
    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Error deleting category' },
      { status: 500 }
    );
  }
}
