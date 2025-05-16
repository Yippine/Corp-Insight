import { Metadata } from "next";
import { SoftwareApplication, WithContext } from "schema-dts";
import Script from "next/script";
import { Tools } from "@/lib/aitool/tools";
import { staticTitles, dynamicTitles } from '@/config/pageTitles';

interface AiToolDetailSEOProps {
  tool: Tools;
}

// 生成工具詳情頁的結構化數據
export function AiToolDetailStructuredData({ tool }: AiToolDetailSEOProps) {
  const structuredData: WithContext<SoftwareApplication> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": tool.tags.join(", "),
    "operatingSystem": "Web",
    "url": `https://example.com/aitool/detail/${tool.id}`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TWD"
    }
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
export function generateAiToolDetailMetadata({ tool }: AiToolDetailSEOProps): Metadata {
  const title = dynamicTitles.aiToolDetail(tool.name);
  const description = `${tool.description} 立即使用這個強大的 AI 助理工具，提升您的工作效率。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://example.com/aitool/detail/${tool.id}`,
      type: 'website',
      images: [
        {
          url: 'https://example.com/images/aitool-og.jpg',
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://example.com/images/aitool-og.jpg'],
    },
  };
}