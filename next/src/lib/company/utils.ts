import { CompanyData, CompanyResponse } from './types';
import { fetchTenderInfo } from './api';

export function formatSearchData(data: CompanyResponse): CompanyData {
  return {
    name: getCompanyName(data),
    status: getCompanyStatus(data),
    taxId: data.統一編號 || '未提供',
    chairman: data.負責人姓名 || data.代表人姓名 || '無',
    industry: getIndustryInfo(data),
    address: data.地址 || data.公司所在地 || '未提供',
    totalCapital: formatCapital(data['資本額(元)'] ?? data['資本總額(元)']),
    paidInCapital: formatCapital(data['實收資本額(元)']),
    employees: '未提供',
  };
}

/**
 * 格式化公司詳細資料
 * @param taxId 統一編號
 * @param data 原始資料
 * @returns 格式化後的公司詳細資料
 */
export function formatDetailData(
  taxId: string,
  data: CompanyResponse
): CompanyData {
  // 從原始資料抽取所需資訊
  return {
    name: getCompanyName(data),
    taxId: taxId,
    industry: getIndustryInfo(data),
    status: getCompanyStatus(data),
    chairman: data.負責人姓名 || data.代表人姓名 || '無',
    established: formatDate(data.核准設立日期 || { year: 0, month: 0, day: 0 }),
    lastChanged: formatDate(
      data.最後核准變更日期 || { year: 0, month: 0, day: 0 }
    ),
    address: data.地址 || data.公司所在地 || '未提供',
    phone: '未提供',
    email: '未提供',
    website: '未提供',
    employees: '未提供',
    totalCapital: formatCapital(data['資本總額(元)']),
    paidInCapital: formatCapital(data['實收資本額(元)']),
    revenue: '未提供',
    directors: formattedDirectors(data),
    managers: data.經理人名單 || [],
    tenders: [],
    shareholding: data['股權狀況'] || '未提供',
    englishName: data.章程所訂外文公司名稱 || '未提供',
    companyType: data.組織別名稱 || '未提供',
    registrationAuthority: data.登記機關 || '未提供',
    businessScope: Array.isArray(data.所營事業資料) ? data.所營事業資料 : [],
    financialReportInfo: {
      marketType: data.財報資訊?.市場別 || '未提供',
      code: data.財報資訊?.代號 || '未提供',
      abbreviation: data.財報資訊?.簡稱 || '未提供',
      englishAbbreviation: data.財報資訊?.英文簡稱 || '未提供',
      englishAddress: data.財報資訊?.英文地址 || '未提供',
      phone: data.財報資訊?.電話 || '未提供',
      fax: data.財報資訊?.傳真 || '未提供',
      email: data.財報資訊?.EMail || '未提供',
      website: data.財報資訊?.網址 || '未提供',
      chairman: data.財報資訊?.董事長 || '未提供',
      generalManager: data.財報資訊?.總經理 || '未提供',
      spokesperson: data.財報資訊?.發言人 || '未提供',
      spokespersonTitle: data.財報資訊?.發言人職稱 || '未提供',
      deputySpokesperson: data.財報資訊?.代理發言人 || '未提供',
      establishmentDate: data.財報資訊?.成立日期 || '未提供',
      listingDate: data.財報資訊?.上市日期 || '未提供',
      parValuePerShare: data.財報資訊?.普通股每股面額 || '未提供',
      paidInCapital: data.財報資訊?.實收資本額 || '未提供',
      privatePlacementShares: data.財報資訊?.私募股數 || '未提供',
      preferredShares: data.財報資訊?.特別股 || '未提供',
      stockTransferAgency: data.財報資訊?.股票過戶機構 || '未提供',
      transferPhone: data.財報資訊?.過戶電話 || '未提供',
      transferAddress: data.財報資訊?.過戶地址 || '未提供',
      certifiedPublicAccountantFirm:
        data.財報資訊?.簽證會計師事務所 || '未提供',
      certifiedPublicAccountant1: data.財報資訊?.簽證會計師1 || '未提供',
      certifiedPublicAccountant2: data.財報資訊?.簽證會計師2 || '未提供',
    },
  };
}

export function determineSearchType(query: string): 'taxId' | 'name' {
  const taxIdPattern = /^\d{8}$/;
  return taxIdPattern.test(query) ? 'taxId' : 'name';
}

