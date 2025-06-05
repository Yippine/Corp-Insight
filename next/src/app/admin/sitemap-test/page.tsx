import HeroSection from '@/components/HeroSection';
import SitemapManager from '@/components/SitemapManager';

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
      <SitemapManager />
    </div>
  );
}

export const metadata = {
  title: 'Sitemap 管理中心 | Business Magnifier',
  description: '監控、測試和管理網站地圖配置，確保搜索引擎優化設定完美運作。',
  robots: 'noindex, nofollow', // 管理頁面不需要被索引
};