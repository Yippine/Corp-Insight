import { NextResponse } from 'next/server';

export async function GET() {
  // 根據環境決定基礎 URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://insight.leopilot.com'
    : 'http://localhost:3000';

  const robotsContent = `User-agent: *
Allow: /

# 企業搜尋和詳情頁面 - 高優先級
Allow: /company/
Allow: /company/search*
Allow: /company/detail/*

# 標案搜尋和詳情頁面 - 高優先級  
Allow: /tender/
Allow: /tender/search*
Allow: /tender/detail/*

# AI 工具頁面 - 中等優先級
Allow: /aitool/
Allow: /aitool/search*
Allow: /aitool/detail/*

# 靜態頁面 - 高優先級
Allow: /faq
Allow: /privacy
Allow: /feedback
Allow: /feedback/success

# API 端點不需要索引
Disallow: /api/

# Next.js 內部文件和開發資源
Disallow: /_next/
Disallow: /next.config.js
Disallow: /.well-known/

# 管理和測試頁面
Disallow: /admin/
Disallow: /test-dedup/

# 網站地圖位置
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/sitemap.xml

# 爬蟲友好設定
Crawl-delay: 1`;

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}