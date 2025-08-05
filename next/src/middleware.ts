import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAiToolsDomain, SITE_CONFIG } from '@/config/site';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const originalHost = request.headers.get('x-original-host') || host;

  // 將原始域名資訊傳遞給應用
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-original-host', originalHost);

  // 如果是 aitools 域名但訪問的不是工具相關路徑，重定向到主域名
  const isAiToolsPath = pathname.startsWith('/search') || 
                       pathname.startsWith('/detail') || 
                       pathname.startsWith('/aitool') ||
                       pathname.startsWith('/api/aitool') || 
                       pathname.startsWith('/api/gemini') || 
                       pathname.startsWith('/api/prompt') ||
                       pathname.startsWith('/api/feedback') ||
                       pathname.startsWith('/_next') ||
                       pathname.startsWith('/faq') ||
                       pathname.startsWith('/feedback') ||
                       pathname.startsWith('/privacy') ||
                       pathname === '/';
                       
  if (isAiToolsDomain(originalHost) && !isAiToolsPath) {
    const mainDomain = SITE_CONFIG.main.domain;
    const mainUrl = `${mainDomain}${pathname}${search}`;
    return NextResponse.redirect(mainUrl, 301);
  }

  // 如果是主域名訪問 /aitool/*，重定向到 aitools 域名
  if (!isAiToolsDomain(originalHost) && pathname.startsWith('/aitool')) {
    const aiToolsDomain = SITE_CONFIG.aitools.domain;
    const aiToolsUrl = `${aiToolsDomain}${pathname.replace('/aitool', '')}${search}`;
    return NextResponse.redirect(aiToolsUrl, 301);
  }

  // 其他請求正常處理
  return NextResponse.next({
    headers: requestHeaders,
  });
}

// 配置 middleware 運行的路徑
export const config = {
  matcher: [
    // 匹配所有路徑，除了靜態資源
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|assets).*)',
  ],
};