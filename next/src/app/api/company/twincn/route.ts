import { NextRequest, NextResponse } from 'next/server';

/**
 * 處理對台灣企業網的代理請求
 * 
 * @param request Next.js 請求物件
 * @returns HTML 內容回應
 */
export async function GET(request: NextRequest) {
  try {
    // 從查詢參數中獲取統一編號
    const searchParams = request.nextUrl.searchParams;
    const taxId = searchParams.get('no');
    
    if (!taxId) {
      return NextResponse.json(
        { error: '缺少必要參數：no (統一編號)' },
        { status: 400 }
      );
    }

    // 向台灣企業網發送請求
    const response = await fetch(`https://p.twincn.com/item.aspx?no=${taxId}`, {
      headers: {
        // 模擬瀏覽器請求，避免反爬蟲機制
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://p.twincn.com/',
        'Origin': 'https://p.twincn.com'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`台灣企業網請求失敗：${response.status} ${response.statusText}`);
    }

    // 獲取並返回 HTML 內容
    const html = await response.text();
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('台灣企業網代理請求失敗：', error);
    return NextResponse.json(
      { error: `代理請求失敗：${error.message}` },
      { status: 500 }
    );
  }
}

// 設置這個路由為動態路由，防止在構建時靜態生成
export const dynamic = 'force-dynamic';
