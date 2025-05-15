import HeroSection from '@/components/HeroSection';
import CompanySearchForm from '@/components/company/CompanySearchForm';
import CompanySearchResults from '@/components/company/CompanySearchResults';
import FeatureSection from '@/components/FeatureSection';
import { fetchCompanySearch } from '@/lib/company/api';
import { generateCompanySearchMetadata, CompanySearchStructuredData } from '@/components/SEO/CompanySearchSEO';
import { CompanyData, SearchParams } from '@/lib/company/types';
import NoSearchResults from '@/components/common/NoSearchResults';
import AutoRedirect from '@/components/common/AutoRedirect';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

interface CompanySearchPageProps {
  searchParams?: SearchParams;
}

// 設置頁面為客戶端渲染選擇性，減少服務器負擔
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-cache';

// 靜態內容拆分為獨立組件，從而提高靜態部分復用率
const StaticHero = () => (
  <HeroSection 
    title="快速查詢"
    highlightText="企業資訊"
    description="輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊"
    highlightColor="text-blue-600"
  />
);

export default async function CompanySearchPage({ searchParams }: CompanySearchPageProps) {
  const query = searchParams?.q || '';
  const page = parseInt(searchParams?.page || '1') || 1;
  const decodedQuery = decodeURIComponent(query);
  const disableAutoRedirect = searchParams?.noRedirect === 'true';
  const forceAutoRedirect = searchParams?.autoRedirect === 'true';
  
  // 默認狀態（尚未搜尋）
  let companies: CompanyData[] = [];
  let totalPages = 0;
  let error: string | null = null;
  let shouldClientRedirect = false;
  let redirectUrl = '';
  let isSingleResult = false;
  
  // 只有當有搜尋查詢時才執行搜索
  if (decodedQuery) {
    try {
      const searchResults = await fetchCompanySearch(decodedQuery, page);
      companies = searchResults.companies;
      totalPages = searchResults.totalPages;
      isSingleResult = companies.length === 1;
      
      // 如果設置了強制自動跳轉標誌，我們進行搜尋並直接伺服器端重定向
      if (forceAutoRedirect && isSingleResult) {
        redirect(`/company/detail/${encodeURIComponent(companies[0].taxId)}`);
      }
      
      // 如果僅有一個搜尋結果且未禁用自動跳轉，則設置客戶端重定向標誌
      if (isSingleResult && !disableAutoRedirect) {
        shouldClientRedirect = true;
        redirectUrl = `/company/detail/${encodeURIComponent(companies[0].taxId)}`;
      }
    } catch (e) {
      console.error('Search failed:', e);
      error = e instanceof Error ? e.message : '搜尋過程發生錯誤，請稍後再試。';
    }
  }

  // 將搜索結果渲染邏輯抽取出來，以保持組件簡潔
  const renderSearchResults = () => {
    if (!decodedQuery) return null;
    
    if (error) {
      return (
        <NoSearchResults 
          message={error as string}
          searchTerm={decodedQuery}
        />
      );
    }
    
    if (!isSingleResult) {
      return (
        <CompanySearchResults 
          companies={companies}
          totalPages={totalPages}
          currentPage={page}
          searchQuery={decodedQuery}
        />
      );
    }
    
    return null;
  };

  return (
    <>
      {/* SEO 數據標記 */}
      <CompanySearchStructuredData query={decodedQuery} />
      
      {/* 自動跳轉處理 */}
      {shouldClientRedirect && <AutoRedirect url={redirectUrl} />}
      
      <div className="space-y-8">
        {/* 靜態內容永遠快速顯示 */}
        <StaticHero />
        
        {/* 搜索表單 */}
        <CompanySearchForm 
          initialQuery={decodedQuery}
          disableAutoRedirect={disableAutoRedirect}
          isSingleResult={isSingleResult}
        />
        
        {/* 搜索結果 */}
        <Suspense fallback={<InlineLoading />}>
          {renderSearchResults()}
        </Suspense>
        
        {/* 未搜索時顯示功能介紹 */}
        {!decodedQuery && <FeatureSection />}
      </div>
    </>
  );
}

// 動態生成元數據，以便在伺服器端渲染時反映搜尋查詢
export async function generateMetadata({ searchParams }: { searchParams?: SearchParams }) {
  const query = searchParams?.q || '';
  const decodedQuery = decodeURIComponent(query);
  
  return generateCompanySearchMetadata({
    query: decodedQuery
  });
}