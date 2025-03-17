import { Metadata } from 'next';
import { CompanyData } from '@/lib/company/types';

export function generateCompanyDetailMetadata(
  companyData?: CompanyData | null
): Metadata {
  if (!companyData) {
    return {
      title: '找不到公司資料 | 企業放大鏡™',
      description: '您所查詢的企業資料不存在或暫時無法獲取。'
    };
  }

  return {
    title: `${companyData.name} - 企業資訊 | 企業放大鏡™`,
    description: `查看 ${companyData.name} 的詳細企業資訊，包含基本資料、財務概況、核心成員和相關標案等完整資訊。統一編號：${companyData.taxId}。`,
    keywords: [companyData.name, '企業資訊', '公司詳細資料', '企業放大鏡', companyData.taxId],
    openGraph: {
      title: `${companyData.name} - 企業資訊 | 企業放大鏡™`,
      description: `查看 ${companyData.name} 的詳細企業資訊，包含基本資料、財務概況、核心成員和相關標案等完整資訊。統一編號：${companyData.taxId}。`,
      url: `https://business-magnifier.vercel.app/company/detail/${companyData.taxId}`,
      type: 'website',
    }
  };
}

// 結構化資料標記組件
export function CompanyDetailStructuredData({ companyData }: { companyData: CompanyData }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyData.name,
    identifier: companyData.taxId,
    url: `https://business-magnifier.vercel.app/company/detail/${companyData.taxId}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}