'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import styles from '@/styles/SearchBar.module.scss';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    setMounted(true); // hydration-safe flag
  }, []);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchInputContainer}>
          <Search className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for futuristic fashion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {mounted && (
          <button
            type="submit"
            className={styles.searchButton}
            aria-label="Search"
            data-glow={isFocused}
          >
            <span>Search</span>
            <div className={styles.searchArrow}></div>
          </button>
        )}
      </form>
    </div>
  );
}
