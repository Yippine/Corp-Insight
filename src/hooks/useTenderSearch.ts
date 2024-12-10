import { useState, useMemo, useEffect, useCallback } from 'react';
import { DEFAULT_SEARCH_STATE, STORAGE_KEYS } from '../constants/searchDefaults';

export interface TenderSearchData {
  tenderId: string;
  uniqueId: string;
  date: string;
  type: string;
  title: string;
  unitName: string;
  unitId: string;
  amount: string;
  status: string;
  companies?: {
    name: string;
    status: string;
  }[];
}

interface SearchState {
  results: TenderSearchData[];
  query: string;
  currentPage: number;
  totalPages: number;
  searchType: 'tender' | 'company';
}

export function useTenderSearch() {
  const [searchState, setSearchState] = useState<SearchState>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.TENDER_SEARCH);
      if (!cached) {
        return DEFAULT_SEARCH_STATE;
      }
      
      const parsedCache = JSON.parse(cached);
      return {
        ...DEFAULT_SEARCH_STATE,
        ...parsedCache
      };
    } catch (error) {
      console.error('Error parsing cached search state:', error);
      return DEFAULT_SEARCH_STATE;
    }
  });

  useEffect(() => {
    if (searchState === DEFAULT_SEARCH_STATE) {
      localStorage.removeItem(STORAGE_KEYS.TENDER_SEARCH);
    } else {
      localStorage.setItem(STORAGE_KEYS.TENDER_SEARCH, JSON.stringify(searchState));
    }
  }, [searchState]);

  const setSearchResults = (results: TenderSearchData[]) => {
    setSearchState(prev => ({
      ...prev,
      results
    }));
  };

  const setSearchQuery = (query: string) => {
    setSearchState(prev => ({
      ...prev,
      query
    }));
  };

  const setSearchType = (type: 'tender' | 'company') => {
    setSearchState(prev => ({
      ...prev,
      searchType: type
    }));
  };

  const setCurrentPage = (page: number) => {
    setSearchState(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const setTotalPages = (pages: number) => {
    setSearchState(prev => ({
      ...prev,
      totalPages: pages
    }));
  };

  const resetTenderSearch = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TENDER_SEARCH);
    setSearchState(DEFAULT_SEARCH_STATE);
  }, []);

  const memoizedResults = useMemo(() => searchState.results, [searchState.results]);

  return {
    searchResults: memoizedResults,
    setSearchResults,
    searchQuery: searchState.query,
    setSearchQuery,
    searchType: searchState.searchType,
    setSearchType,
    currentPage: searchState.currentPage,
    setCurrentPage,
    totalPages: searchState.totalPages,
    setTotalPages,
    resetTenderSearch
  };
}