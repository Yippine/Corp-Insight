import { useState, useMemo, useEffect } from "react";
import { SearchData } from "../utils/companyUtils";
import {
  DEFAULT_SEARCH_STATE,
  STORAGE_KEYS,
} from "../constants/searchDefaults";

interface SearchState {
  results: SearchData[];
  query: string;
  currentPage: number;
  totalPages: number;
}

export function useCompanySearch() {
  const [searchState, setSearchState] = useState<SearchState>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.COMPANY_SEARCH);
      if (!cached) {
        return DEFAULT_SEARCH_STATE;
      }

      const parsedCache = JSON.parse(cached);
      return {
        ...DEFAULT_SEARCH_STATE,
        ...parsedCache,
      };
    } catch (error) {
      console.error("Error parsing cached search state:", error);
      return DEFAULT_SEARCH_STATE;
    }
  });

  // 當搜尋狀態改變時，更新本地儲存
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.COMPANY_SEARCH,
      JSON.stringify(searchState)
    );
  }, [searchState]);

  const setSearchResults = (results: SearchData[]) => {
    setSearchState((prev) => ({
      ...prev,
      results,
    }));
  };

  const setSearchQuery = (query: string) => {
    setSearchState((prev) => ({
      ...prev,
      query,
    }));
  };

  const setCurrentPage = (page: number) => {
    setSearchState((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  const setTotalPages = (pages: number) => {
    setSearchState((prev) => ({
      ...prev,
      totalPages: pages,
    }));
  };

  const resetCompanySearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setCurrentPage(1);
    setTotalPages(1);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_SEARCH);
  };

  // 使用 useMemo 快取搜尋結果
  const memoizedResults = useMemo(
    () => searchState.results,
    [searchState.results]
  );

  return {
    searchResults: memoizedResults,
    setSearchResults,
    searchQuery: searchState.query,
    setSearchQuery,
    currentPage: searchState.currentPage,
    setCurrentPage,
    totalPages: searchState.totalPages,
    setTotalPages,
    resetCompanySearch,
  };
}
