export type SearchType = 'company' | 'tender';

export interface SearchParams {
  q?: string;
  type?: string;
  page?: string;
}

export interface TenderSearchResult {
  tenderId: string;
  uniqueId: string;
  date: string;
  type: string;
  title: string;
  unitName: string;
  unitId: string;
  amount: string;
  label: string;
}

export interface TenderRecord {
  date: number;
  filename: string;
  brief: {
    type: string;
    title: string;
    amount?: string;
    companies?: {
      ids: string[];
      names: string[];
      id_key: Record<string, string[]>;
      name_key: Record<string, string[]>;
    };
  };
  job_number: string;
  unit_id: string;
  detail: Record<string, any>;
  unit_name: string | null;
  unit_api_url: string;
  tender_api_url: string;
  unit_url: string;
  url: string;
}

export type TenderStatus =
  | '已決標'
  | '招標中'
  | '無法決標'
  | '資訊'
  | '未得標'
  | '得標';
