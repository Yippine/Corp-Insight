import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'business-magnifier';

export async function GET() {
  const baseUrl = 'https://insight.leopilot.com';
  const currentDate = new Date().toISOString();
  
  let aiTools: any[] = [];
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // 獲取所有 AI 工具
    aiTools = await db.collection('ai_tools')
      .find({
        _id: { $exists: true },
        // 可以添加過濾條件，如工具狀態等
        status: { $in: ['active', 'published'] }
      })
      .sort({ 
        usageCount: -1, // 按使用次數排序
        rating: -1,     // 按評分排序
        updatedAt: -1 
      })
      .limit(5000) // AI 工具數量相對較少
      .toArray();

    await client.close();
  } catch (error) {
    console.error('Error fetching AI tools for sitemap:', error);
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

  // 生成 AI 工具 sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${aiTools
    .map(tool => `  <url>
    <loc>${baseUrl}/aitool/detail/${tool._id}</loc>
    <lastmod>${tool.updatedAt || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
    .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=10800, s-maxage=10800, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex',
    },
  });
}