export interface CompanyData {
  taxId: string;
  name: string;
  address?: string;
  chairman?: string;
  status?: string;
  capital?: number;
  industry?: string;
  registerDate?: string;
  tenderCount?: number;
  employees?: string;
  paidInCapital?: string;
}

export interface SearchResponse {
  商業名稱?: string;
  公司名稱?: string;
  現況?: string;
  公司狀況?: string;
  登記狀態?: string;
  統一編號?: string;
  負責人?: string;
  負責人姓名?: string;
  代表人姓名?: string;
  營業項目?: string;
  所營事業資料?: string | any[];
  地址?: string;
  公司所在地?: string;
  資本額?: string;
  '資本額(元)'?: number | string;
  '資本總額(元)'?: number | string;
  '實收資本額(元)'?: number | string;
  設立日期?: string;
}

export interface SearchParams {
  q?: string;
  page?: string;
  type?: 'taxId' | 'name' | 'chairman';
  noRedirect?: string;
}