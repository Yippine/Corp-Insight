import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
// import { SitemapCollector } from '../src/services/SitemapCollector';

async function generateSitemap() {
  // 基本路由
  const baseUrls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/company/search', changefreq: 'daily', priority: 0.9 },
    { url: '/tender/search', changefreq: 'daily', priority: 0.9 },
    { url: '/aitool/search', changefreq: 'daily', priority: 0.9 },
    { url: '/faq', changefreq: 'monthly', priority: 0.7 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.7 },
    { url: '/feedback', changefreq: 'monthly', priority: 0.7 }
  ];

  // 獲取已訪問的動態頁面
  // const visitedUrls = await SitemapCollector.getAllVisitedUrls();

  // 合併所有路由
  const urls = [...baseUrls];
  // const urls = [...baseUrls, ...visitedUrls];

  // 創建 sitemap
  const stream = new SitemapStream({ hostname: 'https://opendata.leopilot.com' });
  const data = Readable.from(urls).pipe(stream);

  // 寫入文件
  await streamToPromise(data).then((sitemap) => 
    createWriteStream('./public/sitemap.xml').write(sitemap)
  );
}

generateSitemap().catch(console.error);