import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
