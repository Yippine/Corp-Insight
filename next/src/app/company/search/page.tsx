import HeroSection from '@/components/HeroSection';
import CompanySearchForm from '@/components/company/CompanySearchForm';
import CompanySearchResults from '@/components/company/CompanySearchResults';
import FeatureSection from '@/components/FeatureSection';
import { fetchCompanySearch } from '@/lib/company/api';
import { CompanySearchStructuredData } from '@/components/SEO/CompanySearchSEO';
import { CompanyData, SearchParams } from '@/lib/company/types';
import CompanySearchTracker from '@/components/company/CompanySearchTracker';
import NoSearchResults from '@/components/common/NoSearchResults';
import AutoRedirect from '@/components/common/AutoRedirect';
import { redirect } from 'next/navigation';
import { Suspense, cache } from 'react';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { Metadata } from 'next';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';

interface CompanySearchPageProps {
  searchParams?: SearchParams;
}

// 設置頁面為客戶端渲染選擇性，減少服務器負擔
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-cache';

// 使用 React 的 cache 函數避免重複請求
// 這樣 generateMetadata 和 CompanySearchPage 可以共享同一個數據獲取
type CachedCompanySearchResult = {
  companies: CompanyData[];
  totalPages: number;
  error?: string | null;
};

const getCachedCompanySearch = cache(
  async (query: string, page: number): Promise<CachedCompanySearchResult> => {
    try {
      const searchResults = await fetchCompanySearch(query, page);
      return {
        ...searchResults,
        error: null,
      };
    } catch (e) {
      console.error('Company search failed:', e);
      return {
        companies: [] as CompanyData[],
        totalPages: 0,
        error:
          e instanceof Error ? e.message : '搜尋過程發生錯誤，請稍後再試。',
      };
    }
  }
);

// 靜態內容拆分為獨立組件，從而提高靜態部分復用率
const StaticHero = () => (
  <HeroSection
    title="快速查詢"
    highlightText="企業資訊"
    description="輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊"
    highlightColor="text-blue-600"
  />
);

export default async function CompanySearchPage({
  searchParams,
}: CompanySearchPageProps) {
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
    const searchResults = await getCachedCompanySearch(decodedQuery, page);
    companies = searchResults.companies;
    totalPages = searchResults.totalPages;
    error = searchResults.error || null;

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
  }

  // 將搜索結果渲染邏輯抽取出來，以保持組件簡潔
  const renderSearchResults = () => {
    if (!decodedQuery) return null;

    if (error) {
      return (
        <NoSearchResults message={error as string} searchTerm={decodedQuery} />
      );
    }

    if (companies.length === 0) {
      return (
        <NoSearchResults
          message={`查無「${decodedQuery}」相關企業資料`}
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

      {/* GA 搜尋結果追蹤 */}
      {decodedQuery && (
        <CompanySearchTracker 
          query={decodedQuery} 
          totalResults={companies.length} 
          hasError={!!error} 
        />
      )}

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
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Promise<Metadata> {
  const query = searchParams?.q || '';
  const decodedQuery = decodeURIComponent(query);

  // 如果沒有查詢詞，則使用預設標題
  if (!decodedQuery) {
    return {
      title: staticTitles.companySearch,
      description: '輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊。',
    };
  }

  // 使用 getCachedCompanySearch 判斷搜尋結果
  // 只獲取第一頁的數據，這對於標題生成已經足夠
  const searchResults = await getCachedCompanySearch(decodedQuery, 1);

  // 根據結果決定使用哪個標題
  const hasResults = searchResults.companies.length > 0;
  const title = hasResults
    ? dynamicTitles.companySearchResult(decodedQuery)
    : dynamicTitles.companySearchNoResult(decodedQuery);

  return {
    title,
    description: hasResults
      ? `查看 ${decodedQuery} 的企業資訊搜尋結果，包含公司基本資料、資本額、統一編號、負責人等詳細資訊。`
      : `查無「${decodedQuery}」相關企業資料，請調整關鍵字再試。`,
  };
}
