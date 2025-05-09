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
    tag?: string;
  };
}

export default function AiToolSearchPage({ searchParams }: AiToolSearchPageProps) {
  const query = searchParams?.q || '';
  const tag = searchParams?.tag || '';
  const decodedQuery = decodeURIComponent(query);
  const decodedTag = decodeURIComponent(tag);

  return (
    <div className="space-y-8">
      {/* 結構化數據標記 */}
      <AiToolSearchStructuredData query={decodedQuery} tag={decodedTag} />
      
      <HeroSection 
        title="智慧 AI "
        highlightText="助理工具"
        description="探索專為不同場景打造的 AI 工具，提升您的工作效率與創意表現"
        highlightColor="text-amber-500"
      />

      <AiToolSearch initialQuery={decodedQuery} initialTag={decodedTag} />
      
      {(!decodedQuery && !decodedTag) && <FeatureSection />}
    </div>
  );
}

// 動態生成元數據，以便在伺服器端渲染時反映搜尋查詢
export function generateMetadata({ searchParams }: { searchParams?: { q?: string, tag?: string } }): Metadata {
  const query = searchParams?.q || '';
  const tag = searchParams?.tag || '';
  const decodedQuery = decodeURIComponent(query);
  const decodedTag = decodeURIComponent(tag);
  
  return generateAiToolSearchMetadata({
    query: decodedQuery,
    tag: decodedTag
  });
}