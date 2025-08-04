export default function CategoryLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      
      <div className="flex gap-8">
        <div className="w-64">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
