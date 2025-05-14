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
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

interface TenderSearchPageProps {
  searchParams?: SearchParams;
}

export default async function TenderSearchPage({ searchParams }: TenderSearchPageProps) {
  const query = searchParams?.q || '';
  const searchType = (searchParams?.type || 'company') as 'company' | 'tender';
  const page = parseInt(searchParams?.page || '1') || 1;
  const decodedQuery = decodeURIComponent(query);
  
  // 默認狀態
  let results: TenderSearchResult[] = [];
  let totalPages = 0;
  let isSearching = false;
  let error: string | null = null;
  
  // 如果有搜尋查詢，則執行搜索
  if (decodedQuery) {
    isSearching = true;
    try {
      const searchResults = await fetchTenderSearch(decodedQuery, searchType, page);
      results = searchResults.results;
      totalPages = searchResults.totalPages;
      isSearching = false;
    } catch (e) {
      console.error('Search failed:', e);
      error = e instanceof Error ? e.message : '搜尋過程發生錯誤，請稍後再試。';
      isSearching = false;
    }
  }

  return (
    <Suspense fallback={<div className="w-full h-full min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,80px))] flex justify-center items-center">
      <InlineLoading />
    </div>}>
      <TenderSearchClientWrapper>
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
          
          {decodedQuery && (
            error ? (
              <NoSearchResults 
                message={error}
                searchTerm={decodedQuery}
              />
            ) : (
              <TenderSearchResults 
                results={results}
                totalPages={totalPages}
                currentPage={page}
                searchQuery={decodedQuery}
                searchType={searchType}
              />
            )
          )}
          
          {!decodedQuery && <FeatureSection />}
        </div>
      </TenderSearchClientWrapper>
    </Suspense>
  );
}

// 動態生成元數據
export async function generateMetadata({ searchParams }: { searchParams?: SearchParams }): Promise<Metadata> {
  const query = searchParams?.q || '';
  const decodedQuery = decodeURIComponent(query);
  
  return {
    title: decodedQuery 
      ? `${decodedQuery} - 標案資訊查詢 | 企業放大鏡™` 
      : '標案資訊查詢 | 企業放大鏡™',
    description: decodedQuery
      ? `查看 ${decodedQuery} 的相關標案資訊、招標公告、得標資訊等完整資料。`
      : '輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊。'
  };
}