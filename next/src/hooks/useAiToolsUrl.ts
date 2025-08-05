'use client';

import { getAiToolsUrl } from '@/config/site';
import { useEffect, useState } from 'react';

export function useAiToolsUrl() {
  const [originalHost, setOriginalHost] = useState<string>('');

  useEffect(() => {
    // 在客戶端獲取當前的 host
    if (typeof window !== 'undefined') {
      setOriginalHost(window.location.host);
    }
  }, []);

  const generateAiToolsUrl = (path: string) => {
    return getAiToolsUrl(path, originalHost);
  };

  return { generateAiToolsUrl };
}