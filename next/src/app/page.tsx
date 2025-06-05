import { staticTitles } from '@/config/pageTitles';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: staticTitles.home,
  description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
  openGraph: {
    title: staticTitles.home,
    description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
    url: 'https://opendata.leopilot.com',
  },
};

// 使用靜態渲染配置，提高首次載入速度
export const dynamic = 'force-static';
export const revalidate = false;

// 使用簡化的重定向方式
export default function HomePage() {
  // 在這裡直接進行重定向
  redirect('/company/search');
}
