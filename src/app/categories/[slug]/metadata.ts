import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return {
      title: 'Category Not Found',
      description: 'No category specified.',
    };
  }

  const category = await prisma.category.findUnique({ 
    where: { slug },
    select: { name: true }
  });

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
