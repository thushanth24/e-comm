'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        placeholder="Search for products, brands and more..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full py-2.5 pl-4 pr-12 text-sm border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded focus:outline-none"
      />
      <button 
        type="submit" 
        className="absolute inset-y-0 right-0 flex items-center px-4 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-r"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
