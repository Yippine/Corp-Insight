import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import SitemapManager from '@/components/SitemapManager';
import { staticTitles } from '@/config/pageTitles';
import { Suspense } from 'react';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

export const metadata: Metadata = {
  title: staticTitles.adminSitemapTest,
  description: '監控、測試和管理網站地圖配置，確保搜索引擎優化設定完美運作。',
  robots: 'noindex, nofollow', // 管理頁面不需要被索引
};

export const dynamic = 'force-dynamic';

export default function SitemapTestPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section - 遵循其他頁面的風格 */}
      <HeroSection
        title="Sitemap "
        highlightText="管理中心"
        description="監控、測試和管理網站地圖配置，確保搜索引擎優化設定完美運作"
        highlightColor="text-emerald-600"
      />
      
      {/* Sitemap Manager - 現在會是新的設計 */}
      <Suspense fallback={<InlineLoading />}>
        <SitemapManager />
      </Suspense>
    </div>
  );
}