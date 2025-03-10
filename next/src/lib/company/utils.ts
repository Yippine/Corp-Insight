import { CompanyData, SearchResponse } from './types';

export function formatSearchData(data: SearchResponse): CompanyData {
  return {
    taxId: data.統一編號 || '',
    name: getCompanyName(data),
    address: data.公司所在地 || data.地址 || '',
    chairman: data.負責人 || data.代表人姓名 || '無',
    status: getCompanyStatus(data),
    capital: data.資本額 ? parseInt(data.資本額.replace(/,/g, '')) : 0,
    industry: getIndustryInfo(data),
    registerDate: data.設立日期 || '',
    paidInCapital: formatPaidInCapital(data['實收資本額(元)']),
  };
}

export function formatCapital(capital: number): string {
  if (!capital) return '未提供';
  return `NT$ ${capital.toLocaleString('zh-TW')}`;
}

function formatPaidInCapital(capital: number | string | undefined): string {
  if (!capital) return '未提供';

  const sanitizedCapital = String(capital).replace(/,/g, '');
  const amount = parseFloat(sanitizedCapital);

  if (isNaN(amount)) {
    console.warn('資本額格式不正確:', capital);
    return '格式錯誤';
  }

  return `NT$ ${amount.toLocaleString('zh-TW')}`;
}

function getCompanyName(company: SearchResponse): string {
  const companyName = company.商業名稱 || company.公司名稱 || '未提供';
  return Array.isArray(companyName) ? companyName[0] : companyName.trim();
}

function getCompanyStatus(company: SearchResponse): string {
  const statusFields = ['現況', '公司狀況'] as const;
  const statusConditions = ['歇業', '撤銷', '廢止', '解散'] as const;

  try {
    for (const field of statusFields) {
      const status = company[field];

      if (typeof status !== 'string') continue;

      const matchedCondition = statusConditions.find(condition => 
        status.includes(condition)
      );

      if (matchedCondition) return `已${matchedCondition}`;
    }

    return '營業中';
  } catch (error) {
    console.error('取得公司狀態時發生錯誤：', error);
    return '未提供';
  }
}

function getIndustryInfo(company: SearchResponse): string {
  const industryInfo = Array.isArray(company.所營事業資料) 
    ? company.所營事業資料.map(item => item[1]).join(' ') 
    : company.營業項目 || '未提供';

  const chineseTextRegex = /[\u4e00-\u9fa5\u3000-\u303f\u2014\uFF00-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFFEF]+/g;

  const pureChineseItems = industryInfo
    .replace(/[\(（︹][^)）]*[\)）︺]/g, '')
    .replace(/(?<![０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾])([０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾]{1,2}、)/g, '')
    .replace(/[．。]+/g, '\n')
    .match(chineseTextRegex)?.join('\n') || '未分類';

  return pureChineseItems;
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
  
  try {
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

  try {
    const response = await fetch(endpoints[type], {
      cache: "no-store", // 確保獲取最新數據
      mode: 'cors',
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