import { useState, useCallback, useMemo } from 'react';

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
  companies: Array<{
    name: string;
    status: string;
  }>;
}

interface SearchState {
  results: TenderSearchData[];
  query: string;
  currentPage: number;
  totalPages: number;
  searchType: 'company' | 'tender';
}

const STORAGE_KEYS = {
  TENDER_SEARCH: 'tender_search_state'
};

const DEFAULT_SEARCH_STATE: SearchState = {
  results: [],
  query: '',
  currentPage: 1,
  totalPages: 1,
  searchType: 'company'
};

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

  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.TENDER_SEARCH, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const batchUpdateSearchState = useCallback((
    results: TenderSearchData[],
    query: string,
    page: number,
    totalPages: number
  ) => {
    updateSearchState({
      results,
      query,
      currentPage: page,
      totalPages
    });
  }, [updateSearchState]);

  const setSearchResults = (results: TenderSearchData[]) => {
    updateSearchState({ results });
  };

  const setSearchQuery = (query: string) => {
    updateSearchState({ query });
  };

  const setCurrentPage = (page: number) => {
    updateSearchState({ currentPage: page });
  };

  const setTotalPages = (pages: number) => {
    updateSearchState({ totalPages: pages });
  };

  const setSearchType = (type: 'company' | 'tender') => {
    updateSearchState({ searchType: type });
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
    batchUpdateSearchState,
    resetTenderSearch
  };
}