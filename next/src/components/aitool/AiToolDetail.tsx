'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCategoryThemes } from '@/lib/aitool/apiHelpers';
import { getIconForTool } from '@/lib/aitool/tagIconMap';
import type { Tools, ColorTheme } from '@/lib/aitool/types';
import { trackBusinessEvents } from '../GoogleAnalytics';
import dynamic from 'next/dynamic';
import { SimpleSpinner } from '@/components/common/loading/LoadingTypes';
import { useLoading } from '@/components/common/loading/LoadingProvider';
import BackButton from '@/components/common/BackButton';
import Instructions from '@/components/tools/Instructions';

// 預載所有工具組件而不是在點擊後再載入
// 使用設置較低的loading priority來優化初始頁面載入速度但仍提前載入組件
const componentMap: Record<string, React.ComponentType<any>> = {
  TitleGenerator: dynamic(
    () => import('@/components/tools/seo/TitleGenerator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  DescriptionGenerator: dynamic(
    () => import('@/components/tools/seo/DescriptionGenerator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  KeywordGenerator: dynamic(
    () => import('@/components/tools/seo/KeywordGenerator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  FaqGenerator: dynamic(() => import('@/components/tools/seo/FaqGenerator'), {
    ssr: true,
    loading: () => <SimpleSpinner />,
  }),
  ReviewGenerator: dynamic(
    () => import('@/components/tools/seo/ReviewGenerator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  FeatureGenerator: dynamic(
    () => import('@/components/tools/seo/FeatureGenerator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  TCMCheck: dynamic(() => import('@/components/tools/health/TCMCheck'), {
    ssr: true,
    loading: () => <SimpleSpinner />,
  }),
  PromptToolTemplate: dynamic(
    () => import('@/components/tools/common/PromptToolTemplate'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  ROICalculator: dynamic(
    () => import('@/components/tools/finance/ROICalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  DepositCalculator: dynamic(
    () => import('@/components/tools/finance/DepositCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  LoanCalculator: dynamic(
    () => import('@/components/tools/finance/LoanCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  CurrencyConverter: dynamic(
    () => import('@/components/tools/finance/CurrencyConverter'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  CompoundInterestCalculator: dynamic(
    () => import('@/components/tools/finance/CompoundInterestCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  PackagingCalculator: dynamic(
    () => import('@/components/tools/manufacturing/PackagingCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  YieldCalculator: dynamic(
    () => import('@/components/tools/manufacturing/YieldCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  OEECalculator: dynamic(
    () => import('@/components/tools/manufacturing/OEECalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  MetalWeightCalculator: dynamic(
    () => import('@/components/tools/manufacturing/MetalWeightCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  ManufacturingCalculator: dynamic(
    () => import('@/components/tools/manufacturing/ManufacturingCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  ServerSpecCalculator: dynamic(
    () => import('@/components/tools/computer/ServerSpecCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  WorkloadScalabilityCalculator: dynamic(
    () => import('@/components/tools/computer/WorkloadScalabilityCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  ModelPerformanceCalculator: dynamic(
    () => import('@/components/tools/computer/ModelPerformanceCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  AIInfrastructureCostCalculator: dynamic(
    () => import('@/components/tools/computer/AIInfrastructureCostCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
  GPUMemoryCalculator: dynamic(
    () => import('@/components/tools/computer/GPUMemoryCalculator'),
    { ssr: true, loading: () => <SimpleSpinner /> }
  ),
};

interface AiToolDetailProps {
  tool: Tools;
}

export default function AiToolDetail({ tool }: AiToolDetailProps) {
  const router = useRouter();
  const { stopLoading, checkAndStopLoading } = useLoading();
  const [categoryThemes, setCategoryThemes] = useState<
    Record<string, ColorTheme>
  >({});

  useEffect(() => {
    // 載入分類主題
    const loadThemes = async () => {
      try {
        const themes = await getCategoryThemes();
        setCategoryThemes(themes);
      } catch (error) {
        console.error('Error loading category themes:', error);
      }
    };

    loadThemes();
  }, []);

  useEffect(() => {
    // 在頁面加載時回到頂部
    window.scrollTo(0, 0);

    // GA 追蹤 AI 工具詳情頁瀏覽
    trackBusinessEvents.aiToolUse(tool.name, tool.tags[0] || 'unknown');

    // 關閉頂部 Loading 指示器
    // 使用短延遲確保 UI 已經渲染
    const timer = setTimeout(() => {
      stopLoading();
    }, 50);

    return () => clearTimeout(timer);
  }, [tool.componentId, tool.name, tool.tags, stopLoading]);

  // 在組件已掛載完成後立即檢查並停止 Loading
  useEffect(() => {
    // 使用 RAF 確保在下一幀停止 Loading
    // 這對緩存的頁面特別有效
    requestAnimationFrame(() => {
      // 對於緩存的頁面，直接調用 checkAndStopLoading
      checkAndStopLoading();
    });
  }, [checkAndStopLoading]);

  const handleBackClick = () => {
    const savedSearch = sessionStorage.getItem('toolSearchParams');
    router.push(`/aitool/search${savedSearch ? `?${savedSearch}` : ''}`);
  };

  // 選擇標籤的主題
  const primaryTag = tool.tags[0] || 'AI';
  const primaryTheme =
    categoryThemes[primaryTag] || categoryThemes.ai || categoryThemes.default;

  const IconComponent = getIconForTool(tool.tags);

  // 直接獲取組件
  const SpecificToolComponent =
    tool.componentId && componentMap[tool.componentId]
      ? componentMap[tool.componentId]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      onAnimationComplete={() => {
        // 動畫完成後，再次確保 Loading 已停止
        stopLoading();
      }}
    >
      <BackButton
        returnPath="/aitool/search"
        sessionKey="toolSearchParams"
        buttonText="返回工具列表"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
      >
        <div className="mb-6 flex items-center">
          <div
            className={`rounded-lg p-3 ${primaryTheme?.primary || 'bg-gray-500'}`}
          >
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h2 className="ml-4 text-3xl font-bold text-gray-900">{tool.name}</h2>
        </div>

        <p className="mb-8 text-lg text-gray-700">{tool.description}</p>
        
        <div className="mb-8 mx-auto max-w-2xl space-y-6">
          {tool.instructions && (
            <Instructions
              what={tool.instructions.what}
              why={tool.instructions.why}
              how={tool.instructions.how}
            />
          )}

          {SpecificToolComponent ? (
            <SpecificToolComponent config={tool} />
          ) : (
            <div className="py-12 text-center text-gray-500">
              此工具暫時無法使用
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tool.tags.map(tag => {
            const theme =
              categoryThemes[tag] ||
              categoryThemes.ai ||
              categoryThemes.default;
            return (
              <span
                key={tag}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${theme?.secondary || 'bg-gray-100'} ${theme?.text || 'text-gray-800'}`}
              >
                {theme?.name || tag}
              </span>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
