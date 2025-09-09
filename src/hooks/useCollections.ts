'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

interface CollectionItem extends Product {
  addedAt: string;
}

const COLLECTIONS_KEY = 'user_collections';

export function useCollections() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collections from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLECTIONS_KEY);
      if (stored) {
        const parsedCollections = JSON.parse(stored);
        setCollections(parsedCollections);
      }
    } catch (error) {
      console.error('Error loading collections from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save collections to localStorage whenever collections change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
      } catch (error) {
        console.error('Error saving collections to localStorage:', error);
      }
    }
  }, [collections, isLoading]);

  const addToCollection = useCallback((product: Product) => {
    setCollections(prev => {
      // Check if product is already in collection
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev; // Don't add duplicates
      }

      const newItem: CollectionItem = {
        ...product,
        addedAt: new Date().toISOString()
      };

      return [...prev, newItem];
    });
  }, []);

  const removeFromCollection = useCallback((productId: number) => {
    setCollections(prev => prev.filter(item => item.id !== productId));
  }, []);

  const isInCollection = useCallback((productId: number) => {
    return collections.some(item => item.id === productId);
  }, [collections]);

  const clearCollections = useCallback(() => {
    setCollections([]);
  }, []);

  const getCollectionCount = useCallback(() => {
    return collections.length;
  }, [collections]);

  return {
    collections,
    isLoading,
    addToCollection,
    removeFromCollection,
    isInCollection,
    clearCollections,
    getCollectionCount
  };
}
