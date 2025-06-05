import { Metadata } from 'next';
import { SearchAction, WebPage, WithContext } from 'schema-dts';
import Script from 'next/script';
import { staticTitles, dynamicTitles } from '@/config/pageTitles';

interface AiToolSearchSEOProps {
  query: string;
  tag?: string;
}

// 生成 Search 結構化數據
export function AiToolSearchStructuredData({
  query,
  tag,
}: AiToolSearchSEOProps) {
  // 創建符合 Schema.org 規範的結構化數據
  const structuredData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: getTitle(query, tag),
    description: getDescription(query, tag),
    url: `https://example.com/aitool/search${query ? `?q=${encodeURIComponent(query)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://example.com/aitool/search?q={search_term_string}',
      },
      // Schema.org類型定義中沒有query-input屬性，需要修改結構
      query: 'required name=search_term_string',
    } as SearchAction,
  };

  return (
    <Script
      id="ai-tool-search-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// 生成頁面元數據
export function generateAiToolSearchMetadata({
  query,
  tag,
  hasResults,
}: AiToolSearchSEOProps & { hasResults?: boolean }): Metadata {
  const title = getTitle(query, tag, hasResults);
  const description = getDescription(query, tag);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://example.com/aitool/search${query ? `?q=${encodeURIComponent(query)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`,
      type: 'website',
      images: [
        {
          url: 'https://example.com/images/aitool-search-og.jpg',
          width: 1200,
          height: 630,
          alt: 'AI 助理工具搜尋',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://example.com/images/aitool-search-og.jpg'],
    },
  };
}

// 幫助函數：生成標題
function getTitle(
  query: string,
  tag?: string,
  hasResults: boolean = true
): string {
  if (!hasResults) {
    return dynamicTitles.aiToolSearchNoResult(query, tag);
  }
  if (query && tag) {
    return dynamicTitles.aiToolSearchWithQueryAndTag(query, tag);
  } else if (query) {
    return dynamicTitles.aiToolSearchWithQuery(query);
  } else if (tag) {
    return dynamicTitles.aiToolSearchWithTag(tag);
  } else {
    return staticTitles.aiToolSearch;
  }
}

// 幫助函數：生成描述
function getDescription(query: string, tag?: string): string {
  if (query && tag) {
    return `探索「${tag}」類別中與「${query}」相關的 AI 助理工具。提升工作效率，優化工作流程，讓 AI 為您助力。`;
  } else if (query) {
    return `查找與「${query}」相關的 AI 助理工具。我們精選的智能助理工具可幫助您提高生產力和解決各類問題。`;
  } else if (tag) {
    return `瀏覽「${tag}」類別的 AI 助理工具。發現專為您的需求打造的智能解決方案，提升工作效率。`;
  } else {
    return `探索我們豐富的 AI 助理工具集，助您提升工作效率，解決專業難題。各種業務場景的智能工作流程解決方案。`;
  }
}
