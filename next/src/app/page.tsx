import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '企業資訊搜尋平台 | Business Magnifier',
  description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
  keywords: ['企業查詢', '標案資訊', '企業資料', '商業情報'],
  openGraph: {
    title: '企業資訊搜尋平台 | Business Magnifier',
    description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
    type: 'website',
    url: 'https://opendata.leopilot.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function HomePage() {
  redirect('/company/search');
}