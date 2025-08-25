import { useCallback, useRef } from 'react';

type QueryFunction<T> = () => Promise<T>;
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();
const pendingQueries = new Map<string, Promise<any>>();

export function useOptimizedQuery<T>(key: string) {
  const getCachedData = useCallback(<T>(cacheKey: string): { data: T; isStale: boolean } | null => {
    const cached = cache.get(cacheKey);
    if (!cached) return null;
    
    const isStale = Date.now() - cached.timestamp > CACHE_TTL;
    return { data: cached.data, isStale };
  }, []);

  const executeQuery = useCallback(
    async <T>(
      queryFn: QueryFunction<T>,
      options?: { cacheKey?: string; forceRefresh?: boolean }
    ): Promise<{ data: T; fromCache: boolean }> => {
      const cacheKey = options?.cacheKey || key;
      
      // Return cached data if available and fresh
      if (!options?.forceRefresh) {
        const cached = getCachedData<T>(cacheKey);
        if (cached && !cached.isStale) {
          return { data: cached.data, fromCache: true };
        }
      }

      // Check if we already have a pending request for this key
      if (pendingQueries.has(cacheKey)) {
        return pendingQueries.get(cacheKey)!;
      }

      // Execute the query and cache the result
      try {
        const queryPromise = queryFn();
        pendingQueries.set(cacheKey, queryPromise);
        
        const result = await queryPromise;
        
        // Cache the successful response
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        
        return { data: result, fromCache: false };
      } finally {
        pendingQueries.delete(cacheKey);
      }
    },
    [key, getCachedData]
  );

  const invalidateCache = useCallback((cacheKey: string = key) => {
    cache.delete(cacheKey);
  }, [key]);

  return { executeQuery, getCachedData, invalidateCache };
}
