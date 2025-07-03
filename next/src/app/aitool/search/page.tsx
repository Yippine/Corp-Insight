import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import {
  AiToolSearchStructuredData,
  generateAiToolSearchMetadata,
} from '@/components/SEO/AiToolSearchSEO';
import { Metadata } from 'next';
import AiToolSearch from '@/components/aitool/AiToolSearch';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { hasToolSearchResults } from '@/lib/aitool/data';

export const dynamic = 'force-dynamic';

interface AiToolSearchPageProps {
  searchParams?: {
    q?: string;
    page?: string;
    tag?: string;
  };
}

export default function AiToolSearchPage({
  searchParams,
}: AiToolSearchPageProps) {
  const query = searchParams?.q || '';
  const tag = searchParams?.tag || '';

  return (
    <div className="space-y-8">
      {/* 結構化數據標記 */}
      <AiToolSearchStructuredData query={query} tag={tag} />

      <HeroSection
        title="立即釋放"
        highlightText="職場超能力"
        description="探索專為不同場景打造的 AI 工具，提升您的工作效率與創意表現"
        highlightColor="text-amber-500"
      />

      {/* AI 工具搜索組件 */}
      <Suspense fallback={<InlineLoading />}>
        <AiToolSearch initialQuery={query} initialTag={tag} />
      </Suspense>
    </div>
  );
}

// 動態生成元數據，以便在伺服器端渲染時反映搜尋查詢
export async function generateMetadata({
  searchParams,
}: AiToolSearchPageProps): Promise<Metadata> {
  const query = searchParams?.q || '';
  const tag = searchParams?.tag || '';

  // 使用 hasToolSearchResults 函數判斷是否有搜尋結果
  const hasResults =
    !query && !tag ? true : await hasToolSearchResults(query, tag);

  return generateAiToolSearchMetadata({
    query,
    tag,
    hasResults,
  });
}
