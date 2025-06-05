'use client';

import { useEffect } from 'react';
import { trackBusinessEvents } from '../GoogleAnalytics';
import type { CompanyData } from '@/lib/company/types';

interface CompanyDetailTrackerProps {
  companyData: CompanyData;
}

export default function CompanyDetailTracker({ companyData }: CompanyDetailTrackerProps) {
  useEffect(() => {
    // 追蹤企業詳情頁瀏覽
    trackBusinessEvents.companyView(companyData.taxId, companyData.name);
  }, [companyData.taxId, companyData.name]);

  return null;
}