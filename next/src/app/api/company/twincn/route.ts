import { NextRequest, NextResponse } from 'next/server';
import { getCachedApiData, setCachedApiData } from '@/lib/mongodbUtils';

const TWINCN_API_CACHE_COLLECTION = 'twincn_api_cache';
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 小時

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

    const apiKey = `twincn_${taxId}`; // 使用 taxId 構造唯一的快取鍵

    // 1. 嘗試從 MongoDB 快取獲取 HTML 資料
    const cachedHtml = await getCachedApiData<string>(
      TWINCN_API_CACHE_COLLECTION,
      apiKey
    );
    if (cachedHtml) {
      return new NextResponse(cachedHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-Cache-Status': 'HIT', // 可選：添加快取狀態頭
        },
      });
    }

    // 2. 若快取未命中，則向台灣企業網發送請求
    const externalApiUrl = `https://p.twincn.com/item.aspx?no=${taxId}`;
    const response = await fetch(externalApiUrl, {
      headers: {
        // 模擬瀏覽器請求，避免反爬蟲機制
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        Referer: 'https://p.twincn.com/',
        Origin: 'https://p.twincn.com',
      },
      // cache: 'no-store' // Next.js fetch cache 由我們的 MongoDB 快取處理
    });

    if (!response.ok) {
      throw new Error(
        `台灣企業網請求失敗：${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    // 3. 將獲取的 HTML 存入 MongoDB 快取
    if (html) {
      await setCachedApiData(
        TWINCN_API_CACHE_COLLECTION,
        apiKey,
        html,
        CACHE_TTL_SECONDS
      );
    }

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
