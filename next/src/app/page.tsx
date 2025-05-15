import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '企業放大鏡™ | Business Magnifier',
  description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
  openGraph: {
    title: '企業放大鏡™ | Business Magnifier',
    description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
    url: 'https://opendata.leopilot.com',
  },
};

// 使用靜態重定向，效能更好
export const dynamic = 'force-static';

export default function HomePage() {
  // 使用服務器端重定向，避免初始載入延遲
  redirect('/company/search');
}