'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';

interface CollectionItem extends Product {
  addedAt: string;
}

interface CollectionsContextType {
  collections: CollectionItem[];
  isLoading: boolean;
  addToCollection: (product: Product) => void;
  removeFromCollection: (productId: number) => void;
  isInCollection: (productId: number) => boolean;
  clearCollections: () => void;
  getCollectionCount: () => number;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

const COLLECTIONS_KEY = 'user_collections';

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle SSR by checking if we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load collections from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    
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
  }, [mounted]);

  // Save collections to localStorage whenever collections change
  useEffect(() => {
    if (!mounted || isLoading) return;
    
    try {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Error saving collections to localStorage:', error);
    }
  }, [collections, isLoading, mounted]);

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

  const value: CollectionsContextType = {
    collections,
    isLoading,
    addToCollection,
    removeFromCollection,
    isInCollection,
    clearCollections,
    getCollectionCount
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}
