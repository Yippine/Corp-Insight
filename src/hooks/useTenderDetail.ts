import { useState, useEffect } from 'react';
import { TenderDetail, TenderStatus, TenderRecord } from '../types/tender';

interface UseTenderDetailResult {
  data: TenderDetail | null;
  targetRecord: TenderRecord | null;
  isLoading: boolean;
  error: string | null;
  sections: Section[];
  status: TenderStatus | null;
}

interface FieldValue {
  label: string;
  value: string | string[];
  children?: FieldValue[];
}

interface Section {
  title: string;
  fields: FieldValue[];
}

export function useTenderDetail(tenderId: string): UseTenderDetailResult {
  const [data, setData] = useState<TenderDetail | null>(null);
  const [targetRecord, setTargetRecord] = useState<TenderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<TenderStatus | null>(null);

  useEffect(() => {
    const fetchTenderDetail = async () => {
      if (!tenderId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [unitId, jobNumber, targetDate] = tenderId.split('_');
        const response = await fetch(
          `https://pcc.g0v.ronny.tw/api/tender?unit_id=${unitId}&job_number=${jobNumber}`
        );

        if (!response.ok) {
          throw new Error('無法取得標案資料');
        }

        const result: TenderDetail = await response.json();
        setData(result);

        // 取得最新一筆記錄
        const targetRecord = result.records.find(record => record.date.toString() === targetDate) || result.records[result.records.length - 1];
        setTargetRecord(targetRecord);

        // 根據公告類型判斷狀態
        const recordType = targetRecord.brief.type;
        let tenderStatus: TenderStatus;

        if (recordType.includes('決標公告')) {
          tenderStatus = '已決標';
        } else if (recordType.includes('招標公告') || recordType.includes('公開評選')) {
          tenderStatus = '招標中';
        } else if (recordType.includes('無法決標')) {
          tenderStatus = '無法決標';
        } else {
          tenderStatus = '資訊';
        }

        setStatus(tenderStatus);

        // 解析詳細資料結構
        const parsedSections = parseTenderDetail(targetRecord.detail);
        setSections(parsedSections);

      } catch (err) {
        console.error('載入標案資料失敗：', err);
        setError(err instanceof Error ? err.message : '載入標案資料時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenderDetail();
  }, [tenderId]);

  return { data, targetRecord, isLoading, error, sections, status };
}

function parseTenderDetail(detail: Record<string, any>): Section[] {
  const excludedKeys = ['type', 'type2', 'url', 'pkPmsMain', 'fetched_at'];
  const countFieldsToSkip = ['投標廠商家數', '決標品項數']; // 新增需要跳過的數量欄位

  // 改進的階層結構處理 (支援多層級鍵值保留)
  const buildHierarchy = (obj: Record<string, any>, keys: string[], value: any): void => {
    const [currentKey, ...remainingKeys] = keys;
    
    if (!remainingKeys.length) {
      // 處理重複鍵值的情況
      if (obj[currentKey] !== undefined) {
        if (!Array.isArray(obj[currentKey])) {
          obj[currentKey] = [obj[currentKey]];
        }
        obj[currentKey].push(value);
      } else {
        obj[currentKey] = value;
      }
      return;
    }

    obj[currentKey] = obj[currentKey] || {};
    buildHierarchy(obj[currentKey], remainingKeys, value);
  };

  const hierarchy: Record<string, any> = {};
  
  Object.entries(detail).forEach(([key, value]) => {
    if (excludedKeys.includes(key)) return;
    
    const keys = key.split(':');
    buildHierarchy(hierarchy, keys, value);
  });

  // 改進的欄位處理邏輯 (支援多層級結構)
  const processFields = (data: any, parentKey = '', sectionTitle = ''): FieldValue[] => {
    return Object.entries(data).flatMap(([key, val]): FieldValue[] => {
      // 跳過數量統計欄位（當在特定區段時）
      if (countFieldsToSkip.includes(key) && ['投標廠商', '決標品項'].includes(sectionTitle)) {
        return [];
      }

      const fullKey = parentKey ? `${parentKey}:${key}` : key;
      
      // 處理物件型態的資料（優先於陣列處理）
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        const children = processFields(val, fullKey, sectionTitle);
        return [{
          label: key,
          value: '',
          children: children.length > 0 ? children : undefined
        }];
      }

      // 處理陣列型態的資料
      if (Array.isArray(val)) {
        // 優化物件陣列的顯示方式
        const arrayValue = val
          .filter(item => typeof item !== 'object' || item === null)
          .map(String)
          .join(', ');

        return [{
          label: key,
          value: arrayValue,
          children: val.flatMap((item, index) => 
            typeof item === 'object' 
              ? processFields(item, `${fullKey}[${index}]`, sectionTitle)
              : []
          )
        }];
      }

      // 處理基本型態資料（優化物件值顯示）
      return [{
        label: key,
        value: typeof val === 'object' ? '' : String(val) // 隱藏物件類型的值
      }];
    });
  };

  // 將階層結構轉換為扁平化的區段
  const sections: Section[] = [];
  
  Object.entries(hierarchy).forEach(([sectionTitle, sectionData]) => {
    const fields = processFields(sectionData, '', sectionTitle);
    sections.push({
      title: sectionTitle,
      fields
    });
  });

  return sections;
}