import { getCategoryBySlug } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return {
      title: 'Category Not Found',
      description: 'No category specified.',
    };
  }

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} - SRI RAM SELECTION`,
    description: `Browse our collection of ${category.name.toLowerCase()} clothing and accessories.`,
  };
}
