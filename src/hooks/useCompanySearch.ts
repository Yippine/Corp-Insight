import { useState, useMemo } from 'react';
import { SearchData } from '../utils/companyUtils';

export function useCompanySearch() {
  const [searchResults, setSearchResults] = useState<SearchData[]>(() => {
    // 從本地儲存讀取快取的搜尋結果
    const cached = localStorage.getItem('lastSearchResults');
    return cached ? JSON.parse(cached) : [];
  });

  const [searchQuery, setSearchQuery] = useState(() => 
    localStorage.getItem('lastSearchQuery') || ''
  );

  // 使用 useMemo 快取搜尋結果
  const memoizedResults = useMemo(() => searchResults, [searchResults]);

  return {
    searchResults: memoizedResults,
    setSearchResults,
    searchQuery,
    setSearchQuery
  };
} 