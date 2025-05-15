'use client';

import { useReportWebVitals } from 'next/web-vitals';

export default function WebVitalsReporter() {
  useReportWebVitals(metric => {
    // 監測核心網頁性能指標
    console.log(metric);
    
    // 根據指標名稱執行不同的處理
    switch (metric.name) {
      case 'LCP': // 最大內容繪製
        if (metric.value > 2500) {
          console.warn(`慢速 LCP: ${metric.value.toFixed(2)}ms`, metric);
          // 可以將慢速 LCP 發送到分析服務
        }
        break;
      case 'FID': // 首次輸入延遲
        if (metric.value > 100) {
          console.warn(`高 FID: ${metric.value.toFixed(2)}ms`, metric);
        }
        break;
      case 'CLS': // 累積布局偏移
        if (metric.value > 0.1) {
          console.warn(`高 CLS: ${metric.value.toFixed(4)}`, metric);
        }
        break;
      case 'FCP': // 首次內容繪製
        if (metric.value > 1800) {
          console.warn(`慢速 FCP: ${metric.value.toFixed(2)}ms`, metric);
        }
        break;
      case 'TTFB': // 首字節時間
        if (metric.value > 600) {
          console.warn(`慢速 TTFB: ${metric.value.toFixed(2)}ms`, metric);
        }
        break;
    }

    // 您可以將數據發送到分析服務或自定義端點
    // 例如：
    // fetch('/api/vitals', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   headers: { 'Content-Type': 'application/json' }
    // });
  });
  
  return null;
}