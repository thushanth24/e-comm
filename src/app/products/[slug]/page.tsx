import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import ProductList from '@/components/ui/ProductList';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
    },
  });
  
  return product;
}

async function getRelatedProducts(categoryId: number, productId: number) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    include: {
      images: true,
    },
    take: 4,
  });
  
  return products;
}

export async function generateMetadata({ params }: PageProps) {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found',
    };
  }
  
  return {
    title: `${product.name} - StyleStore`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  
  if (!product) {
    notFound();
  }
  
  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  
  return (
    <div className="container-custom py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          Home
        </Link>
        {' '}/{' '}
        <Link href={`/categories/${product.category.slug}`} className="text-sm text-muted-foreground hover:text-primary">
          {product.category.name}
        </Link>
        {' '}/{' '}
        <span className="text-sm font-medium">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div 
                      key={image.id} 
                      className="aspect-square relative rounded-md overflow-hidden cursor-pointer border hover:border-primary"
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} image ${index + 1}`}
                        fill
                        sizes="25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              <Link 
                href={`/categories/${product.category.slug}`}
                className="text-sm font-medium px-2 py-1 bg-muted rounded-md hover:bg-muted/80"
              >
                {product.category.name}
              </Link>
            </div>
          </div>
          
          <div className="text-2xl font-bold">{formatPrice(product.price)}</div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Availability:</span>
              {product.inventory > 0 ? (
                <span className="text-green-600 dark:text-green-400">
                  In Stock ({product.inventory} {product.inventory === 1 ? 'item' : 'items'} left)
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Out of Stock</span>
              )}
            </div>
          </div>
          
          <div className="pt-6">
            <button 
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.inventory === 0}
            >
              {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <ProductList products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
