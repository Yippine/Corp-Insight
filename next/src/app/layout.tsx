import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '企業資訊搜尋平台 | 商業透視鏡',
  description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業資料庫',
  authors: [{ name: '商業透視鏡團隊' }],
  keywords: ['企業查詢', '公司資料', '統一編號', '企業資訊', '商業情報'],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
