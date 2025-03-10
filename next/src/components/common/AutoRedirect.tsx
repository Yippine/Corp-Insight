'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AutoRedirectProps {
  url: string;
}

/**
 * 客戶端自動重定向組件
 * 用於在伺服器端渲染中安全處理自動重定向
 */
export default function AutoRedirect({ url }: AutoRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (url) {
      router.push(url);
    }
  }, [router, url]);

  // 不渲染任何內容
  return null;
}