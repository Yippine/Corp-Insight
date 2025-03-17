import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import CompanyDetailContent from '@/components/company/CompanyDetailContent';
import { fetchCompanyDetail } from '@/lib/company/api';
import { generateCompanyDetailMetadata, CompanyDetailStructuredData } from '@/components/SEO/CompanyDetailSEO';

export const dynamic = 'force-dynamic';

interface CompanyDetailPageProps {
  params: {
    taxId: string;
  };
  searchParams: {
    tab?: string;
  };
}

// 獲取公司資料的輔助函數 (使用 cache 避免重複獲取)
const getCompanyData = cache(async (taxId: string) => {
  try {
    const companyData = await fetchCompanyDetail(taxId);
    if (!companyData) return null;
    return companyData;
  } catch (error) {
    console.error('載入公司資料時發生錯誤：', error);
    return null;
  }
});

// SEO 動態元數據
export async function generateMetadata({ params }: CompanyDetailPageProps): Promise<Metadata> {
  const { taxId } = params;
  const companyData = await getCompanyData(taxId);
  
  // 使用專用的SEO元數據生成函數
  return generateCompanyDetailMetadata(companyData);
}

export default async function CompanyDetailPage({ params, searchParams }: CompanyDetailPageProps) {
  const { taxId } = params;
  const { tab = 'basic' } = searchParams;
  
  // 使用相同的獲取函數
  const companyData = await getCompanyData(taxId);
  
  if (!companyData) {
    notFound();
  }
  
  // 傳遞頁籤名稱而非圖標組件
  const tabs = [
    { id: 'basic', name: '基本資料', icon: 'Building2' },
    { id: 'financial', name: '財務概況', icon: 'BarChart3' },
    { id: 'directors', name: '核心成員', icon: 'Users' },
    { id: 'tenders', name: '標案資料', icon: 'FileText' },
  ];
  
  return (
    <>
      <CompanyDetailStructuredData companyData={companyData} />
      
      <CompanyDetailContent 
        companyData={companyData} 
        activeTab={tab}
        tabs={tabs}
      />
    </>
  );
}