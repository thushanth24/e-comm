import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    minPrice?: string;
    maxPrice?: string;
  };
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  
  return category;
}

async function getProductsByCategory(categoryId: number, minPrice?: number, maxPrice?: number) {
  const whereClause: any = {
    categoryId,
  };
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    
    if (minPrice !== undefined) {
      whereClause.price.gte = minPrice;
    }
    
    if (maxPrice !== undefined) {
      whereClause.price.lte = maxPrice;
    }
  }
  
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return products;
}

export async function generateMetadata({ params }: PageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found',
    };
  }
  
  return {
    title: `${category.name} - StyleStore`,
    description: `Browse our collection of ${category.name.toLowerCase()} clothing and accessories.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    notFound();
  }
  
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  
  const products = await getProductsByCategory(category.id, minPrice, maxPrice);
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="space-y-8">
          <PriceRangeFilter />
        </div>
        
        {/* Product Listing */}
        <div className="md:col-span-3">
          <ProductList 
            products={products} 
            emptyMessage="No products found in this category"
          />
        </div>
      </div>
    </div>
  );
}
