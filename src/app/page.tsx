import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import CategoryCard from '@/components/ui/CategoryCard';
import { ShoppingBag, Package, Award, CreditCard, Tag, ChevronRight } from 'lucide-react';
import styles from '@/styles/Home.module.scss';

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
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop"
            alt="Fashion Collection"
            fill
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <div className={styles.heroTextWrapper}>
              <span className={styles.heroBadge}>New Collection</span>
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

      {/* Category Navigation */}
      <section className={styles.categoryNav}>
        <div className={styles.container}>
          <div className={styles.categoryList}>
            {["Men", "Women", "Kids", "Accessories", "New Arrivals", "Sale"].map((category) => (
              <Link
                key={category}
                href={`/category/${category.toLowerCase().replace(' ', '-')}`}
                className={styles.categoryItem}
              >
                {category}
              </Link>
            ))}
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
              { icon: <Tag />, title: 'Daily Offers', description: 'Discounts up to 70%' },
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

      {/* Featured Categories */}
      <section className={styles.featuredCategories}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Shop by Category</h2>
            <Link href="/categories" className={styles.sectionLink}>
              View all <ChevronRight className={styles.linkIcon} />
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {categories.length > 0
              ? categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={{ name: category.name, slug: category.slug }}
                  />
                ))
              : ['Men', 'Women', 'Kids', 'Accessories'].map((name) => (
                  <CategoryCard
                    key={name}
                    category={{ name, slug: name.toLowerCase() }}
                  />
                ))}
          </div>
        </div>
      </section>

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
                src="https://images.unsplash.com/photo-1550246140-29f40b909e5a?w=800&auto=format&fit=crop"
                alt="Men's Collection"
                fill
                className={styles.bannerImage}
              />
              <div className={styles.bannerContent}>
                <div className={styles.bannerBadge}>New Arrivals</div>
                <h2>Men's Collection</h2>
                <p>Fresh styles for the season</p>
                <Link href="/category/men" className={styles.bannerBtn}>
                  Shop Now
                </Link>
              </div>
            </div>
            <div className={styles.bannerCard}>
              <Image
                src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop"
                alt="Women's Collection"
                fill
                className={styles.bannerImage}
              />
              <div className={styles.bannerContent}>
                <div className={styles.bannerBadge}>Special Offer</div>
                <h2>Women's Collection</h2>
                <p>Up to 30% off selected items</p>
                <Link href="/category/women" className={styles.bannerBtn}>
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
