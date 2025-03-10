import { CompanyData, SearchResponse } from './types';

export function formatSearchData(data: SearchResponse): CompanyData {
  return {
    taxId: data.統一編號 || '',
    name: data.公司名稱 || '',
    address: data.公司所在地 || '',
    chairman: data.負責人 || '',
    status: data.登記狀態 || '',
    capital: data.資本額 ? parseInt(data.資本額.replace(/,/g, '')) : 0,
    industry: data.公司所營事業資料 || '',
    registerDate: data.設立日期 || '',
  };
}

export function formatCapital(capital: number): string {
  if (!capital) return '0';
  return capital.toLocaleString('zh-TW');
}

export function determineSearchType(query: string): 'taxId' | 'name' {
  const taxIdPattern = /^\d{8}$/;
  return taxIdPattern.test(query) ? 'taxId' : 'name';
}

export async function fetchCompanySearch(query: string, page: number = 1): Promise<{
  companies: CompanyData[];
  totalPages: number;
}> {
  const searchType = determineSearchType(query);
  
  if (searchType === 'taxId') {
    const response = await fetchSearchData('taxId', query);
    if (!response || !response.data) {
      return { companies: [], totalPages: 0 };
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

    return {
      companies: formattedResults,
      totalPages: Math.ceil((response.found || 0) / 10) || 1
    };
  }
}

async function fetchSearchData(type: 'taxId' | 'name' | 'chairman', query: string, page: number = 1): Promise<any> {
  const baseUrl = 'https://company.g0v.ronny.tw/api';
  const endpoints = {
    taxId: `${baseUrl}/show/${query}`,
    name: `${baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`,
    chairman: `${baseUrl}/name?q=${encodeURIComponent(query)}&page=${page}`
  };

  try {
    const response = await fetch(endpoints[type], {
      cache: "no-store", // 確保獲取最新數據
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
    return null;
  }
}

async function fetchTenderInfo(taxId: string): Promise<{ count: number; }> {
  try {
    const response = await fetch(`https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${taxId}`, {
      cache: "no-store" // 確保獲取最新數據
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
}

async function formatCompanyResults(type: 'taxId' | 'name' | 'chairman', data: any): Promise<CompanyData[]> {
  const companies = data?.data;
  
  if (!companies) return [];

  if (type === 'taxId') {
    const company = formatSearchData(companies);
    const tenderInfo = await fetchTenderInfo(company.taxId);
    return [{
      ...company,
      tenderCount: tenderInfo.count,
    }];
  }

  const formattedResults = await Promise.all(
    Array.isArray(companies) 
      ? companies
          .map((company: SearchResponse) => formatSearchData(company))
          .filter(company => company.name !== '未提供')
          .map(async (company) => {
            const tenderInfo = await fetchTenderInfo(company.taxId);
            return {
              ...company,
              tenderCount: tenderInfo.count,
            };
          })
      : []
  );

  return formattedResults;
}