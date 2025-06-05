import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 配置 CORS
export function middleware(request: NextRequest) {
  // 獲取當前響應
  const response = NextResponse.next();

  // 配置允許的域名
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://insight.leopilot.com',
    'http://insight.leopilot.com',
    'http://localhost:3000',
  ];

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
    'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 小時

  // 處理預檢請求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

// 配置要應用中間件的路徑，擴大到所有路徑
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
