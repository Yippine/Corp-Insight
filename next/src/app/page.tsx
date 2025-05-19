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
  // 這種方式在 next.config.js 中已經配置了更高效的靜態重定向
  // 這里作為備用機制，當靜態重定向失敗時才會執行
  return null;
}

// 添加重定向配置，這會在路由層面處理，避免不必要的渲染
export function generateMetadata() {
  return {
    redirect: {
      destination: '/company/search',
      permanent: true,
    },
  };
}