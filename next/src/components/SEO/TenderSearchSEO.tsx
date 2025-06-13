import { Metadata } from 'next';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';

type TenderSearchSEOProps = {
  title?: string;
  description?: string;
  query?: string;
  searchType?: 'company' | 'tender';
};

export function generateTenderSearchMetadata({
  description = '輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊。',
  query,
  searchType = 'tender',
}: TenderSearchSEOProps): Metadata {
  const metaTitle = query
    ? dynamicTitles.tenderSearchWithQueryAndType(query, searchType)
    : staticTitles.tenderSearch;

  const metaDescription = query
    ? `查看 ${query} (${searchType === 'company' ? '廠商' : '標案'}) 的相關標案資訊、招標公告、得標資訊等完整資料。`
    : description;

  const url = new URL('https://insight.leopilot.com/tender/search');
  if (query) url.searchParams.set('q', query);
  if (searchType) url.searchParams.set('type', searchType);

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      url: url.toString(),
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description: metaDescription,
    },
  };
}

export function TenderSearchStructuredData({
  query,
  searchType = 'tender',
}: {
  query?: string;
  searchType?: 'company' | 'tender';
}) {
  const url = new URL('https://insight.leopilot.com/tender/search');
  if (query) url.searchParams.set('q', query);
  if (searchType) url.searchParams.set('type', searchType);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: query
      ? `${query} (${searchType === 'company' ? '廠商' : '標案'}) - 標案查詢結果`
      : '標案資訊查詢',
    description: query
      ? `查看 ${query} (${searchType === 'company' ? '廠商' : '標案'}) 的相關標案資訊、招標公告、得標資訊等完整資料。`
      : '輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊',
    url: url.toString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}