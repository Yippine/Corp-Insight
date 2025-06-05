import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `
# 所有用戶代理
User-agent: *

# 允許訪問所有路徑
Allow: /

# 網站地圖位置
Sitemap: https://opendata.leopilot.com/sitemap.xml
`.trim();

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
