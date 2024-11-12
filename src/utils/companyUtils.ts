export interface CompanyData {
  name: string;
  status: string;
  taxId: string;
  chairman: string;
  industry: string;
  tenders: string;
  address: string;
  capital: string;
  employees: string;
}

export interface ApiCompanyResponse {
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
}

const getCompanyName = (name: string): string => {
  return Array.isArray(name) ? name[0] : name.trim();
};

const getCompanyStatus = (company: ApiCompanyResponse): string => {
  const statusConditions = ['歇業', '撤銷', '廢止', '解散'];
  const fields = ['現況', '公司狀況'];
  
  for (const condition of statusConditions) {
    for (const field of fields) {
      const fieldValue = company[field as keyof ApiCompanyResponse];
      if (typeof fieldValue === 'string' && fieldValue.includes(condition)) {
        return `已${condition}`;
      }
    }
  }
  return '營業中';
};

const getIndustryInfo = (company: ApiCompanyResponse): string => {
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

const formatCapital = (capital: number | string): string => {
  const sanitizedCapital = String(capital).replace(/,/g, '');
  const amount = Number(sanitizedCapital);
  return `NT$ ${amount.toLocaleString()}`;
};

const formatCompanyData = (company: ApiCompanyResponse): CompanyData => {
  return {
    name: getCompanyName(company.商業名稱 || company.公司名稱 || '未提供'),
    status: getCompanyStatus(company),
    taxId: company.統一編號 || '未提供',
    chairman: company.負責人姓名 || company.代表人姓名 || '無',
    industry: getIndustryInfo(company),

    tenders: '未提供',
    address: company.地址 || company.公司所在地 || '未提供',
    capital: formatCapital(company['資本額(元)'] || company['資本總額(元)'] || 0),
    employees: '未提供'
  };
};

export {
  getCompanyName,
  getCompanyStatus,
  getIndustryInfo,
  formatCapital,
  formatCompanyData
};