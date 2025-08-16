'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        console.log('Fetching categories...');
        
        // Try direct query first
        const { data, error } = await supabase
          .from('category')
          .select('*')
          .order('name');

        console.log('Supabase response:', { data, error });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Categories in Database</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Raw Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Categories List:</h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="p-3 border rounded hover:bg-gray-50">
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-600">
                Slug: {category.slug} | ID: {category.id} | Parent: {category.parentId || 'None'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
