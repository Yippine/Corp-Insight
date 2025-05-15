import { CompanyData } from './types';
import { parseTwcnHtml } from './parser';
import { formatDetailData } from './utils';
import { determineSearchType, formatSearchData, formatCompanyResults } from './utils';

// 簡單的內存緩存實現
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1小時緩存

// 從緩存獲取數據或發起新請求
async function fetchWithCache(key: string, fetcher: () => Promise<any>) {
  const now = Date.now();
  const cachedItem = cache.get(key);
  
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

export async function fetchCompanySearch(query: string, page: number = 1): Promise<{
  companies: CompanyData[];
  totalPages: number;
}> {
  const searchType = determineSearchType(query);
  const cacheKey = `search_${searchType}_${query}_${page}`;
  
  try {
    return await fetchWithCache(cacheKey, async () => {
      if (searchType === 'taxId') {
        const response = await fetchSearchData('taxId', query);
        if (!response || !response.data) {
          throw new Error('找不到符合的公司！');
        }
        
        response.data.統一編號 = query;
        const company = formatSearchData(response.data);
        const tenderInfo = await fetchTenderInfo(company.taxId);
        
        return {
          companies: [{
            ...company,
            tenderCount: tenderInfo.count,
          }],
          totalPages: 1
        };
      } else {
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
          totalPages: Math.ceil((response.found || 0) / 10) || 1
        };
      }
    });
  } catch (error) {
    console.error('搜尋失敗：', error);
    throw error instanceof Error ? error : new Error('搜尋過程發生錯誤，請稍後再試。');
  }
}

async function fetchSearchData(type: 'taxId' | 'name' | 'chairman', query: string, page: number = 1): Promise<any> {
  const baseUrl = 'https://company.g0v.ronny.tw/api';
  const endpoints = {
    taxId: `${baseUrl}/show/${query}`,
    name: `${baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`,
    chairman: `${baseUrl}/name?q=${encodeURIComponent(query)}&page=${page}`
  };

  const cacheKey = `api_${type}_${query}_${page}`;
  
  return fetchWithCache(cacheKey, async () => {
    try {
      const response = await fetch(endpoints[type], {
        next: { revalidate: 3600 }, // 使用Next.js的資料重驗證功能，每小時更新一次
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('無法連接到搜尋服務，請稍後再試');
    }
  });
}

/**
 * 從外部API獲取公司詳細資料
 * @param taxId 統一編號
 * @returns 格式化後的公司詳細資料
 */
export async function fetchCompanyDetail(taxId: string): Promise<CompanyData | null> {
  const cacheKey = `detail_${taxId}`;
  
  return fetchWithCache(cacheKey, async () => {
    try {
      // 使用絕對基礎 URL
      const g0vBaseUrl = 'https://company.g0v.ronny.tw/api';
      
      // 並行獲取基本資料和上市公司資料
      const [basicRes, listedRes] = await Promise.allSettled([
        fetch(`${g0vBaseUrl}/show/${taxId}`, { next: { revalidate: 86400 } }), // 每天更新一次
        fetchListedCompany(taxId)
      ]);
  
      // 處理基本資料
      const basicData = basicRes.status === 'fulfilled' 
        ? await basicRes.value.json()
        : { data: {} };
        
      // 處理上市公司資料
      const listedData = listedRes.status === 'fulfilled' 
        ? listedRes.value
        : { data: {} };
  
      // 合併資料
      const companyRawData = {
        ...basicData.data,
        ...listedData
      };
  
      // 格式化資料
      return formatDetailData(taxId, companyRawData);
    } catch (error) {
      console.error('獲取公司詳細資料失敗：', error);
      return null;
    }
  });
}

/**
 * 獲取上市公司資料
 * @param taxId 統一編號
 * @returns 上市公司資料
 */
async function fetchListedCompany(taxId: string) {
  const cacheKey = `listed_${taxId}`;
  
  return fetchWithCache(cacheKey, async () => {
    try {
      // 創建適用於服務器端和客戶端的 URL
      let url: string;
      
      // 檢查是否在服務器端運行
      if (typeof window === 'undefined') {
        // 服務器端 - 使用環境變量或默認值
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        url = `${baseUrl}/api/company/twincn?no=${taxId}`;
      } else {
        // 客戶端 - 可以使用相對路徑
        url = `/api/company/twincn?no=${taxId}`;
      }
      
      const response = await fetch(url, {
        next: { revalidate: 86400 } // 每天更新一次
      });
      
      if (!response.ok) {
        console.error(`上市公司資料請求失敗，狀態碼：${response.status}`);
        return { data: {} };
      }
      
      // 解析 HTML 內容
      const html = await response.text();
      return parseTwcnHtml(html);
    } catch (error) {
      console.error('獲取上市公司資料失敗：', error);
      return { data: {} };
    }
  });
}

export async function fetchTenderInfo(taxId: string): Promise<{ count: number; }> {
  const cacheKey = `tender_${taxId}`;
  
  return fetchWithCache(cacheKey, async () => {
    try {
      const response = await fetch(`https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${taxId}`, {
        next: { revalidate: 86400 } // 每天更新一次
      });
      
      if (!response.ok) {
        throw new Error(`標案查詢失敗：狀態碼 ${response.status}`);
      }
      
      const data = await response.json();
      return { count: data.total_records || 0 };
    } catch (error) {
      console.error('載入標案資料失敗：', error);
      return { count: 0 };
    }
  });
}