import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyDetailContent from '@/components/company/CompanyDetailContent';
import { fetchCompanyDetail } from '@/lib/company/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    taxId: string;
  };
  searchParams: {
    tab?: string;
  };
}

// SEO 動態元數據
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { taxId } = params;
  
  try {
    const companyData = await fetchCompanyDetail(taxId);
    
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
  } catch (error) {
    console.error('載入元數據時發生錯誤：', error);
    return {
      title: '企業資訊 | 企業放大鏡™',
      description: '查看完整的企業資訊，包含基本資料、財務概況、核心成員和相關標案等詳細內容。'
    };
  }
}

export default async function CompanyDetailPage({ params, searchParams }: PageProps) {
  const { taxId } = params;
  const { tab = 'basic' } = searchParams;
  
  try {
    const companyData = await fetchCompanyDetail(taxId);
    
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
      <CompanyDetailContent 
        companyData={companyData} 
        activeTab={tab}
        tabs={tabs}
      />
    );
  } catch (error) {
    console.error('載入公司資料時發生錯誤：', error);
    notFound();
  }
}