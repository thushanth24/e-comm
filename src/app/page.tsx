import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import CategoryCard from '@/components/ui/CategoryCard';
import { ShoppingBag, Package, Award, CreditCard, TrendingUp, ArrowRight, Clock, Tag, ChevronRight } from 'lucide-react';

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      featured: true,
    },
    include: {
      images: true,
    },
    take: 4,
  });
  
  return products;
}

async function getNewArrivals() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      images: true,
    },
    take: 8,
  });
  
  return products;
}

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

export default async function Home() {
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <main>
     {/* Hero Section - Slider */}
    <section className="relative overflow-hidden bg-black">
  <div className="relative h-[600px] md:h-[700px]">
    <Image
      src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop"
      alt="Fashion Collection"
      fill
      priority
      className="object-cover object-center"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent flex items-center">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-4">
            Limited Time Offer
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Summer Sale <span className="text-red-500">50% Off</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-lg">
            Shop the latest trends and styles with our exclusive seasonal collection.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/categories/womens" 
              className="inline-flex items-center px-8 py-3 bg-red-600 text-white font-medium text-sm rounded-md hover:bg-red-700 transition-all shadow-sm"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shop Now
            </Link>
            <Link 
              href="/search" 
              className="inline-flex items-center px-8 py-3 border border-white/30 text-white font-medium text-sm rounded-md hover:bg-white/10 transition-all"
            >
              View Collections
            </Link>
          </div>

          {/* Countdown Timer */}
          <div className="mt-10 flex items-center space-x-6">
            <div className="flex items-center text-white">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Offer ends in:</span>
            </div>
            <div className="flex space-x-2">
              {['02', '18', '45', '33'].map((time, i) => (
                <div key={i} className="bg-red-600 text-white w-10 h-10 rounded-md flex items-center justify-center font-semibold shadow-md">
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Top Categories Slider - Horizontal Scroll */}
      <section className="py-6 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center overflow-x-auto space-x-6 pb-2">
            <Link href="/categories/mens" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Men</Link>
            <Link href="/categories/womens" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Women</Link>
            <Link href="/categories/kids" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Kids</Link>
            <Link href="/search?filter=new" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">New Arrivals</Link>
            <Link href="/search?filter=sale" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Sale</Link>
            <Link href="/search?filter=trending" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Trending</Link>
            <Link href="/search?category=footwear" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Footwear</Link>
            <Link href="/search?category=accessories" className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">Accessories</Link>
          </div>
        </div>
      </section>

      <div className="container-custom py-10">
        {/* Featured Benefits */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-md">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Free Shipping</h3>
                <p className="text-xs text-gray-600">On all orders over $50</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-md">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Payment</h3>
                <p className="text-xs text-gray-600">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-md">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Award className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quality Products</h3>
                <p className="text-xs text-gray-600">Crafted with premium materials</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-md">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Tag className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Big Discounts</h3>
                <p className="text-xs text-gray-600">Save up to 70% off</p>
              </div>
            </div>
          </div>
        </section>

        {/* Flash Sale Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">Flash Sale</h2>
              <div className="ml-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">HOT</div>
            </div>
            <Link href="/search?sale=flash" className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-md overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={product.images?.length > 0 ? product.images[0].url : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">-30%</div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-red-600 font-bold">${(product.price * 0.7).toFixed(2)}</p>
                      <p className="text-gray-400 text-xs line-through">${product.price.toFixed(2)}</p>
                    </div>
                    <button className="bg-red-100 p-1 rounded text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop By Category</h2>
            <Link 
              href="/search" 
              className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={{
                    name: category.name,
                    slug: category.slug,
                  }}
                />
              ))
            ) : (
              // Default categories if none exist in the database
              ['Mens', 'Womens', 'Kids', 'Accessories'].map((name) => (
                <CategoryCard 
                  key={name} 
                  category={{
                    name,
                    slug: name.toLowerCase(),
                  }}
                />
              ))
            )}
          </div>
        </section>

        {/* Promotional Banners */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative h-[200px] overflow-hidden rounded-md">
              <Image
                src="https://images.unsplash.com/photo-1550246140-29f40b909e5a?w=800&auto=format&fit=crop"
                alt="Men's Collection"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8">
                <div className="p-1 bg-red-600 text-white text-xs w-fit mb-2">TRENDING</div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Men's Fashion
                </h2>
                <p className="text-white text-sm mb-4 max-w-sm">
                  New arrivals for summer
                </p>
                <Link 
                  href="/categories/mens" 
                  className="bg-white text-gray-900 px-4 py-1.5 rounded w-fit hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="relative h-[200px] overflow-hidden rounded-md">
              <Image
                src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop"
                alt="Women's Collection"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8">
                <div className="p-1 bg-red-600 text-white text-xs w-fit mb-2">SPECIAL OFFER</div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Women's Collection
                </h2>
                <p className="text-white text-sm mb-4 max-w-sm">
                  Get 20% off on new arrivals
                </p>
                <Link 
                  href="/categories/womens" 
                  className="bg-white text-gray-900 px-4 py-1.5 rounded w-fit hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link 
              href="/search" 
              className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <Suspense fallback={<div className="text-center py-10">Loading featured products...</div>}>
            <ProductList 
              products={featuredProducts}
              emptyMessage="No featured products yet"
            />
          </Suspense>
        </section>

        {/* Brand Strip */}
        <section className="mb-16 py-8 bg-gray-100 -mx-4 px-4 rounded-md">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Popular Brands</h2>
            <p className="text-gray-600 text-sm">Top brands with amazing offers</p>
          </div>
          <div className="flex justify-between items-center">
            {['Nike', 'Adidas', 'Puma', 'Reebok', 'Gucci', 'Zara'].map((brand) => (
              <div key={brand} className="text-center">
                <div className="bg-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="font-bold text-gray-800">{brand.charAt(0)}</span>
                </div>
                <p className="text-sm font-medium">{brand}</p>
              </div>
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <Link 
              href="/search" 
              className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <Suspense fallback={<div className="text-center py-10">Loading new arrivals...</div>}>
            <ProductList 
              products={newArrivals}
              emptyMessage="No new products available"
            />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
