import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories } from '@/lib/supabase-client';
import ProductList from '@/components/ui/ProductList';
import { ShoppingBag, Package, Award, CreditCard, Tag, ChevronRight } from 'lucide-react';
import styles from '@/styles/Home.module.scss';
import ShopSectionsWrapper from '@/components/ShopSectionsWrapper';

// Revalidate this page every 60 seconds
export const revalidate = 60;

async function getHomePageData() {
  try {
    // Execute all database queries in parallel
    const [products, categories] = await Promise.all([
      getProducts({ limit: 12 }), // Get first 12 products for new arrivals
      getCategories()
    ]);

    // Get featured products (already filtered in the query)
    const featuredProducts = products.filter(p => p.featured).slice(0, 4);
    
    // Get new arrivals (already ordered by created_at desc from Supabase)
    const newArrivals = products.slice(0, 8);

    return {
      featuredProducts,
      newArrivals,
      categories
    };
  } catch (error) {
    console.error('Error in getHomePageData:', error);
    return {
      featuredProducts: [],
      newArrivals: [],
      categories: []
    };
  }
}

// Generate static params for better caching
export async function generateStaticParams() {
  return [{}];
}

// Revalidation functions have been moved to server actions
// Check src/app/actions/revalidate.ts for implementation

export default async function Home() {
  const { featuredProducts, newArrivals, categories } = await getHomePageData();

  return (
    <main className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&auto=format&fit=crop"
            alt="Fashion Collection"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 90vw"
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <div className={styles.heroTextWrapper}>
              <h1 className={styles.heroTitle}>
                Elevate Your Style <span>This Season</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Discover our curated selection of premium fashion essentials
              </p>
              <div className={styles.heroActions}>
                <Link href="/categories/women" className={styles.primaryBtn}>
                  <ShoppingBag className={styles.btnIcon} /> Shop Now
                </Link>
                <Link href="/categories/men" className={styles.secondaryBtn}>
                  View Collections
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Value Propositions */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.valueGrid}>
            {[
              { icon: <Package />, title: 'Free Shipping', description: 'On orders over Rs. 10,000' },
              { icon: <CreditCard />, title: 'Secure Payment', description: '100% protected' },
              { icon: <Award />, title: 'Quality Guarantee', description: 'Premium materials' },
              { icon: <Tag />, title: 'Daily Offers', description: 'Discounts up to 50%' },
            ].map((item, index) => (
              <div key={index} className={styles.valueCard}>
                <div className={styles.icon}>{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

              

      <ShopSectionsWrapper />







      {/* Featured Products */}
      <section className={styles.featuredProducts}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Featured Products</h2>
          </div>
          <Suspense fallback={<div className={styles.loading}>Loading featured products...</div>}>
            <ProductList products={featuredProducts} emptyMessage="No featured products available" />
          </Suspense>
          <Link href="/categories/men" className={styles.sectionLink}>
              View all <ChevronRight className={styles.linkIcon} />
            </Link>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className={styles.banners}>
        <div className={styles.container}>
          <div className={styles.bannerGrid}>
            <div className={styles.bannerCard}>
              <Image
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop"
                alt="Men's Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.bannerImage}
                priority
              />
              <div className={styles.bannerContent}>
                <div className={styles.bannerBadge}>New Arrivals</div>
                <h2>Men's Collection</h2>
                <p>Fresh styles for the season</p>
                <Link href="/categories/men" className={styles.bannerBtn}>
                  Shop Now
                </Link>
              </div>
            </div>
            <div className={styles.bannerCard}>
              <Image
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop"
                alt="Women's Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.bannerImage}
                priority
              />
              <div className={styles.bannerContent}>
                <div className={styles.bannerBadge}>Special Offer</div>
                <h2>Women's Collection</h2>
                <p>Up to 30% off selected items</p>
                <Link href="/categories/women" className={styles.bannerBtn}>
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className={styles.newArrivals}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>New Arrivals</h2>
           
          </div>
          <Suspense fallback={<div className={styles.loading}>Loading new arrivals...</div>}>
            <ProductList products={newArrivals} emptyMessage="No new products available" />
          </Suspense>
          <Link href="/new-arrivals" className={styles.sectionLink}>
              View all <ChevronRight className={styles.linkIcon} />
            </Link>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className={styles.brands}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <h2>Our Trusted Brands</h2>
            <p>Partnering with the best in the industry</p>
          </div>
          <div className={styles.brandGrid}>
            {["Nike", "Adidas", "Puma", "Levi's", "Tommy Hilfiger", "Calvin Klein"].map((brand) => (
              <div key={brand} className={styles.brandCard}>
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
