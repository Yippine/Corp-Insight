'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface TenderSearchClientWrapperProps {
  children: React.ReactNode;
}

export default function TenderSearchClientWrapper({
  children,
}: TenderSearchClientWrapperProps) {
  const searchParams = useSearchParams();

  // 處理從詳情頁返回時的滾動位置恢復
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 檢查是否有查詢參數，確保頁面已載入搜尋結果
      if (searchParams?.has('q')) {
        const storedScrollPosition =
          sessionStorage.getItem('tenderSearchScroll');

        if (storedScrollPosition) {
          window.scrollTo(0, parseInt(storedScrollPosition));
          sessionStorage.removeItem('tenderSearchScroll');
        }
      }
    }
  }, [searchParams]);

  return <>{children}</>;
}
