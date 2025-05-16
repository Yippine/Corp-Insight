import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingProvider } from '@/components/common/loading/LoadingProvider';
import Script from 'next/script';
import { staticTitles } from '@/config/pageTitles';

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
  themeColor: '#ffffff'
};

// 禁用全局佈局的動態渲染，加速初始載入
export const dynamic = 'force-static';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) - 使用afterInteractive策略，確保頁面可互動後再載入 */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-PDSWJD7GMN"
          strategy="afterInteractive"
          defer
        />
        <Script 
          id="google-analytics"
          strategy="afterInteractive"
          defer
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PDSWJD7GMN');
          `}
        </Script>
        {/* 預加載關鍵資源 */}
        <link rel="preload" href="/magnifier.ico" as="image" />
        <link rel="preconnect" href="https://company.g0v.ronny.tw" />
        <link rel="dns-prefetch" href="https://company.g0v.ronny.tw" />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <LoadingProvider>
            <Header />
            <main className="flex-1 flex items-center">
              <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
                {children}
              </section>
            </main>
            <Footer />
          </LoadingProvider>
        </div>
      </body>
    </html>
  )
}
