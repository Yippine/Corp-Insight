import { Metadata } from 'next';
import TenderDetail from '@/components/tender/TenderDetail';
import { staticTitles, dynamicTitles } from '@/config/pageTitles';

interface TenderDetailPageProps {
  params: {
    tenderId: string;
  };
}

export async function generateMetadata({ params }: TenderDetailPageProps): Promise<Metadata> {
  try {
    const { tenderId } = params;
    const firstUnderscoreIndex = tenderId.indexOf('_');
    const unitId = tenderId.substring(0, firstUnderscoreIndex);
    const jobNumber = tenderId.substring(firstUnderscoreIndex + 1);

    // 獲取標案基本資訊以用於 SEO
    const response = await fetch(
      `https://pcc.g0v.ronny.tw/api/tender?unit_id=${unitId}&job_number=${jobNumber}`,
      { next: { revalidate: 86400 } } // 一天重新驗證一次
    );

    if (!response.ok) {
      return {
        title: staticTitles.tenderDetailError,
        description: '您所查詢的標案資料不存在或發生錯誤。'
      };
    }

    const data = await response.json();
    const latestRecord = data.records[data.records.length - 1];
    
    return {
      title: dynamicTitles.tenderDetailWithName(latestRecord.brief.title),
      description: `查看 ${latestRecord.brief.title} 的詳細標案資訊，包含基本資料、投標廠商、履約進度等完整內容。招標機關：${data.unit_name || '未提供'}。`,
      alternates: {
        canonical: `/tender/detail/${tenderId}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata for tender detail:', error);
    return {
      title: staticTitles.tenderDetailError,
      description: '載入標案詳情時發生錯誤，請稍後再試。'
    };
  }
}

export default function TenderDetailPage({ params }: TenderDetailPageProps) {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <TenderDetail tenderId={params.tenderId} />
    </div>
  );
}