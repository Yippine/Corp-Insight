import { useState, useCallback, useMemo, useEffect } from 'react';

export interface TenderSearchData {
  tenderId: string;
  uniqueId: string;
  date: string;
  type: string;
  title: string;
  unitName: string;
  unitId: string;
  amount: string;
  label: string;
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
      const hasUrlParams = window.location.search.includes('q=');

      if (!cached || !hasUrlParams) {
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

  const batchUpdate = useCallback((newState: Partial<SearchState>) => {
    setSearchState(prev => {
      const merged = {...prev, ...newState};
      localStorage.setItem(STORAGE_KEYS.TENDER_SEARCH, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const setSearchQuery = (query: string) => {
    updateSearchState({ query });
  };

  const setSearchType = (type: 'company' | 'tender') => {
    updateSearchState({ searchType: type });
  };

  const resetTenderSearch = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TENDER_SEARCH);
    setSearchState(DEFAULT_SEARCH_STATE);
  }, []);

  const memoizedResults = useMemo(() => searchState.results, [searchState.results]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TENDER_SEARCH && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.query && parsed.searchType) {
            setSearchState(prev => ({...prev, ...parsed}));
          }
        } catch (error) {
          console.error('Storage 解析錯誤:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    searchResults: memoizedResults,
    searchQuery: searchState.query,
    searchType: searchState.searchType,
    currentPage: searchState.currentPage,
    totalPages: searchState.totalPages,
    setSearchQuery,
    setSearchType,
    batchUpdateSearchState: batchUpdate,
    resetTenderSearch
  };
}