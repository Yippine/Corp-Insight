'use client';

import { useEffect } from 'react';
import { trackBusinessEvents } from '../GoogleAnalytics';

interface CompanySearchTrackerProps {
  query: string;
  totalResults: number;
  hasError?: boolean;
}

export default function CompanySearchTracker({
  query,
  totalResults,
  hasError = false,
}: CompanySearchTrackerProps) {
  useEffect(() => {
    // 只有當查詢存在且沒有錯誤時才追蹤
    if (query && !hasError) {
      // 延遲一點點確保頁面已完全載入
      const timer = setTimeout(() => {
        trackBusinessEvents.companySearch(query, totalResults);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [query, totalResults, hasError]);

  // 這個組件不渲染任何內容
  return null;
}
