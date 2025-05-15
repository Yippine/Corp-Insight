'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (state: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// 輕量級的非阻塞載入指示器
const LoadingIndicator = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
        >
          <motion.div
            className="bg-blue-600 text-white px-4 py-2 rounded-b-lg flex items-center shadow-lg"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut" 
            }}
          >
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="font-medium text-sm">Loading...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 記錄組件是否已掛載
  const isMounted = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 當組件掛載時進行初始路由預取
  useEffect(() => {
    isMounted.current = true;
    
    // 預取主要路由
    const routesToPrefetch = ['/company/search', '/tender/search', '/aitool/search'];
    routesToPrefetch.forEach(route => {
      router.prefetch(route);
    });
    
    return () => {
      isMounted.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [router]);

  // 當URL變化時優化載入狀態
  useEffect(() => {
    // 立即啟動載入狀態
    setIsLoading(true);
    
    // 清除之前的計時器
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // 15毫秒內完成的導航不需要閃爍載入狀態
    const navigationTimeout = setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }, 1000);
    
    loadingTimeoutRef.current = navigationTimeout;
    
    // 安全機制：最多顯示載入狀態5秒
    const safetyTimeout = setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }, 5000);
    
    return () => {
      clearTimeout(navigationTimeout);
      clearTimeout(safetyTimeout);
    };
  }, [pathname, searchParams]);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const setLoading = (state: boolean) => setIsLoading(state);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, setLoading }}>
      <LoadingIndicator isLoading={isLoading} />
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