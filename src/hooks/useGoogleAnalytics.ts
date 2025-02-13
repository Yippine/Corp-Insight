import { useCallback } from 'react';

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set',
      action: string,
      params?: {
        page_path?: string
        page_search?: string
        page_title?: string
        [key: string]: any
      }
    ) => void;
  }
}

export function useGoogleAnalytics() {
  const trackPageView = useCallback((path: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title
      });
    }
  }, []);

  const trackSearchView = useCallback((searchParams: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_search', {
        page_search: searchParams,
        page_title: document.title
      });
    }
  }, []);

  const trackFeatureNavigation = useCallback((source: 'header' | 'section') => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'feature_navigation', {
        source: source,
        page_title: document.title
      });
    }
  }, []);

  const trackEvent = useCallback((
    eventName: string,
    eventParams?: { [key: string]: any }
  ) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        ...eventParams,
        page_title: document.title
      });
    }
  }, []);

  const trackBackButtonClick = useCallback((fromPath: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'back_button_click', {
        from_path: fromPath,
        page_title: document.title
      });
    }
  }, []);

  const trackUrlError = useCallback((invalidUrl: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'url_error', {
        invalid_url: invalidUrl,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`
      });
    }
  }, []);

  return {
    trackPageView,
    trackSearchView,
    trackFeatureNavigation,
    trackEvent,
    trackBackButtonClick,
    trackUrlError
  };
}