export async function formatCompanyResults(
  type: 'taxId' | 'name' | 'chairman',
  data: any
): Promise<CompanyData[]> {
  const companies = data?.data;

  if (!companies) {
    console.log('未獲取到公司資料');
    return [];
  }

  if (type === 'taxId') {
    const company = formatSearchData(companies);
    try {
      const tenderInfo = await fetchTenderInfo(company.taxId);
      return [
        {
          ...company,
          tenderCount: tenderInfo.count,
        },
      ];
    } catch (error) {
      console.error('獲取標案資料失敗:', error);
      return [
        {
          ...company,
          tenderCount: 0,
        },
      ];
    }
  }

  try {
    const formattedResults = await Promise.all(
      Array.isArray(companies)
        ? companies
            .map((company: CompanyResponse) => {
              const formattedCompany = formatSearchData(company);
              return formattedCompany.name !== '未提供'
                ? formattedCompany
                : null;
            })
            .filter((company): company is CompanyData => company !== null)
            .map(async company => {
              try {
                const tenderInfo = await fetchTenderInfo(company.taxId);
                return {
                  ...company,
                  tenderCount: tenderInfo.count,
                };
              } catch (error) {
                console.error(
                  `獲取 ${company.name} (${company.taxId}) 標案資料失敗：`,
                  error
                );
                return {
                  ...company,
                  tenderCount: 0,
                };
              }
            })
        : []
    );

    console.log(`共格式化了 ${formattedResults.length} 家公司資料`);
    return formattedResults;
  } catch (error) {
    console.error('格式化公司結果失敗：', error);
    return [];
  }
}

/**
 * 獲取公司名稱
 */
function getCompanyName(company: CompanyResponse): string {
  const companyName = company.商業名稱 || company.公司名稱 || '未提供';
  return Array.isArray(companyName) ? companyName[0] : companyName.trim();
}

/**
 * 獲取公司狀態
 */
function getCompanyStatus(company: CompanyResponse): string {
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

/**
 * 獲取行業資訊
 */
function getIndustryInfo(company: CompanyResponse): string {
  const industryInfo = Array.isArray(company.所營事業資料)
    ? company.所營事業資料.map(item => item[1]).join(' ')
    : company.營業項目 || '未提供';

  const chineseTextRegex =
    /[\u4e00-\u9fa5\u3000-\u303f\u2014\uFF00-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFFEF]+/g;

  const pureChineseItems =
    industryInfo
      .replace(/[\(（︹][^)）]*[\)）︺]/g, '')
      .replace(
        /(?<![０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾])([０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾]{1,2}、)/g,
        ''
      )
      .replace(/[．。]+/g, '\n')
      .match(chineseTextRegex)
      ?.join('\n') || '未分類';

  return pureChineseItems;
}

/**
 * 格式化資本額
 */
export function formatCapital(capital: number | string | undefined): string {
  if (!capital) return '未提供';

  const sanitizedCapital = String(capital).replace(/,/g, '');
  const amount = parseFloat(sanitizedCapital);

  if (isNaN(amount)) {
    console.warn('資本額格式不正確:', capital);
    return '格式錯誤';
  }

  return `NT$ ${amount.toLocaleString('zh-TW')}`;
}

/**
 * 格式化董事資料
 */
function formattedDirectors(company: CompanyResponse): {
  name: string;
  title: string;
  shares: string;
  representative: string | [number, string];
}[] {
  return !company.董監事名單
    ? []
    : company.董監事名單.map(
        (director: {
          姓名: string;
          職稱: string;
          出資額?: string | number;
          所代表法人?: string | [number, string];
        }) => ({
          name: director.姓名,
          title: director.職稱,
          shares: director.出資額?.toString() || '0',
          representative: Array.isArray(director.所代表法人)
            ? director.所代表法人[1]
            : director.所代表法人 || '',
        })
      );
}

/**
 * 格式化日期
 */
function formatDate(dateObj?: {
  year: number;
  month: number;
  day: number;
}): string {
  if (!dateObj) return '未提供';
  return `${dateObj.year}/${String(dateObj.month).padStart(2, '0')}/${String(dateObj.day).padStart(2, '0')}`;
}
