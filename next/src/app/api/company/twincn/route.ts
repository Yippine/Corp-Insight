import { NextRequest, NextResponse } from 'next/server';
import { fetchTwincnHtml } from '@/lib/company/api';

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

    // 調用核心邏輯函數獲取 HTML
    const html = await fetchTwincnHtml(taxId);

    // 根據獲取的 HTML 回應
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
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
