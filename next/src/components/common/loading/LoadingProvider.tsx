'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (state: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 當URL變化時追蹤載入狀態
  useEffect(() => {
    // 頁面載入開始時
    setIsLoading(true);
    
    // 設定一個短暫的延遲，避免快速顯示/隱藏載入指示器造成閃爍
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 150); // 150ms 的延遲比大多數快速加載還短，但足夠防止閃爍
    
    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const setLoading = (state: boolean) => setIsLoading(state);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}