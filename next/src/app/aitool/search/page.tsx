import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import { AiToolSearchStructuredData, generateAiToolSearchMetadata } from '@/components/SEO/AiToolSearchSEO';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// 使用動態導入以避免 SSR 和客戶端狀態不一致的問題
const AiToolSearch = dynamic(() => import('@/components/aitool/AiToolSearch'), { ssr: false });

interface AiToolSearchPageProps {
  searchParams?: {
    q?: string;
    page?: string;
    category?: string;
  };
}

export default function AiToolSearchPage({ searchParams }: AiToolSearchPageProps) {
  const query = searchParams?.q || '';
  const category = searchParams?.category || '';
  const page = parseInt(searchParams?.page || '1');

  return (
    <div className="space-y-8">
      {/* 結構化數據標記 */}
      <AiToolSearchStructuredData query={query} category={category} />
      
      <HeroSection 
        title="立即釋放"
        highlightText="職場超能力"
        description="探索專為不同場景打造的 AI 工具，提升您的工作效率與創意表現"
        highlightColor="text-amber-500"
      />

      {/* AI 工具搜索組件 */}
      <Suspense fallback={<div className="w-full h-full min-h-[50vh] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="mt-4 text-gray-500 font-medium">載入中...</div>
        </div>
      </div>}>
        <AiToolSearch 
          initialQuery={query}
          initialCategory={category}
          initialPage={page}
        />
      </Suspense>
      
      {(!query && !category) && <FeatureSection />}
    </div>
  );
}

// 動態生成元數據，以便在伺服器端渲染時反映搜尋查詢
export async function generateMetadata({ searchParams }: AiToolSearchPageProps) {
  const query = searchParams?.q || '';
  const category = searchParams?.category || '';
  
  return generateAiToolSearchMetadata({
    query,
    category
  });
}