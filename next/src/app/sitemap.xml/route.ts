import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://opendata.leopilot.com';

  // 創建網站地圖的頁面列表
  const pages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/company/search`,
      lastModified: new Date().toISOString(),
      changeFreq: 'hourly',
      priority: 0.9,
    },
    // 你可以添加更多靜態頁面
  ];

  // 可以在此處添加邏輯來獲取熱門企業或標案並將其添加到網站地圖中
  // 例如熱門企業詳情頁

  // 生成 XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(page => {
      return `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${page.lastModified}</lastmod>
      <changefreq>${page.changeFreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `;
    })
    .join('')}
</urlset>
`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
      // 設置緩存控制
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}