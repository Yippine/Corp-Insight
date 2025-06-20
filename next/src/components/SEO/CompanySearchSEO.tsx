import { Metadata } from 'next';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';
import { BASE_URL } from '@/config/site';

type CompanySearchSEOProps = {
  title?: string;
  description?: string;
  query?: string;
};

export function generateCompanySearchMetadata({
  description = '輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊',
  query,
}: CompanySearchSEOProps): Metadata {
  const metaTitle = query
    ? dynamicTitles.companySearchResult(query)
    : staticTitles.companySearch;

  const metaDescription = query
    ? `查看 ${query} 的企業資訊搜尋結果，包含公司基本資料、資本額、統一編號、負責人等詳細資訊。`
    : description;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      url: query
        ? `${BASE_URL}/company/search?q=${encodeURIComponent(query)}`
        : `${BASE_URL}/company/search`,
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description: metaDescription,
    },
  };
}

export function CompanySearchStructuredData({ query }: { query?: string }) {
  // 創建搜尋頁面的結構化數據
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: query ? `${query} - 企業資訊查詢結果` : '企業資訊查詢',
    description: query
      ? `查看 ${query} 的企業資訊搜尋結果，包含公司基本資料、資本額、統一編號、負責人等詳細資訊。`
      : '輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊',
    url: query
      ? `${BASE_URL}/company/search?q=${encodeURIComponent(query)}`
      : `${BASE_URL}/company/search`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
