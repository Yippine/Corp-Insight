'use client';

import { useEffect } from 'react';
import { trackBusinessEvents, trackEvent } from '../GoogleAnalytics';

interface TenderSearchTrackerProps {
  query: string;
  searchType: 'company' | 'tender';
  totalResults: number;
  hasError?: boolean;
}

export default function TenderSearchTracker({
  query,
  searchType,
  totalResults,
  hasError = false,
}: TenderSearchTrackerProps) {
  useEffect(() => {
    if (query && !hasError) {
      const timer = setTimeout(() => {
        trackBusinessEvents.tenderSearch(query, totalResults);

        // 額外追蹤搜尋類型
        trackEvent('search_type', 'tender', searchType, totalResults);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [query, searchType, totalResults, hasError]);

  return null;
}
