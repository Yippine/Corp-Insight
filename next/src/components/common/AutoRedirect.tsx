'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadingState } from './loading/LoadingHooks';

interface AutoRedirectProps {
  url: string;
}

/**
 * 客戶端自動重定向組件
 * 用於在伺服器端渲染中安全處理自動重定向
 */
export default function AutoRedirect({ url }: AutoRedirectProps) {
  const router = useRouter();
  const { setLoading } = useLoadingState(true); // 啟動並維持加載狀態直到路由變化

  useEffect(() => {
    if (url) {
      // 保持加載狀態
      setLoading(true);
      // 執行跳轉
      router.push(url);
      
      // 清理函數 - 當元件卸載時執行
      return () => {
        // 路由變化完成後元件會卸載，此時自動停止加載狀態
        setLoading(false);
      };
    }
  }, [router, url, setLoading]);

  // 不渲染任何內容
  return null;
}