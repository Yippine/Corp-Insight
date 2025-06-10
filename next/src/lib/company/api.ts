import { CompanyData } from './types';
import { parseTwcnHtml } from './parser';
import { formatDetailData } from './utils';
import {
  determineSearchType,
  formatSearchData,
  formatCompanyResults,
} from './utils';
import { getCachedApiData, setCachedApiData } from '../mongodbUtils';

// 集合名稱和 TTL 設定
const G0V_COMPANY_API_CACHE_COLLECTION = 'g0v_company_api_cache';
const PCC_API_CACHE_COLLECTION = 'pcc_api_cache'; // 用於 fetchTenderInfo
const TWINCN_API_CACHE_COLLECTION = 'twincn_api_cache'; // 用於 fetchListedCompany
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 小時

export async function fetchCompanySearch(
  query: string,
  page: number = 1
): Promise<{
  companies: CompanyData[];
  totalPages: number;
}> {
  const searchType = determineSearchType(query);
  // cacheKey 的定義將在 fetchSearchData 內部處理，因為它依賴於 API URL

  try {
    // fetchWithCache 的邏輯將直接整合到 fetchSearchData 和其他函數中
    if (searchType === 'taxId') {
      const response = await fetchSearchData('taxId', query); // page 在 taxId 搜尋時通常不適用於 g0v API，但在我們的快取鍵中可能仍有用
      if (!response || !response.data) {
        throw new Error('找不到符合的公司！');
      }

      response.data.統一編號 = query; // 確保 taxId 存在
      const company = formatSearchData(response.data);
      const tenderInfo = await fetchTenderInfo(company.taxId); // fetchTenderInfo 也會使用快取

      return {
        companies: [
          {
            ...company,
            tenderCount: tenderInfo.count,
          },
        ],
        totalPages: 1, // taxId 搜尋通常只有一頁
      };
    } else {
      // name or chairman
      let response = await fetchSearchData('name', query, page);
      let formattedResults = await formatCompanyResults('name', response);

      if (formattedResults.length === 0) {
        response = await fetchSearchData('chairman', query, page);
        formattedResults = await formatCompanyResults('chairman', response);
      }

      if (formattedResults.length === 0) {
        throw new Error('找不到符合的公司！');
      }

      return {
        companies: formattedResults,
        totalPages: Math.ceil((response.found || 0) / 10) || 1,
      };
    }
  } catch (error) {
    console.error('搜尋失敗：', error);
    throw error instanceof Error
      ? error
      : new Error('搜尋過程發生錯誤，請稍後再試。');
  }
}

async function fetchSearchData(
  type: 'taxId' | 'name' | 'chairman',
  query: string,
  page: number = 1
): Promise<any> {
  const baseUrl = 'https://company.g0v.ronny.tw/api';
  let apiUrl: string;
  switch (type) {
    case 'taxId':
      apiUrl = `${baseUrl}/show/${query}`;
      break;
    case 'name':
      apiUrl = `${baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`;
      break;
    case 'chairman':
      apiUrl = `${baseUrl}/name?q=${encodeURIComponent(query)}&page=${page}`;
      break;
    default:
      throw new Error('無效的搜尋類型');
  }
  const apiKey = apiUrl;

  const cachedData = await getCachedApiData<any>(
    G0V_COMPANY_API_CACHE_COLLECTION,
    apiKey
  );
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(apiKey, {
      // next: { revalidate: 3600 }, // Next.js revalidate 由我們的快取機制取代
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data) {
      await setCachedApiData(
        G0V_COMPANY_API_CACHE_COLLECTION,
        apiKey,
        data,
        CACHE_TTL_SECONDS
      );
    }
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error('無法連接到搜尋服務，請稍後再試');
  }
}

export async function fetchCompanyDetail(
  taxId: string
): Promise<CompanyData | null> {
  const g0vApiUrl = `https://company.g0v.ronny.tw/api/show/${taxId}`;
  const apiKeyG0v = g0vApiUrl;

  try {
    // 1. 獲取 G0V 公司基本資料 (快取或 API)
    let basicDataResponse = await getCachedApiData<any>(
      G0V_COMPANY_API_CACHE_COLLECTION,
      apiKeyG0v
    );
    if (!basicDataResponse) {
      const fetchRes = await fetch(g0vApiUrl, {
        /* headers: { 'Accept': 'application/json' } */
      });
      if (!fetchRes.ok)
        throw new Error(`G0V API error for basic data: ${fetchRes.status}`);
      basicDataResponse = await fetchRes.json();
      if (basicDataResponse) {
        await setCachedApiData(
          G0V_COMPANY_API_CACHE_COLLECTION,
          apiKeyG0v,
          basicDataResponse,
          CACHE_TTL_SECONDS
        );
      }
    }
    const basicData = basicDataResponse?.data || {};

    // 2. 獲取上市公司資料 (fetchListedCompany 內部會處理自己的快取)
    const listedData = await fetchListedCompany(taxId);

    const companyRawData = {
      ...basicData,
      ...(listedData || {}), // Ensure listedData is an object
    };

    return formatDetailData(taxId, companyRawData);
  } catch (error) {
    console.error('獲取公司詳細資料失敗：', error);
    return null;
  }
}

async function fetchListedCompany(taxId: string) {
  try {
    const html = await fetchTwincnHtml(taxId);
    return parseTwcnHtml(html);
  } catch (error) {
    console.error('獲取上市公司資料失敗：', error);
    // 維持原有錯誤處理返回結構，以確保即使此部分失敗，基本資料仍可顯示
    return { data: {} };
  }
}

/**
 * 從 twincn 獲取公司 HTML 資料的核心邏輯
 * @param taxId 公司統一編號
 * @returns 包含公司資訊的 HTML 字串
 */
export async function fetchTwincnHtml(taxId: string): Promise<string> {
  const apiKey = `twincn_${taxId}`; // 使用 taxId 構造唯一的快取鍵

  // 1. 嘗試從 MongoDB 快取獲取 HTML 資料
  const cachedHtml = await getCachedApiData<string>(
    TWINCN_API_CACHE_COLLECTION,
    apiKey
  );
  if (cachedHtml) {
    return cachedHtml;
  }

  // 2. 若快取未命中，則向台灣企業網發送請求
  const externalApiUrl = `https://p.twincn.com/item.aspx?no=${taxId}`;
  const response = await fetch(externalApiUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      Referer: 'https://p.twincn.com/',
      Origin: 'https://p.twincn.com',
    },
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

  return html;
}

export async function fetchTenderInfo(
  taxId: string
): Promise<{ count: number }> {
  const apiUrl = `https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${taxId}`;
  const apiKey = apiUrl;

  const cachedData = await getCachedApiData<any>(
    PCC_API_CACHE_COLLECTION,
    apiKey
  );
  if (cachedData) {
    return { count: cachedData.total_records || 0 };
  }

  try {
    const response = await fetch(apiKey, {
      // next: { revalidate: 86400 } // 由 MongoDB 快取取代
    });

    if (!response.ok) {
      throw new Error(`標案查詢失敗：狀態碼 ${response.status}`);
    }

    const data = await response.json();
    if (data) {
      await setCachedApiData(
        PCC_API_CACHE_COLLECTION,
        apiKey,
        data,
        CACHE_TTL_SECONDS
      );
    }
    return { count: data.total_records || 0 };
  } catch (error) {
    console.error('載入標案資料失敗：', error);
    return { count: 0 };
  }
}
