export interface SearchData {
  name: string;
  status: string;
  taxId: string;
  chairman: string;
  industry: string;
  tenders: string;
  address: string;
  totalCapital: string;
  paidInCapital: string;
  employees: string;
  tenderCount?: number;
}

export interface DetailData extends Omit<SearchData, 'tenders'> {
  established: string;
  phone: string;
  email: string;
  website: string;
  revenue: string;
  shareholding: string;
  directors: { name: string; title: string; shares: string }[];
  managers: { 序號: string; 姓名: string; 到職日期: { year: number; month: number; day: number } }[];
  tenders: string[];
  englishName: string;
  companyType: string;
  registrationAuthority: string;
}

export interface SearchResponse {
  商業名稱?: string;
  公司名稱?: string;
  現況?: string;
  公司狀況?: string;
  統一編號?: string;
  負責人姓名?: string;
  代表人姓名?: string;
  營業項目?: string;
  所營事業資料?: string;
  地址?: string;
  公司所在地?: string;
  '資本額(元)'?: number | string;
  '資本總額(元)'?: number | string;
  '實收資本額(元)'?: number | string;
}

export interface DetailResponse extends SearchResponse {
  核准設立日期?: { year: number; month: number; day: number };
  '實收資本額(元)'?: number | string;
  '董監事名單'?: { 姓名: string; 職稱: string; 出資額?: number | string; }[];
  股權狀況?: string;
  經理人名單?: { 序號: string; 姓名: string; 到職日期: { year: number; month: number; day: number } }[];
  章程所訂外文公司名稱?: string;
  組織別名稱?: string;
  登記機關?: string;
  財政部?: {
    組織別名稱?: string;
  };
}

const getCompanyName = (company: SearchResponse): string => {
  const companyName = company.商業名稱 || company.公司名稱 || '未提供'
  return Array.isArray(companyName) ? companyName[0] : companyName.trim();
};

const getCompanyStatus = (company: SearchResponse): string => {
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
};

const getIndustryInfo = (company: SearchResponse): string => {
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
};

const formatCapital = (capital: number | string | undefined): string => {
  if (!capital) return '未提供';

  const sanitizedCapital = String(capital).replace(/,/g, '');
  const amount = parseFloat(sanitizedCapital);

  if (isNaN(amount)) {
    console.warn('資本額格式不正確:', capital);
    return '格式錯誤';
  }

  return `NT$ ${amount.toLocaleString('zh-TW')}`;
};

const formatSearchData = (company: SearchResponse): SearchData => {
  return {
    name: getCompanyName(company),
    status: getCompanyStatus(company),
    taxId: company.統一編號 || '未提供',
    chairman: company.負責人姓名 || company.代表人姓名 || '無',
    industry: getIndustryInfo(company),
    tenders: '未提供',
    address: company.地址 || company.公司所在地 || '未提供',
    totalCapital: formatCapital(company['資本額(元)'] ?? company['資本總額(元)']),
    paidInCapital: formatCapital(company['實收資本額(元)']),
    employees: '未提供'
  };
};

const formattedDirectors = (company: DetailResponse): { name: string; title: string; shares: string; representative: string }[] => {
  return !company.董監事名單 
    ? [] 
    : company.董監事名單.map((director: { 姓名: string; 職稱: string; 出資額?: string | number; 所代表法人?: string | [number, string] }) => ({
        name: director.姓名,
        title: director.職稱,
        shares: (director.出資額?.toString() || '0'),
        representative: Array.isArray(director.所代表法人) ? director.所代表法人[1] : (director.所代表法人 || '')
      }));
};

const formatDetailData = (taxId: string, company: DetailResponse): DetailData => {
  return {
    name: getCompanyName(company),
    taxId: taxId,
    industry: getIndustryInfo(company),
    status: getCompanyStatus(company),
    chairman: company.負責人姓名 || company.代表人姓名 || '無',
    established: formatDate(company.核准設立日期 || { year: 0, month: 0, day: 0 }),
    address: company.地址 || company.公司所在地 || '未提供',
    phone: '未提供',
    email: '未提供',
    website: '未提供',
    employees: '未提供',
    totalCapital: formatCapital(company['資本總額(元)']),
    paidInCapital: formatCapital(company['實收資本額(元)']),
    revenue: '未提供',
    directors: formattedDirectors(company),
    managers: company.經理人名單 || [],
    tenders: [],
    shareholding: company['股權狀況'] || '未提供',
    englishName: company.章程所訂外文公司名稱 || '未提供',
    companyType: company.財政部?.組織別名稱 || '未提供',
    registrationAuthority: company.登記機關 || '未提供'
  };
};

const formatDate = (dateObj: { year: number; month: number; day: number }) => {
  return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;
};

export {
  getCompanyName,
  getCompanyStatus,
  getIndustryInfo,
  formatCapital,
  formatSearchData,
  formattedDirectors,
  formatDetailData,
  formatDate
};