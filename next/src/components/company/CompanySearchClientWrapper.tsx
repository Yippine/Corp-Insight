'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface CompanySearchClientWrapperProps {
  children: ReactNode;
}

/**
 * 客戶端包裝器，用於處理搜索頁面的客戶端邏輯
 */
export default function CompanySearchClientWrapper({ children }: CompanySearchClientWrapperProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const query = searchParams?.get('q') || '';
  
  // 當有查詢參數時，設置加載狀態
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      
      // 短暫延遲後關閉加載狀態，以確保內容已經渲染
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [query]);
  
  return <>{children}</>;
}