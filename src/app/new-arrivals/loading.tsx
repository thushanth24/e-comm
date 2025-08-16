import { CategorySectionSkeleton } from './components/CategorySectionSkeleton';

export default function Loading() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="space-y-16">
        {[1, 2, 3].map((i) => (
          <CategorySectionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
