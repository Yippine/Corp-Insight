export interface TenderRecord {
  date: number;
  filename: string;
  brief: {
    type: string;
    title: string;
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

export interface TenderDetail {
  unit_name: string | null;
  records: TenderRecord[];
}

export type TenderStatus =
  | "已決標" // 決標公告
  | "招標中" // 招標公告
  | "無法決標" // 無法決標公告
  | "資訊" // 其他資訊公告
  | "未得標" // 企業查詢用
  | "得標"; // 企業查詢用

export interface TenderSection {
  title: string;
  fields: TenderField[];
}

export interface TenderField {
  label: string;
  value: string | string[];
  subsections?: TenderSection[];
}
