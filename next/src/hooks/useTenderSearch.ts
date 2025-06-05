'use client';

import { useState, useCallback, useEffect } from 'react';
import { TenderSearchResult, SearchType } from '@/lib/tender/types';
import { useRouter, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'tender_search_state';

interface SearchState {
  results: TenderSearchResult[];
  query: string;
  searchType: SearchType;
  currentPage: number;
  totalPages: number;
}

const DEFAULT_STATE: SearchState = {
  results: [],
  query: '',
  searchType: 'company',
  currentPage: 1,
  totalPages: 1,
};

export function useTenderSearch() {
  const [searchState, setSearchState] = useState<SearchState>(DEFAULT_STATE);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // 從URL參數初始化
  useEffect(() => {
    const q = searchParams?.get('q');
    const type = searchParams?.get('type') as SearchType | null;
    const page = parseInt(searchParams?.get('page') || '1');

    if (q) {
      setSearchState(prev => ({
        ...prev,
        query: decodeURIComponent(q),
        searchType: type === 'tender' ? 'tender' : 'company',
        currentPage: isNaN(page) ? 1 : page,
      }));
    }
  }, [searchParams]);

  // 本地存儲同步
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!searchParams?.get('q')) {
            setSearchState(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    }
  }, []);

  // 更新本地存儲
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            query: searchState.query,
            searchType: searchState.searchType,
          })
        );
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }, [searchState.query, searchState.searchType]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  const setSearchType = useCallback((searchType: SearchType) => {
    setSearchState(prev => ({ ...prev, searchType }));
  }, []);

  const setSearchResults = useCallback(
    (results: TenderSearchResult[], totalPages: number) => {
      setSearchState(prev => ({ ...prev, results, totalPages }));
    },
    []
  );

  const handleSearch = useCallback(
    async (page: number = 1) => {
      if (!searchState.query.trim()) return;

      const query = encodeURIComponent(searchState.query.trim());
      router.push(
        `/tender/search?q=${query}&type=${searchState.searchType}&page=${page}`
      );
    },
    [searchState.query, searchState.searchType, router]
  );

  return {
    searchResults: searchState.results,
    searchQuery: searchState.query,
    searchType: searchState.searchType,
    currentPage: searchState.currentPage,
    totalPages: searchState.totalPages,
    isSearching,
    error,

    setSearchQuery,
    setSearchType,
    setSearchResults,
    setIsSearching,
    setError,

    handleSearch,
  };
}
