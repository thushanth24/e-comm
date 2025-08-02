import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: CategoryNode[];
  _count: {
    products: number;
  };
}

// Recursive function to build category tree
async function buildCategoryTree(parentId: number | null = null): Promise<CategoryNode[]> {
  const categories = await prisma.category.findMany({
    where: { parentId },
    include: {
      _count: { select: { products: true } },
    },
  });

  const tree = [];
  
  for (const category of categories) {
    const children = await buildCategoryTree(category.id);
    tree.push({
      ...category,
      children: children.length > 0 ? children : undefined,
    });
  }

  return tree;
}

// GET all categories as a tree
export async function GET() {
  try {
    const categories = await buildCategoryTree(null);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Error fetching categories' },
      { status: 500 }
    );
  }
}

// POST create a new category
// POST create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body (this validates name and slug)
    const validatedData = categorySchema.parse(body);

    // Check if slug is unique
    const existingCategorySlug = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategorySlug) {
      return NextResponse.json(
        { message: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // ✅ Create new category with optional parentId
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        parentId: body.parentId ?? null, // <-- 🔥 this was missing
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error creating category' },
      { status: 500 }
    );
  }
}

