'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tools, categoryThemes, iconMap } from '@/lib/aitool/tools';
import { ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SimpleSpinner } from '@/components/common/loading/LoadingTypes';

// 預載所有工具組件而不是在點擊後再載入
// 使用設置較低的loading priority來優化初始頁面載入速度但仍提前載入組件
const componentMap: Record<string, React.ComponentType<any>> = {
  TitleGenerator: dynamic(() => import('@/components/tools/seo/TitleGenerator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  DescriptionGenerator: dynamic(() => import('@/components/tools/seo/DescriptionGenerator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  KeywordGenerator: dynamic(() => import('@/components/tools/seo/KeywordGenerator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  FaqGenerator: dynamic(() => import('@/components/tools/seo/FaqGenerator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  ReviewGenerator: dynamic(() => import('@/components/tools/seo/ReviewGenerator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  FeatureGenerator: dynamic(() => import('@/components/tools/seo/FeatureGenerator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  TCMCheck: dynamic(() => import('@/components/tools/health/TCMCheck'), { ssr: true, loading: () => <SimpleSpinner /> }),
  PromptToolTemplate: dynamic(() => import('@/components/tools/common/PromptToolTemplate'), { ssr: true, loading: () => <SimpleSpinner /> }),
  ROICalculator: dynamic(() => import('@/components/tools/finance/ROICalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  DepositCalculator: dynamic(() => import('@/components/tools/finance/DepositCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  LoanCalculator: dynamic(() => import('@/components/tools/finance/LoanCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  CurrencyConverter: dynamic(() => import('@/components/tools/finance/CurrencyConverter'), { ssr: true, loading: () => <SimpleSpinner /> }),
  CompoundInterestCalculator: dynamic(() => import('@/components/tools/finance/CompoundInterestCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  PackagingCalculator: dynamic(() => import('@/components/tools/manufacturing/PackagingCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  YieldCalculator: dynamic(() => import('@/components/tools/manufacturing/YieldCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  OEECalculator: dynamic(() => import('@/components/tools/manufacturing/OEECalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  MetalWeightCalculator: dynamic(() => import('@/components/tools/manufacturing/MetalWeightCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  ManufacturingCalculator: dynamic(() => import('@/components/tools/manufacturing/ManufacturingCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  ServerSpecCalculator: dynamic(() => import('@/components/tools/computer/ServerSpecCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  WorkloadScalabilityCalculator: dynamic(() => import('@/components/tools/computer/WorkloadScalabilityCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  ModelPerformanceCalculator: dynamic(() => import('@/components/tools/computer/ModelPerformanceCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  AIInfrastructureCostCalculator: dynamic(() => import('@/components/tools/computer/AIInfrastructureCostCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
  GPUMemoryCalculator: dynamic(() => import('@/components/tools/computer/GPUMemoryCalculator'), { ssr: true, loading: () => <SimpleSpinner /> }),
};

interface AiToolDetailProps {
  tool: Tools;
}

export default function AiToolDetail({ tool }: AiToolDetailProps) {
  const router = useRouter();

  useEffect(() => {
    // 在頁面加載時回到頂部
    window.scrollTo(0, 0);
    
    // 預載所有工具組件
    if (tool.componentId && componentMap[tool.componentId]) {
      // 強制預加載此工具組件
      const preloadTool = componentMap[tool.componentId];
    }
  }, [tool.componentId]);

  const handleBackClick = () => {
    const savedSearch = sessionStorage.getItem('toolSearchParams');
    router.push(`/aitool/search${savedSearch ? `?${savedSearch}` : ''}`);
  };

  // 選擇標籤的主題
  const primaryTag = tool.tags[0] || 'AI';
  const primaryTheme = categoryThemes[primaryTag] || categoryThemes.ai || categoryThemes.default;

  const IconComponent = iconMap[tool.iconName] || iconMap.Zap;

  // 直接獲取組件
  const SpecificToolComponent = tool.componentId && componentMap[tool.componentId]
    ? componentMap[tool.componentId]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <button
        onClick={handleBackClick}
        className="inline-flex items-center px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        返回工具列表
      </button>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg ${primaryTheme?.primary || 'bg-gray-500'}`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold ml-4 text-gray-900">{tool.name}</h2>
        </div>

        <p className="text-lg text-gray-700 mb-8">{tool.description}</p>

        <div className="mb-8">
          {SpecificToolComponent ? (
            <SpecificToolComponent />
          ) : (
            <div className="text-center text-gray-500 py-12">
              此工具暫時無法使用
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag) => {
            const theme = categoryThemes[tag] || categoryThemes.ai || categoryThemes.default;
            return (
              <span
                key={tag}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme?.secondary || 'bg-gray-100'} ${theme?.text || 'text-gray-800'}`}
              >
                {theme?.name || tag}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}