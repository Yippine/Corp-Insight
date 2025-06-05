'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useLoading } from '@/components/common/loading/LoadingProvider';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

export default function Loading() {
  const { startLoading, stopLoading, checkAndStopLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // 當頁面 Loading 組件掛載時，通知全局 Loading 上下文
  useEffect(() => {
    // 標記已不是第一次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }

    // 通知全局上下文開始加載
    startLoading();

    // 檢測為同路由不同參數的導航
    const isOnlySearchParamsChanged =
      pathname?.includes('/feedback') && searchParams?.has('type');

    // 如果是特殊情況，如僅搜索參數變化，使用更短的超時
    if (isOnlySearchParamsChanged) {
      setTimeout(() => {
        checkAndStopLoading();
      }, 150);
    }

    return () => {
      // 組件卸載時停止加載狀態
      setTimeout(() => {
        stopLoading();
      }, 100);
    };
  }, [startLoading, stopLoading, checkAndStopLoading, pathname, searchParams]);

  return <InlineLoading />;
}
