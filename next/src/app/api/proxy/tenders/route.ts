import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 從請求中獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const taxId = searchParams.get('taxId');
    const page = searchParams.get('page') || '1';
    
    if (!taxId) {
      return NextResponse.json(
        { error: '缺少必要的 taxId 參數' },
        { status: 400 }
      );
    }

    // 向 g0v API 發送請求
    const apiUrl = `https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${taxId}&page=${page}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // 關閉內容類型標頭，避免預檢請求問題
      // 由於我們是從伺服器端發出請求，不受 CORS 限制
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗：${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('代理 API 請求錯誤：', error);
    return NextResponse.json(
      { error: '獲取標案資料時發生錯誤' },
      { status: 500 }
    );
  }
}