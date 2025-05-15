import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingProvider } from '@/components/common/loading/LoadingProvider';
import Script from 'next/script';
import WebVitalsReporter from '@/components/WebVitalsReporter';

export const metadata: Metadata = {
  title: '企業放大鏡™ | 企業資訊查詢平台',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-PDSWJD7GMN"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-PDSWJD7GMN');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <WebVitalsReporter />
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
