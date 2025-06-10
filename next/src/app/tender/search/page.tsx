import { Metadata } from 'next';
import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import TenderSearchForm from '@/components/tender/TenderSearchForm';
import TenderSearchResults from '@/components/tender/TenderSearchResults';
import FeatureSection from '@/components/FeatureSection';
import { fetchTenderSearch } from '@/lib/tender/api';
import type { SearchParams, TenderSearchResult } from '@/lib/tender/types';
import NoSearchResults from '@/components/common/NoSearchResults';
import TenderSearchClientWrapper from '@/components/tender/TenderSearchClientWrapper';
import TenderSearchTracker from '@/components/tender/TenderSearchTracker';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';
import { cache } from 'react';

export const dynamic = 'force-dynamic';

interface TenderSearchPageProps {
  searchParams?: SearchParams;
}

// 使用 React 的 cache 函數避免重複請求
// 這樣 generateMetadata 和 TenderSearchPage 可以共享同一個數據獲取
type CachedSearchResult = {
  results: TenderSearchResult[];
  totalPages: number;
  error?: string | null;
};

const getCachedTenderSearch = cache(
  async (
    query: string,
    searchType: 'company' | 'tender',
    page: number
  ): Promise<CachedSearchResult> => {
    try {
      const searchResults = await fetchTenderSearch(query, searchType, page);
      return {
        ...searchResults,
        error: null,
      };
    } catch (e) {
      console.error('Search failed:', e);
      return {
        results: [] as TenderSearchResult[],
        totalPages: 0,
        error:
          e instanceof Error ? e.message : '搜尋過程發生錯誤，請稍後再試。',
      };
    }
  }
);

export default async function TenderSearchPage({
  searchParams,
}: TenderSearchPageProps) {
  const query = searchParams?.q || '';
  const searchType = (searchParams?.type || 'company') as 'company' | 'tender';
  const page = parseInt(searchParams?.page || '1') || 1;
  const decodedQuery = decodeURIComponent(query);

  // 默認狀態
  let results: TenderSearchResult[] = [];
  let totalPages = 0;
  let error: string | null = null;

  // 如果有搜尋查詢，則執行搜索
  if (decodedQuery) {
    const searchResults = await getCachedTenderSearch(
      decodedQuery,
      searchType,
      page
    );
    results = searchResults.results;
    totalPages = searchResults.totalPages;
    error = searchResults.error || null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,80px))] w-full items-center justify-center">
          <InlineLoading />
        </div>
      }
    >
      <TenderSearchClientWrapper>
        {/* GA 搜尋結果追蹤 */}
        {decodedQuery && (
          <TenderSearchTracker 
            query={decodedQuery} 
            searchType={searchType}
            totalResults={results.length} 
            hasError={!!error} 
          />
        )}
        
        <div className="space-y-8">
          <HeroSection
            title="快速查詢"
            highlightText="標案資訊"
            description="輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊"
            highlightColor="text-green-600"
          />

          <TenderSearchForm
            initialQuery={decodedQuery}
            initialType={searchType}
          />

          {decodedQuery &&
            (error ? (
              <NoSearchResults message={error} searchTerm={decodedQuery} />
            ) : (
              <TenderSearchResults
                results={results}
                totalPages={totalPages}
                currentPage={page}
                searchQuery={decodedQuery}
                searchType={searchType}
              />
            ))}

          {!decodedQuery && <FeatureSection />}
        </div>
      </TenderSearchClientWrapper>
    </Suspense>
  );
}

// 動態生成元數據
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Promise<Metadata> {
  const query = searchParams?.q || '';
  const searchType = (searchParams?.type || 'tender') as 'company' | 'tender'; // 預設為 'tender'
  const decodedQuery = decodeURIComponent(query);

  // 如果沒有查詢詞，則使用預設標題
  if (!decodedQuery) {
    return {
      title: staticTitles.tenderSearch,
      description:
        '輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊。',
    };
  }

  // 使用 getCachedTenderSearch 判斷搜尋結果
  // 只獲取第一頁的數據，這對於標題生成已經足夠
  const searchResults = await getCachedTenderSearch(
    decodedQuery,
    searchType,
    1
  );

  // 根據結果決定使用哪個標題
  const hasResults = searchResults.results.length > 0;
  const title = hasResults
    ? dynamicTitles.tenderSearchWithQueryAndType(decodedQuery, searchType)
    : dynamicTitles.tenderSearchNoResult(decodedQuery, searchType);

  return {
    title,
    description: `查看 ${decodedQuery} (${searchType === 'company' ? '廠商' : '標案'}) 的相關標案資訊、招標公告、得標資訊等完整資料。`,
  };
}
