import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAiToolsDomain, SITE_CONFIG } from './src/config/site';

export function middleware(request: NextRequest) {
  // 處理預檢請求
  if (request.method === 'OPTIONS') {
    const optionsResponse = new NextResponse(null, { status: 200 });
    setCorsHeaders(optionsResponse, request);
    return optionsResponse;
  }

  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const originalHost = request.headers.get('x-original-host') || host;

  // 將原始域名資訊傳遞給應用
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-original-host', originalHost);

  // 環境檢測
  const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 🏠 dev-local 環境：網域和路由都不變，/aitool/* 正常使用
  if (isDevelopment) {
    const response = NextResponse.next({
      headers: requestHeaders,
    });
    setCorsHeaders(response, request);
    return response;
  }

  // 🔧🌐 prod-local 和 prod-production 環境：封鎖 /aitool/* 路徑
  if (pathname.startsWith('/aitool/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 🔧 prod-local 環境：只做封鎖，其他請求正常處理
  if (isLocalProd) {
    const response = NextResponse.next({
      headers: requestHeaders,
    });
    setCorsHeaders(response, request);
    return response;
  }

  // 🌐 prod-production 環境：跨域重定向邏輯

  // 如果是 aitools 域名但訪問的不是工具相關路徑，重定向到主域名
  const isAiToolsPath =
    pathname.startsWith('/search') ||
    pathname.startsWith('/detail') ||
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

  // 其他請求正常處理，添加 CORS 頭
  const response = NextResponse.next({
    headers: requestHeaders,
  });
  setCorsHeaders(response, request);
  return response;
}

function setCorsHeaders(response: NextResponse, request: NextRequest) {
  // 配置允許的域名
  const origin = request.headers.get('origin') || '';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const allowedOrigins = [
    'http://localhost:3000', // 允許本地開發環境
  ];

  if (siteUrl) {
    allowedOrigins.push(siteUrl);
    // 如果是 https，也允許 http 版本，增加靈活性
    if (siteUrl.startsWith('https')) {
      allowedOrigins.push(siteUrl.replace('https://', 'http://'));
    }
  }

  // 如果來源在允許列表中，設置 CORS 頭
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // 對於開發環境，可以允許所有來源
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  // 設置其他 CORS 頭
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, rsc, next-router-state-tree, next-url, next-router-prefetch'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 小時
}

// 配置 middleware 運行的路徑
export const config = {
  matcher: [
    // 匹配所有路徑，除了靜態資源
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|assets).*)',
  ],
};
