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
}

export interface SearchResponse {
  統一編號?: string;
  公司名稱?: string;
  負責人?: string;
  公司所在地?: string;
  登記狀態?: string;
  資本額?: string;
  公司所營事業資料?: string;
  設立日期?: string;
  最後核準變更日期?: string;
  [key: string]: any;
}

export interface SearchParams {
  q?: string;
  page?: string;
  type?: 'taxId' | 'name' | 'chairman';
}