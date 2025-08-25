import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb Skeleton */}
      <div className="h-6 w-64 mb-6">
        <Skeleton height={24} />
      </div>
      
      {/* Category Title Skeleton */}
      <div className="h-10 w-1/3 mb-8">
        <Skeleton height={40} />
      </div>
      
      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32">
            <Skeleton height={40} />
          </div>
        ))}
      </div>
      
      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-square relative bg-gray-100">
              <Skeleton height="100%" width="100%" />
            </div>
            <div className="p-4">
              <Skeleton height={20} width="80%" className="mb-2" />
              <Skeleton height={16} width="60%" />
              <div className="mt-3">
                <Skeleton height={24} width="50%" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
