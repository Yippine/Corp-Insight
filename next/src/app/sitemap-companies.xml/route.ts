import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'business-magnifier';

export async function GET() {
  const baseUrl = 'https://insight.leopilot.com';
  const currentDate = new Date().toISOString();
  
  let companies: any[] = [];
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // 獲取所有有效企業（分批處理大量數據）
    companies = await db.collection('companies')
      .find({
        taxId: { $exists: true, $ne: null },
        // 可以添加其他過濾條件，如企業狀態等
      })
      .sort({ 
        searchCount: -1, // 優先顯示熱門企業
        updatedAt: -1 
      })
      .limit(50000) // 限制 sitemap 大小，避免過大
      .toArray();

    await client.close();
  } catch (error) {
    console.error('Error fetching companies for sitemap:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        headers: {
          'Content-Type': 'text/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }

  // 生成企業 sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${companies
    .map(company => `  <url>
    <loc>${baseUrl}/company/detail/${company.taxId}</loc>
    <lastmod>${company.updatedAt || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=7200, s-maxage=7200, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex',
    },
  });
}