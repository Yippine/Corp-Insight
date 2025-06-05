'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * 使用具有持久狀態的載入鉤子
 * initialState: 初始載入狀態
 * resetOnRouteChange: 路由變化時是否重置狀態
 */
export function useLoadingState(
  initialState = false,
  resetOnRouteChange = true
) {
  const [isLoading, setIsLoading] = useState(initialState);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 路由變化時重置載入狀態
  useEffect(() => {
    if (resetOnRouteChange) {
      setIsLoading(false);
    }
  }, [pathname, searchParams, resetOnRouteChange]);

  return {
    isLoading,
    setLoading: (state: boolean) => {
      setIsLoading(state);
    },
    startLoading: () => {
      setIsLoading(true);
    },
    stopLoading: () => {
      setIsLoading(false);
    },
  };
}

export function useDebounceLoading(delay = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startLoading = useCallback(() => {
    if (mountedRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsLoading(true);
    }
  }, []);

  const stopLoading = useCallback(() => {
    if (mountedRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }, delay);
    }
  }, [delay]);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}
