'use client';

import { useEffect } from 'react';
import { trackBusinessEvents } from '../GoogleAnalytics';

interface TenderDetailTrackerProps {
  tenderId: string;
  tenderTitle?: string;
}

export default function TenderDetailTracker({ tenderId, tenderTitle }: TenderDetailTrackerProps) {
  useEffect(() => {
    // 追蹤標案詳情頁瀏覽
    trackBusinessEvents.tenderView(tenderId, tenderTitle || 'Unknown Tender');
  }, [tenderId, tenderTitle]);

  return null;
}