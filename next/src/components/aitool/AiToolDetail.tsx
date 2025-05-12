'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tools, categoryThemes, iconMap } from '@/lib/aitool/tools';
import { ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const componentMap: Record<string, React.ComponentType<any>> = {
  TitleGenerator: dynamic(() => import('@/components/tools/seo/TitleGenerator')),
  DescriptionGenerator: dynamic(() => import('@/components/tools/seo/DescriptionGenerator')),
  KeywordGenerator: dynamic(() => import('@/components/tools/seo/KeywordGenerator')),
  FaqGenerator: dynamic(() => import('@/components/tools/seo/FaqGenerator')),
  ReviewGenerator: dynamic(() => import('@/components/tools/seo/ReviewGenerator')),
  FeatureGenerator: dynamic(() => import('@/components/tools/seo/FeatureGenerator')),
  TCMCheck: dynamic(() => import('@/components/tools/health/TCMCheck')),
  PromptToolTemplate: dynamic(() => import('@/components/tools/common/PromptToolTemplate')),
  ROICalculator: dynamic(() => import('@/components/tools/finance/ROICalculator')),
  DepositCalculator: dynamic(() => import('@/components/tools/finance/DepositCalculator')),
  LoanCalculator: dynamic(() => import('@/components/tools/finance/LoanCalculator')),
  CurrencyConverter: dynamic(() => import('@/components/tools/finance/CurrencyConverter')),
  CompoundInterestCalculator: dynamic(() => import('@/components/tools/finance/CompoundInterestCalculator')),
  PackagingCalculator: dynamic(() => import('@/components/tools/manufacturing/PackagingCalculator')),
  YieldCalculator: dynamic(() => import('@/components/tools/manufacturing/YieldCalculator')),
  OEECalculator: dynamic(() => import('@/components/tools/manufacturing/OEECalculator')),
  MetalWeightCalculator: dynamic(() => import('@/components/tools/manufacturing/MetalWeightCalculator')),
  ManufacturingCalculator: dynamic(() => import('@/components/tools/manufacturing/ManufacturingCalculator')),
  ServerSpecCalculator: dynamic(() => import('@/components/tools/computer/ServerSpecCalculator')),
  WorkloadScalabilityCalculator: dynamic(() => import('@/components/tools/computer/WorkloadScalabilityCalculator')),
  ModelPerformanceCalculator: dynamic(() => import('@/components/tools/computer/ModelPerformanceCalculator')),
  AIInfrastructureCostCalculator: dynamic(() => import('@/components/tools/computer/AIInfrastructureCostCalculator')),
  GPUMemoryCalculator: dynamic(() => import('@/components/tools/computer/GPUMemoryCalculator')),
};

interface AiToolDetailProps {
  tool: Tools;
}

export default function AiToolDetail({ tool }: AiToolDetailProps) {
  const router = useRouter();
  const [ToolComponent, setToolComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        const componentId = tool.componentId;
        if (componentId && componentId in componentMap) {
          setToolComponent(() => componentMap[componentId]);
        }
      } catch (error) {
        console.error('Error loading component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [tool.componentId]);

  useEffect(() => {
    // 在頁面加載時回到頂部
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    const savedSearch = sessionStorage.getItem('toolSearchParams');
    router.push(`/aitool/search${savedSearch ? `?${savedSearch}` : ''}`);
  };

  // 選擇標籤的主題
  const primaryTag = tool.tags[0] || 'AI';
  const primaryTheme = categoryThemes[primaryTag] || categoryThemes.ai || categoryThemes.default;

  const IconComponent = iconMap[tool.iconName] || iconMap.Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button
        onClick={handleBackClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        返回工具列表
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg ${primaryTheme?.primary || 'bg-gray-500'}`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold ml-4 text-gray-900">{tool.name}</h2>
        </div>

        <p className="text-lg text-gray-700 mb-8">{tool.description}</p>

        <div className="mb-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : ToolComponent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ToolComponent />
            </motion.div>
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
      </motion.div>
    </motion.div>
  );
}