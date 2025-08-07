import { Metadata } from 'next';
import Script from 'next/script';
import type { Tools } from '@/lib/aitool/types';
import { dynamicTitles } from '@/config/pageTitles';

interface AiToolDetailSEOProps {
  tool: Tools;
}

// 生成工具詳情頁的結構化數據
export function AiToolDetailStructuredData({ tool }: AiToolDetailSEOProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'AI Tool',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Corp Insight',
      url: 'https://magnifier.tw',
    },
  };

  return (
    <Script
      id="ai-tool-detail-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// 生成工具詳情頁的元數據
export function generateAiToolDetailMetadata({
  tool,
}: AiToolDetailSEOProps): Metadata {
  const title = dynamicTitles.aiToolDetail(tool.name);
  const description =
    tool.description ||
    `使用 ${tool.name} 來提升您的工作效率。這是一個強大的 AI 工具，專為現代職場設計。`;

  return {
    title,
    description,
    keywords: [tool.name, ...(tool.tags || [])].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/aitool/detail/${tool.id}`,
      siteName: 'Corp Insight',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/aitool/detail/${tool.id}`,
    },
  };
}
