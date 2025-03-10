import HeroSection from '@/components/HeroSection';
import CompanySearchForm from '@/components/company/CompanySearchForm';
import CompanySearchResults from '@/components/company/CompanySearchResults';
import FeatureSection from '@/components/FeatureSection';
import { fetchCompanySearch } from '@/lib/company/utils';
import { generateMetadata as generateSeoMetadata, CompanySearchStructuredData } from '@/components/SEO/CompanySearchSEO';
import { CompanyData, SearchParams } from '@/lib/company/types';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import NoSearchResults from '@/components/common/NoSearchResults';

interface CompanySearchPageProps {
  searchParams?: SearchParams;
}

export default async function CompanySearchPage({ searchParams }: CompanySearchPageProps) {
  const query = searchParams?.q || '';
  const page = parseInt(searchParams?.page || '1') || 1;
  const decodedQuery = decodeURIComponent(query);
  
  // 默認狀態（尚未搜尋）
  let companies: CompanyData[] = [];
  let totalPages = 0;
  let isSearching = false;
  let error: string | null = null;
  
  // 如果有搜尋查詢，則執行搜索
  if (decodedQuery) {
    isSearching = true;
    try {
      const searchResults = await fetchCompanySearch(decodedQuery, page);
      companies = searchResults.companies;
      totalPages = searchResults.totalPages;
      isSearching = false;
    } catch (e) {
      console.error('Search failed:', e);
      error = e instanceof Error ? e.message : '搜尋過程發生錯誤，請稍後再試。';
      isSearching = false;
    }
  }

  return (
    <>
      {/* 結構化數據標記 */}
      <CompanySearchStructuredData query={decodedQuery} />
      
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection 
          title="快速查詢"
          highlightText="企業資訊"
          description="輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊"
          highlightColor="text-blue-600"
        />

        <CompanySearchForm initialQuery={decodedQuery} />
        
        {decodedQuery && (
          isSearching ? (
            <div className="py-8">
              <InlineLoading />
            </div>
          ) : error ? (
            <NoSearchResults 
              message={error}
              searchTerm={decodedQuery}
            />
          ) : (
            <CompanySearchResults 
              companies={companies}
              totalPages={totalPages}
              currentPage={page}
              searchQuery={decodedQuery}
            />
          )
        )}
        
        {!decodedQuery && <FeatureSection />}
      </div>
    </>
  );
}

// 動態生成元數據，以便在伺服器端渲染時反映搜尋查詢
export async function generateMetadata({ searchParams }: { searchParams?: SearchParams }) {
  const query = searchParams?.q || '';
  const decodedQuery = decodeURIComponent(query);
  
  return generateSeoMetadata({
    query: decodedQuery
  });
}