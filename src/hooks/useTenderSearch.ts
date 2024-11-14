import { useState, useMemo, useEffect } from 'react';

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
    const cached = localStorage.getItem('lastTenderSearchState');
    return cached ? JSON.parse(cached) : {
      results: [],
      query: '',
      currentPage: 1,
      totalPages: 1,
      searchType: 'tender' as const
    };
  });

  useEffect(() => {
    localStorage.setItem('lastTenderSearchState', JSON.stringify(searchState));
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

  const resetSearch = () => {
    setSearchState({
      results: [],
      query: '',
      currentPage: 1,
      totalPages: 1,
      searchType: 'tender'
    });
  };

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
    resetSearch
  };
}