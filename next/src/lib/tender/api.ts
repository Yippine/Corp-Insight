import { SearchType, TenderSearchResult } from './types';
import { getCompanyLabel, getTenderLabel } from './labels';
import { formatDate } from '../utils/formatters';

export async function fetchTenderSearch(query: string, searchType: SearchType, page: number = 1): Promise<{
  results: TenderSearchResult[];
  totalPages: number;
}> {
  try {
    const data = await fetchSearchData(searchType, query, page);
    
    if (!data || !data.records || data.records.length === 0) {
      throw new Error('找不到符合的標案！');
    }
    
    const results = formatResults(data, searchType, query);
    
    return {
      results,
      totalPages: data.total_pages || 1
    };
  } catch (error) {
    console.error('搜尋失敗：', error);
    throw error instanceof Error ? error : new Error('搜尋過程發生錯誤，請稍後再試。');
  }
}

async function fetchSearchData(type: SearchType, query: string, page: number = 1): Promise<any> {
  const baseUrl = 'https://pcc.g0v.ronny.tw/api';
  const endpoints = {
    tender: `${baseUrl}/searchbytitle?query=${encodeURIComponent(query)}&page=${page}`,
    company: /^\d{8}$/.test(query) 
      ? `${baseUrl}/searchbycompanyid?query=${encodeURIComponent(query)}&page=${page}`
      : `${baseUrl}/searchbycompanyname?query=${encodeURIComponent(query)}&page=${page}`
  };

  try {
    const response = await fetch(endpoints[type], {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 請求失敗：', error);
    throw new Error('無法連線到標案搜尋服務，請稍後再試');
  }
}

function formatResults(data: any, searchType: SearchType, query: string): TenderSearchResult[] {
  return data.records.map((record: any, index: number) => {
    const label = searchType === 'company' 
      ? getCompanyLabel(record, query)
      : getTenderLabel(record.brief.type);
    
    return {
      uniqueId: `${index}-${record.job_number || 'unknown'}`,
      tenderId: `${record.unit_id}_${record.job_number}`,
      date: record.date ? formatDate(record.date) : '未提供',
      type: record.brief.type || '未分類',
      title: record.brief.title || '未提供標題',
      unitName: record.unit_name || '未提供單位名稱',
      unitId: record.unit_id || '',
      amount: record.brief.amount || '未提供',
      label,
    };
  });
}