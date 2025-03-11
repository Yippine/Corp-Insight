'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startLoading = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(true);
    }
  }, []);

  const stopLoading = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
    }
  }, []);

  const withLoading = useCallback(async (fn: () => Promise<any>) => {
    try {
      startLoading();
      await fn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
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
    stopLoading
  };
}