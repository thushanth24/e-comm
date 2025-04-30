import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';

interface PageProps {
  searchParams: {
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

async function searchProducts(params: PageProps['searchParams']) {
  const { query, category, minPrice, maxPrice } = params;
  
  const whereClause: any = {};
  
  // Search query
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }
  
  // Category filter
  if (category) {
    whereClause.category = {
      slug: category,
    };
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    whereClause.price = {};
    
    if (minPrice) {
      whereClause.price.gte = parseFloat(minPrice);
    }
    
    if (maxPrice) {
      whereClause.price.lte = parseFloat(maxPrice);
    }
  }
  
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return products;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { query, category } = searchParams;
  
  let title = 'Search Products';
  if (query) {
    title = `Search: ${query}`;
  } else if (category) {
    title = `Category: ${category}`;
  }
  
  return {
    title: `${title} - StyleStore`,
    description: 'Search for clothing and accessories at StyleStore',
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const [products, categories] = await Promise.all([
    searchProducts(searchParams),
    getCategories(),
  ]);
  
  const { query, category } = searchParams;
  
  let title = 'All Products';
  if (query) {
    title = `Search Results for "${query}"`;
  } else if (category) {
    const categoryName = categories.find(c => c.slug === category)?.name || category;
    title = `${categoryName} Products`;
  }
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="space-y-8">
          {/* Category Filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Categories</h3>
            <div className="space-y-2">
              <div>
                <a 
                  href="/search" 
                  className={`block px-2 py-1 rounded-md hover:bg-muted ${
                    !category ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  All Categories
                </a>
              </div>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <a 
                    href={`/search?category=${cat.slug}${query ? `&query=${query}` : ''}`}
                    className={`block px-2 py-1 rounded-md hover:bg-muted ${
                      category === cat.slug ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {cat.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          <PriceRangeFilter />
        </div>
        
        {/* Product Listing */}
        <div className="md:col-span-3">
          <ProductList 
            products={products} 
            emptyMessage="No products match your search criteria"
          />
        </div>
      </div>
    </div>
  );
}
