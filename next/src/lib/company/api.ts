import { CompanyData, SearchResponse } from './types';

/**
 * 從外部API獲取公司詳細資料
 * @param taxId 統一編號
 * @returns 格式化後的公司詳細資料
 */
export async function fetchCompanyDetail(taxId: string): Promise<CompanyData | null> {
  try {
    const baseUrl = 'https://company.g0v.ronny.tw/api';
    
    // 並行獲取基本資料和上市公司資料
    const [basicRes, listedRes] = await Promise.allSettled([
      fetch(`${baseUrl}/show/${taxId}`),
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
    const formattedData = formatDetailData(taxId, companyRawData);
    
    // 添加營業項目資料
    return { 
      ...formattedData, 
      businessScope: companyRawData.所營事業資料 || [] 
    };
  } catch (error) {
    console.error('獲取公司詳細資料失敗:', error);
    return null;
  }
}

/**
 * 獲取上市公司資料
 * @param taxId 統一編號
 * @returns 上市公司資料
 */
async function fetchListedCompany(taxId: string) {
  try {
    // 假設這是針對上市公司的API
    const response = await fetch(`https://p.twincn.com/api/company/${taxId}`);
    
    if (!response.ok) {
      return { data: {} };
    }
    
    return await response.json();
  } catch (error) {
    console.error('獲取上市公司資料失敗:', error);
    return { data: {} };
  }
}

/**
 * 格式化公司詳細資料
 * @param taxId 統一編號
 * @param data 原始資料
 * @returns 格式化後的公司詳細資料
 */
function formatDetailData(taxId: string, data: SearchResponse): CompanyData {
  // 從原始資料抽取所需資訊
  return {
    taxId: taxId,
    name: data.公司名稱 || data.商業名稱 || '',
    address: data.公司所在地 || data.地址 || '',
    chairman: data.負責人 || data.負責人姓名 || data.代表人姓名 || '無',
    status: getCompanyStatus(data),
    totalCapital: formatCapital(data['資本總額(元)'] ? Number(data['資本總額(元)']) : 0),
    paidInCapital: formatCapital(data['實收資本額(元)'] ? Number(data['實收資本額(元)']) : 0),
    industry: data.營業項目 || '',
    website: data.網址 || '未提供',
    phone: data.電話 || '未提供',
    englishName: data.章程所訂外文公司名稱 || '未提供',
    employees: data.員工人數 || '未提供',
    companyType: data.組織別名稱 || '未提供',
    registrationAuthority: data.登記機關 || '未提供',
    established: formatDate(data.核准設立日期),
    lastChanged: formatDate(data.最後核准變更日期),
    shareholding: data.股權狀況 || '未提供',
    // 提取董事和經理人資料
    directors: data.董監事名單 ? data.董監事名單.map(director => ({
      name: director.姓名 || '',
      title: director.職稱 || '',
      shares: director.出資額?.toString() || '0',
      representative: Array.isArray(director.所代表法人) ? director.所代表法人[1] : (director.所代表法人 || '')
    })) : [],
    managers: data.經理人名單 || [],
    // 提取財務報表資訊
    financialReportInfo: data.財報資訊 ? {
      marketType: data.財報資訊.市場別 || '未提供',
      code: data.財報資訊.代號 || '未提供',
      abbreviation: data.財報資訊.簡稱 || '',
      englishAbbreviation: data.財報資訊.英文簡稱 || '',
      englishAddress: data.財報資訊.英文地址 || '未提供',
      phone: data.財報資訊.電話 || '未提供',
      fax: data.財報資訊.傳真 || '未提供',
      email: data.財報資訊.EMail || '未提供',
      website: data.財報資訊.網址 || '未提供',
      chairman: data.財報資訊.董事長 || '未提供',
      generalManager: data.財報資訊.總經理 || '未提供',
      spokesperson: data.財報資訊.發言人 || '未提供',
      spokespersonTitle: data.財報資訊.發言人職稱 || '',
      deputySpokesperson: data.財報資訊.代理發言人 || '未提供',
      establishmentDate: data.財報資訊.成立日期 || '未提供',
      listingDate: data.財報資訊.上市日期 || '未提供',
      parValuePerShare: data.財報資訊.普通股每股面額 || '未提供',
      paidInCapital: data.財報資訊.實收資本額 || '0',
      privatePlacementShares: data.財報資訊.私募股數 || '0',
      preferredShares: data.財報資訊.特別股 || '0',
      stockTransferAgency: data.財報資訊.股票過戶機構 || '未提供',
      transferPhone: data.財報資訊.過戶電話 || '未提供',
      transferAddress: data.財報資訊.過戶地址 || '未提供',
      certifiedPublicAccountantFirm: data.財報資訊.簽證會計師事務所 || '未提供',
      certifiedPublicAccountant1: data.財報資訊.簽證會計師1 || '未提供',
      certifiedPublicAccountant2: data.財報資訊.簽證會計師2 || '未提供',
    } : {
      marketType: '未提供',
      code: '未提供',
      abbreviation: '',
      englishAbbreviation: '',
      englishAddress: '未提供',
      phone: '未提供',
      fax: '未提供',
      email: '未提供',
      website: '未提供',
      chairman: '未提供',
      generalManager: '未提供',
      spokesperson: '未提供',
      spokespersonTitle: '',
      deputySpokesperson: '未提供',
      establishmentDate: '未提供',
      listingDate: '未提供',
      parValuePerShare: '未提供',
      paidInCapital: '0',
      privatePlacementShares: '0',
      preferredShares: '0',
      stockTransferAgency: '未提供',
      transferPhone: '未提供',
      transferAddress: '未提供',
      certifiedPublicAccountantFirm: '未提供',
      certifiedPublicAccountant1: '未提供',
      certifiedPublicAccountant2: '未提供',
    }
  };
}

/**
 * 獲取公司狀態
 */
function getCompanyStatus(data: SearchResponse): string {
  if (data.現況 === '核准設立') return '營業中';
  if (data.公司狀況 === '核准設立') return '營業中';
  if (data.登記狀態 === '核准設立') return '營業中';
  
  if (data.現況) return data.現況;
  if (data.公司狀況) return data.公司狀況;
  if (data.登記狀態) return data.登記狀態;
  
  return '狀態未知';
}

/**
 * 格式化資本額
 */
function formatCapital(capital: number): string {
  if (!capital) return '未提供';
  return `NT$ ${capital.toLocaleString()}`;
}

/**
 * 格式化日期
 */
function formatDate(dateObj?: { year: number; month: number; day: number }): string {
  if (!dateObj) return '未提供';
  const { year, month, day } = dateObj;
  // 轉換民國年到西元年
  const westernYear = year + 1911;
  return `${westernYear}年${month}月${day}日`;
}