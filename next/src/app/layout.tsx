import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingProvider } from '@/components/common/loading/LoadingProvider';
import Script from 'next/script';
import { staticTitles } from '@/config/pageTitles';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import GoogleAnalyticsDebug from '@/components/GoogleAnalyticsDebug';
import WebVitalsTracker from '@/components/WebVitalsTracker';

export const metadata: Metadata = {
  title: staticTitles.home,
  description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業資料庫',
  authors: [{ name: '國眾電腦 AI 團隊' }],
  keywords: ['企業查詢', '公司資料', '統一編號', '企業資訊', '商業情報'],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/magnifier.ico',
  },
};

// 優化移動設備體驗
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

// 禁用全局佈局的動態渲染，加速初始載入
export const dynamic = 'force-static';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* 預加載關鍵資源 */}
        <link rel="preload" href="/magnifier.ico" as="image" />
        <link rel="preconnect" href="https://company.g0v.ronny.tw" />
        <link rel="dns-prefetch" href="https://company.g0v.ronny.tw" />
      </head>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <GoogleAnalyticsDebug />
        <WebVitalsTracker />
        <div className="flex min-h-screen flex-col bg-gray-50">
          <LoadingProvider>
            <Header />
            <main className="flex flex-1 items-center">
              <section className="mx-auto w-full max-w-7xl overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </section>
            </main>
            <Footer />
          </LoadingProvider>
        </div>
      </body>
    </html>
  );
}
