import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { BASE_URL } from '@/config/site';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'business-magnifier';

export const dynamic = 'force-dynamic'; // 强制動態渲染

export async function GET() {
  const baseUrl = BASE_URL;
  const currentDate = new Date().toISOString();
  
  let tenders: any[] = [];
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // 獲取重要標案
    tenders = await db.collection('tenders')
      .find({
        _id: { $exists: true },
        // 可以添加過濾條件，如標案狀態、金額範圍等
        status: { $in: ['active', 'open', 'published'] }
      })
      .sort({ 
        tenderValue: -1, // 按標案金額排序
        publishDate: -1,  // 或按發布日期排序
        updatedAt: -1 
      })
      .limit(25000) // 限制 sitemap 大小
      .toArray();

    await client.close();
  } catch (error) {
    console.error('Error fetching tenders for sitemap:', error);
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

  // 生成標案 sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tenders
    .map(tender => `  <url>
    <loc>${baseUrl}/tender/detail/${tender._id}</loc>
    <lastmod>${tender.updatedAt || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex',
    },
  });
}