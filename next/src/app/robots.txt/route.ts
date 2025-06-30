import { NextResponse } from 'next/server';
import { BASE_URL } from '@/config/site';

export async function GET() {
  const baseUrl = BASE_URL;

  const robotsContent = `User-agent: *
Allow: /

# 忽略特定檔案和目錄
Disallow: /_next/
Disallow: /public/
Disallow: /src/
Disallow: /docker/
Disallow: /legacy/
Disallow: /node_modules/
Disallow: /.next/
Disallow: /.vercel/
Disallow: /.well-known/

# 管理和測試頁面
Disallow: /admin/

# 允許存取 Sitemap
Allow: /sitemap-index.xml
Allow: /sitemap.xml
Allow: /sitemap-companies.xml
Allow: /sitemap-tenders.xml
Allow: /sitemap-aitools.xml

Disallow: /api/

# 網站地圖位置
Sitemap: ${baseUrl}/sitemap-index.xml

# 爬蟲友好設定
Crawl-delay: 1`;

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=43200', // 12 小時快取
    },
  });
}