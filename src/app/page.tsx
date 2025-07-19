import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import { ShoppingBag, Package, Award, CreditCard, Tag, ChevronRight } from 'lucide-react';
import styles from '@/styles/Home.module.scss';
import ShopForWomen from '@/components/ui/ShopForWomen';
import ShopForMen from '@/components/ui/ShopForMen';
import ShopForKid from '@/components/ui/ShopForKid';




async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { images: true },
    take: 4,
  });
  return products;
}



async function getNewArrivals() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true },
    take: 8,
  });
  return products;
}

async function getCategories() {
  return await prisma.category.findMany();
}

export default async function Home() {
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

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
                <Link href="/shop" className={styles.primaryBtn}>
                  <ShoppingBag className={styles.btnIcon} /> Shop Now
                </Link>
                <Link href="/collections" className={styles.secondaryBtn}>
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
              { icon: <Package />, title: 'Free Shipping', description: 'On orders over $50' },
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

              

      <ShopForWomen />
      <ShopForMen />
      <ShopForKid />







      {/* Featured Products */}
      <section className={styles.featuredProducts}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Featured Products</h2>
            <Link href="/shop" className={styles.sectionLink}>
              View all <ChevronRight className={styles.linkIcon} />
            </Link>
          </div>
          <Suspense fallback={<div className={styles.loading}>Loading featured products...</div>}>
            <ProductList products={featuredProducts} emptyMessage="No featured products available" />
          </Suspense>
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
                className={styles.bannerImage}
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
                className={styles.bannerImage}
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
            <Link href="/new-arrivals" className={styles.sectionLink}>
              View all <ChevronRight className={styles.linkIcon} />
            </Link>
          </div>
          <Suspense fallback={<div className={styles.loading}>Loading new arrivals...</div>}>
            <ProductList products={newArrivals} emptyMessage="No new products available" />
          </Suspense>
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
