'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from './GoogleAnalytics';

export default function WebVitalsTracker() {
  useEffect(() => {
    // 追蹤 Core Web Vitals
    onCLS((metric: Metric) => {
      trackEvent('web_vitals', 'performance', 'CLS', Math.round(metric.value * 1000));
    });

    onINP((metric: Metric) => {
      trackEvent('web_vitals', 'performance', 'INP', Math.round(metric.value));
    });

    onFCP((metric: Metric) => {
      trackEvent('web_vitals', 'performance', 'FCP', Math.round(metric.value));
    });

    onLCP((metric: Metric) => {
      trackEvent('web_vitals', 'performance', 'LCP', Math.round(metric.value));
    });

    onTTFB((metric: Metric) => {
      trackEvent('web_vitals', 'performance', 'TTFB', Math.round(metric.value));
    });
  }, []);

  return null;
}