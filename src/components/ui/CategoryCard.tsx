import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    imageUrl?: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Map of category slugs to default unsplash images - using stable, working image URLs
  const categoryImages: Record<string, string> = {
    'mens': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop',
    'womens': 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop',
    'kids': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1511118207236-ef622966bb98?w=800&auto=format&fit=crop',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop';
  const imageUrl = category.imageUrl || categoryImages[category.slug.toLowerCase()] || fallbackImage;

  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div className="relative h-72 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 group-hover:shadow-lg">
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60 flex flex-col items-center justify-end p-6 transition-opacity duration-300">
          <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm px-4 py-2 rounded-full flex items-center space-x-1 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <span>Explore</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
