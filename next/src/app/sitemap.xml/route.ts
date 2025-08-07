import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { BASE_URL } from '@/config/site';

// MongoDB 連接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'corp-insight';

interface SitemapUrl {
  url: string;
  lastModified: string;
  changeFreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
}

export async function GET() {
  const baseUrl = BASE_URL;
  const currentDate = new Date().toISOString();

  // 靜態頁面配置
  const staticPages: SitemapUrl[] = [
    {
      url: `${baseUrl}/company/search`,
      lastModified: currentDate,
      changeFreq: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tender/search`,
      lastModified: currentDate,
      changeFreq: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aitool/search`,
      lastModified: currentDate,
      changeFreq: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/feedback/success`,
      lastModified: currentDate,
      changeFreq: 'yearly',
      priority: 0.3,
    },
  ];

  // 動態頁面 - 從資料庫獲取熱門企業和標案
  let dynamicPages: SitemapUrl[] = [];

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // 獲取熱門企業（基於搜索頻率或其他指標）
    const popularCompanies = await db
      .collection('companies')
      .find({})
      .sort({ searchCount: -1 }) // 假設有搜索計數字段
      .limit(1000) // 限制前1000家企業
      .toArray();

    // 獲取重要標案
    const importantTenders = await db
      .collection('tenders')
      .find({})
      .sort({ tenderValue: -1 }) // 按標案金額排序
      .limit(500) // 限制前500個標案
      .toArray();

    // 獲取熱門 AI 工具
    const popularAiTools = await db
      .collection('ai_tools')
      .find({})
      .sort({ usageCount: -1 }) // 按使用次數排序
      .limit(100) // 限制前100個工具
      .toArray();

    // 添加企業詳情頁面到 sitemap
    popularCompanies.forEach((company: any) => {
      if (company.taxId) {
        dynamicPages.push({
          url: `${baseUrl}/company/detail/${company.taxId}?tab=basic`,
          lastModified: company.updatedAt || currentDate,
          changeFreq: 'weekly',
          priority: 0.8,
        });
      }
    });

    // 添加標案詳情頁面到 sitemap
    importantTenders.forEach((tender: any) => {
      if (tender._id) {
        dynamicPages.push({
          url: `${baseUrl}/tender/detail/${tender._id}?tab=basic`,
          lastModified: tender.updatedAt || currentDate,
          changeFreq: 'monthly',
          priority: 0.7,
        });
      }
    });

    // 添加 AI 工具詳情頁面到 sitemap
    popularAiTools.forEach((tool: any) => {
      if (tool._id) {
        dynamicPages.push({
          url: `${baseUrl}/aitool/detail/${tool._id}`,
          lastModified: tool.updatedAt || currentDate,
          changeFreq: 'weekly',
          priority: 0.6,
        });
      }
    });

    await client.close();
  } catch (error) {
    console.error('Error fetching dynamic sitemap data:', error);
    // 如果資料庫連接失敗，只返回靜態頁面
  }

  // 合併靜態和動態頁面
  const allPages = [...staticPages, ...dynamicPages];

  // 生成 XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control':
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex', // 防止 sitemap 本身被索引
    },
  });
}
