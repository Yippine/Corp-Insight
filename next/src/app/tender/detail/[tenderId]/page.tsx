import { Metadata } from 'next';
import TenderDetail from '@/components/tender/TenderDetail';
import { staticTitles, dynamicTitles } from '@/config/pageTitles';
import { getCachedApiData, setCachedApiData } from '@/lib/mongodbUtils';

interface TenderDetailPageProps {
  params: {
    tenderId: string;
  };
}

const PCC_API_CACHE_COLLECTION = 'pcc_api_cache';
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 小時

export async function generateMetadata({ params }: TenderDetailPageProps): Promise<Metadata> {
  try {
    const { tenderId } = params;
    const firstUnderscoreIndex = tenderId.indexOf('_');
    const unitId = tenderId.substring(0, firstUnderscoreIndex);
    const jobNumber = tenderId.substring(firstUnderscoreIndex + 1);

    const apiUrl = `https://pcc.g0v.ronny.tw/api/tender?unit_id=${unitId}&job_number=${jobNumber}`;
    const apiKey = apiUrl;

    let data: any; // 宣告 data 變數於 try 外部，使其可在 try-catch-finally 中被存取

    // 1. 嘗試從 MongoDB 快取獲取資料
    const cachedData = await getCachedApiData<any>(PCC_API_CACHE_COLLECTION, apiKey);
    if (cachedData) {
      data = cachedData;
    } else {
      // 2. 若快取未命中，則發送 API 請求
      const response = await fetch(apiUrl,
        // { next: { revalidate: 86400 } } // Next.js revalidate 由我們的快取機制取代
      );

      if (!response.ok) {
        return {
          title: staticTitles.tenderDetailError,
          description: '您所查詢的標案資料不存在或發生錯誤。'
        };
      }
      data = await response.json();
      // 3. 將獲取的資料存入 MongoDB 快取
      if (data) {
        await setCachedApiData(PCC_API_CACHE_COLLECTION, apiKey, data, CACHE_TTL_SECONDS);
      }
    }

    if (!data || !data.records || data.records.length === 0) {
      return {
          title: staticTitles.tenderDetailError,
          description: '查無標案資料或資料格式錯誤。'
      };
    }

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