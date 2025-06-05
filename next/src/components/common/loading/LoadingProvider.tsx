'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (state: boolean) => void;
  checkAndStopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// 主要搜尋頁面路徑
const SEARCH_ROUTES = ['/company/search', '/tender/search', '/aitool/search'];

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
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
        >
          <motion.div
            className="flex items-center rounded-b-lg bg-blue-600 px-4 py-2 text-white shadow-lg"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMounted = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number | null>(null);
  const lastNavigationRef = useRef<{ path: string; search: string }>({
    path: pathname || '',
    search: searchParams?.toString() || '',
  });
  const contentLoadedRef = useRef(false);

  // 追蹤已訪問過的頁面 - 使用陣列替代 Set 以避免 TypeScript 錯誤
  const visitedPagesRef = useRef<string[]>([]);

  // 組件掛載和預取路由
  useEffect(() => {
    isMounted.current = true;

    // 預取所有主要搜尋頁面路由
    SEARCH_ROUTES.forEach(route => router.prefetch(route));

    // 初次掛載時記錄當前頁面為已訪問
    if (pathname && !visitedPagesRef.current.includes(pathname)) {
      visitedPagesRef.current.push(pathname);
    }

    // 恢復會話中訪問過的頁面記錄
    if (typeof window !== 'undefined') {
      try {
        const storedPages = sessionStorage.getItem('visitedPages');
        if (storedPages) {
          const pages = JSON.parse(storedPages) as string[];
          // 合併已儲存的頁面，確保沒有重複
          pages.forEach(page => {
            if (!visitedPagesRef.current.includes(page)) {
              visitedPagesRef.current.push(page);
            }
          });
        }
      } catch {
        // 忽略解析錯誤
      }
    }

    return () => {
      isMounted.current = false;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [router, pathname]);

  // 監控URL變化
  useEffect(() => {
    if (!isMounted.current) return;

    // 如果導航到了新的URL，記錄為最新的導航
    if (
      pathname !== lastNavigationRef.current.path ||
      searchParams?.toString() !== lastNavigationRef.current.search
    ) {
      lastNavigationRef.current = {
        path: pathname || '',
        search: searchParams?.toString() || '',
      };

      // 記錄當前頁面為已訪問
      if (pathname && !visitedPagesRef.current.includes(pathname)) {
        visitedPagesRef.current.push(pathname);

        // 保存到 sessionStorage
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(
              'visitedPages',
              JSON.stringify(visitedPagesRef.current)
            );
          } catch {
            // 忽略儲存錯誤
          }
        }
      }

      // 檢測主要內容是否已加載
      contentLoadedRef.current = false;

      // 計算 Loading 持續時間，如果太短就不顯示
      const loadingDuration = loadingStartTimeRef.current
        ? Date.now() - loadingStartTimeRef.current
        : 0;

      // 如果是主要搜尋頁面之間的切換，並且 Loading 時間少於 150ms，立即停止 Loading
      if (
        pathname &&
        SEARCH_ROUTES.includes(pathname) &&
        loadingDuration < 150
      ) {
        stopLoadingInternal();
        return;
      }

      // 設置一個短暫延遲後檢查頁面是否已加載
      // 這對於相同路由不同參數的情況特別有用
      setTimeout(() => {
        if (isMounted.current && !contentLoadedRef.current) {
          contentLoadedRef.current = true;
          stopLoadingInternal();
        }
      }, 250); // 縮短延遲以獲得更快的響應
    }
  }, [pathname, searchParams]);

  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  // 內部使用的停止加載函數
  const stopLoadingInternal = useCallback(() => {
    if (isMounted.current) {
      setIsLoading(false);
      loadingStartTimeRef.current = null;
      clearSafetyTimeout();
    }
  }, [clearSafetyTimeout]);

  const startLoading = useCallback(() => {
    if (isMounted.current) {
      // 記錄開始載入的時間
      loadingStartTimeRef.current = Date.now();

      // 判斷是否要顯示 Loading
      setIsLoading(true);
      contentLoadedRef.current = false;

      clearSafetyTimeout();
      safetyTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false);
          loadingStartTimeRef.current = null;
        }
      }, 4000); // 縮短為4秒超時
    }
  }, [clearSafetyTimeout]);

  const stopLoading = useCallback(() => {
    if (isMounted.current) {
      // 主要內容已加載
      contentLoadedRef.current = true;
      stopLoadingInternal();
    }
  }, [stopLoadingInternal]);

  // 提供給NavLink使用的檢查並停止加載函數
  const checkAndStopLoading = useCallback(() => {
    // 對於同路由不同參數的情況，激活這個函數來提前結束loading
    if (isMounted.current) {
      // 設置一個短暫延遲，確保新頁面內容有最小的渲染時間
      setTimeout(() => {
        if (isMounted.current) {
          contentLoadedRef.current = true;
          stopLoadingInternal();
        }
      }, 50); // 縮短延遲
    }
  }, [stopLoadingInternal]);

  const setLoading = useCallback(
    (state: boolean) => {
      if (state) {
        startLoading();
      } else {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const contextValue = useMemo(
    () => ({
      isLoading,
      startLoading,
      stopLoading,
      setLoading,
      checkAndStopLoading,
    }),
    [isLoading, startLoading, stopLoading, setLoading, checkAndStopLoading]
  );

  return (
    <LoadingContext.Provider value={contextValue}>
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
