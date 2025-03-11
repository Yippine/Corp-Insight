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
  englishName?: string;
  companyType?: string;
  registrationAuthority?: string;
  established?: string;
  lastChanged?: string;
  shareholding?: string;
  directors?: Array<{
    name: string;
    title: string;
    shares: string;
    representative: string | [number, string];
  }>;
  managers?: Array<{
    序號: string;
    姓名: string;
    到職日期: { year: number; month: number; day: number };
  }>;
  financialReport?: {
    marketType: string;
    code: string;
    abbreviation: string;
    englishAbbreviation: string;
    englishAddress: string;
    phone: string;
    fax: string;
    email: string;
    website: string;
    chairman: string;
    generalManager: string;
    spokesperson: string;
    spokespersonTitle: string;
    deputySpokesperson: string;
    establishmentDate: string;
    listingDate: string;
    parValuePerShare: string;
    paidInCapital: string;
    privatePlacementShares: string;
    preferredShares: string;
    stockTransferAgency: string;
    transferPhone: string;
    transferAddress: string;
    certifiedPublicAccountantFirm: string;
    certifiedPublicAccountant1: string;
    certifiedPublicAccountant2: string;
  };
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
  章程所訂外文公司名稱?: string;
  組織別名稱?: string;
  登記機關?: string;
  核准設立日期?: { year: number; month: number; day: number };
  最後核准變更日期?: { year: number; month: number; day: number };
  董監事名單?: { 姓名: string; 職稱: string; 出資額?: number | string; 所代表法人?: string | [number, string] }[];
  股權狀況?: string;
  經理人名單?: { 序號: string; 姓名: string; 到職日期: { year: number; month: number; day: number } }[];
  財報資訊?: {
    市場別?: string;
    代號?: string;
    簡稱?: string;
    英文簡稱?: string;
    英文地址?: string;
    電話?: string;
    傳真?: string;
    EMail?: string;
    網址?: string;
    董事長?: string;
    總經理?: string;
    發言人?: string;
    發言人職稱?: string;
    代理發言人?: string;
    成立日期?: string;
    上市日期?: string;
    普通股每股面額?: string;
    實收資本額?: string;
    私募股數?: string;
    特別股?: string;
    股票過戶機構?: string;
    過戶電話?: string;
    過戶地址?: string;
    簽證會計師事務所?: string;
    簽證會計師1?: string;
    簽證會計師2?: string;
  };
}

export interface SearchParams {
  q?: string;
  page?: string;
  type?: 'taxId' | 'name' | 'chairman';
  noRedirect?: string;
}