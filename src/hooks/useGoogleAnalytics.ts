import { useCallback } from 'react';

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set',
      action: string,
      params?: any
    ) => void;
  }
}

export function useGoogleAnalytics() {
  const trackPageView = useCallback((page_path: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path,
        page_title: document.title
      });
    }
  }, []);

  const trackEvent = useCallback((
    eventName: string,
    eventParams?: { [key: string]: any }
  ) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, eventParams);
    }
  }, []);

  return {
    trackPageView,
    trackEvent
  };
}