'use client';

import React, { ReactNode, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface CompanySearchClientWrapperProps {
  children: ReactNode;
}

/**
 * 客戶端包裝器，用於處理搜索頁面的客戶端邏輯
 */
export default function CompanySearchClientWrapper({
  children,
}: CompanySearchClientWrapperProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  // 當有查詢參數時，設置加載狀態
  useEffect(() => {
    if (query) {
      // 短暫延遲後關閉加載狀態，以確保內容已經渲染
      const timer = setTimeout(() => {
        // 加載狀態處理邏輯已移除
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [query]);

  return <>{children}</>;
}
