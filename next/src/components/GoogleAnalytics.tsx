'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_TRACKING_ID = 'G-PDSWJD7GMN';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 確保 gtag 已載入
    if (typeof window.gtag !== 'undefined') {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // 追蹤頁面瀏覽
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
        custom_map: {
          custom_parameter_1: 'business_magnifier_platform'
        }
      });

      console.log('🔍 GA 頁面追蹤:', url);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Google Analytics 初始化腳本 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        defer
      />
      <Script id="google-analytics-init" strategy="afterInteractive" defer>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            send_page_view: false // 禁用自動頁面追蹤，由路由監聽處理
          });
        `}
      </Script>
    </>
  );
}

// 事件追蹤工具函數
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('📊 GA 事件追蹤:', { action, category, label, value });
  }
};

// 業務特定事件追蹤
export const trackBusinessEvents = {
  // 企業搜尋追蹤
  companySearch: (query: string, results: number) => {
    trackEvent('search', 'company', query, results);
  },

  // 企業詳情檢視
  companyView: (companyId: string, companyName: string) => {
    trackEvent('view_item', 'company', `${companyName}(${companyId})`);
  },

  // 標案搜尋追蹤
  tenderSearch: (query: string, results: number) => {
    trackEvent('search', 'tender', query, results);
  },

  // 標案詳情檢視
  tenderView: (tenderId: string, title: string) => {
    trackEvent('view_item', 'tender', `${title}(${tenderId})`);
  },

  // AI 工具搜尋
  aiToolSearch: (category: string, results: number) => {
    trackEvent('search', 'aitool', category, results);
  },

  // AI 工具使用
  aiToolUse: (toolName: string, category: string) => {
    trackEvent('select_content', 'aitool', `${category}-${toolName}`);
  },

  // 回饋提交
  feedbackSubmit: (type: string) => {
    trackEvent('form_submit', 'feedback', type);
  },

  // 外部連結點擊
  externalLinkClick: (url: string, context: string) => {
    trackEvent('click', 'external_link', `${context}-${url}`);
  },

  // 搜尋建議點擊
  searchSuggestionClick: (suggestion: string, position: number) => {
    trackEvent('select_content', 'search_suggestion', suggestion, position);
  },

  // 錯誤追蹤
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('exception', 'error', `${errorType}: ${errorMessage}`);
  },

  // Enhanced Ecommerce 事件 - 企業資料查詢漏斗分析
  beginCompanySearch: () => {
    trackEvent('begin_checkout', 'ecommerce', 'company_search_funnel');
  },

  addCompanyToWatchlist: (companyId: string, companyName: string) => {
    trackEvent('add_to_cart', 'ecommerce', `${companyName}(${companyId})`);
  },

  // 頁面停留時間追蹤
  trackPageEngagement: (pagePath: string, timeSpent: number) => {
    trackEvent('page_engagement', 'engagement', pagePath, timeSpent);
  },

  // 搜尋查詢改進追蹤
  trackSearchRefinement: (originalQuery: string, refinedQuery: string) => {
    trackEvent('search_refinement', 'search', `${originalQuery} -> ${refinedQuery}`);
  },

  // API 效能追蹤
  trackApiPerformance: (endpoint: string, responseTime: number, success: boolean) => {
    trackEvent('api_performance', 'technical', endpoint, responseTime);
    if (!success) {
      trackEvent('api_error', 'technical', endpoint);
    }
  }
};