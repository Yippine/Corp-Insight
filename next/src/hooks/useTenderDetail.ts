'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '../lib/utils/formatters';

export interface TenderDetail {
  unit_name: string;
  records: TenderRecord[];
  [key: string]: any;
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

interface UseTenderDetailResult {
  data: TenderDetail | null;
  targetRecord: TenderRecord | null;
  isLoading: boolean;
  error: string | null;
  sections: Section[];
}

export interface FieldValue {
  label: string;
  value: string | string[];
  children?: FieldValue[];
}

export interface Section {
  title: string;
  fields: FieldValue[];
}

export function useTenderDetail(tenderId: string): UseTenderDetailResult {
  const [data, setData] = useState<TenderDetail | null>(null);
  const [targetRecord, setTargetRecord] = useState<TenderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchTenderDetail = async () => {
      if (!tenderId) return;

      setIsLoading(true);
      setError(null);

      try {
        const firstUnderscoreIndex = tenderId.indexOf('_');
        const unitId = tenderId.substring(0, firstUnderscoreIndex);
        const jobNumber = tenderId.substring(firstUnderscoreIndex + 1);

        const apiUrl = `/api/tender-detail-proxy?unit_id=${unitId}&job_number=${jobNumber}`;

        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date');
        const typeParam = urlParams.get('type');

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('無法取得標案資料');

        const result: TenderDetail | { error: string; details?: string } =
          await response.json();

        if ('error' in result) {
          throw new Error(result.details || result.error || '無法取得標案資料');
        }

        setData(result as TenderDetail);

        const findTargetRecord = () => {
          if (dateParam && typeParam) {
            return (result as TenderDetail).records.find(
              record =>
                formatDate(record.date) === dateParam &&
                record.brief.type === decodeURIComponent(typeParam)
            );
          }
          if (dateParam)
            return (result as TenderDetail).records.find(
              r => formatDate(r.date) === dateParam
            );
          return (result as TenderDetail).records[
            (result as TenderDetail).records.length - 1
          ];
        };

        const target =
          findTargetRecord() || (result as TenderDetail).records[0];
        setTargetRecord(target);
        setSections(parseTenderDetail(target.detail));
      } catch (err) {
        console.error('載入標案資料失敗：', err);
        setError(err instanceof Error ? err.message : '載入標案資料時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenderDetail();
  }, [tenderId]);

  return { data, targetRecord, isLoading, error, sections };
}

/**
 * 共用用來合併相同欄位值的函式：
 * 1. 若尚未設定，直接回傳新值。
 * 2. 若已存在且為陣列，就加入新值並依「葉值（例如 "20元" 或 "0元"）優先」排序。
 * 3. 若兩個值都是物件，則合併（用 Object.assign 將兩者的 key 合併）。
 * 4. 否則，回傳陣列，依照葉值自動排序（葉值優先）。
 */
function mergeValue(existing: any, newVal: any): any {
  if (existing === undefined) return newVal;
  if (Array.isArray(existing)) {
    existing.push(newVal);
    const prim = existing.filter(x => typeof x !== 'object' || x === null);
    const objs = existing.filter(
      x => typeof x === 'object' && x !== null && !Array.isArray(x)
    );
    return [...prim, ...objs];
  }
  if (
    typeof existing === 'object' &&
    !Array.isArray(existing) &&
    typeof newVal === 'object' &&
    !Array.isArray(newVal)
  ) {
    // 若兩者皆為 object，合併屬性
    return Object.assign({}, existing, newVal);
  }
  // 否則合併為陣列，並將葉值放前面
  const arr = [existing, newVal];
  const prim = arr.filter(x => typeof x !== 'object' || x === null);
  const objs = arr.filter(
    x => typeof x === 'object' && x !== null && !Array.isArray(x)
  );
  return [...prim, ...objs];
}

/**
 * 統一處理詳細資料階層的邏輯：
 * 若遭遇重複欄位值，則使用 mergeValue 將它們合併，
 * 並在需要建立子階層時，若原本為葉值（primitive）則轉為陣列，
 * 再尋找或產生一個物件容器以儲存子欄位。
 */
function buildHierarchyUnified(
  obj: Record<string, any>,
  keys: string[],
  value: any
): void {
  const [currentKey, ...remainingKeys] = keys;

  if (remainingKeys.length === 0) {
    // 達到最末層，以 mergeValue 合併
    obj[currentKey] = mergeValue(obj[currentKey], value);
    return;
  }

  // 若尚未建立子層，先建立物件容器
  if (obj[currentKey] === undefined) {
    obj[currentKey] = {};
  } else if (
    typeof obj[currentKey] !== 'object' ||
    Array.isArray(obj[currentKey])
  ) {
    // 遇到重複欄位、或已設定為葉值時，轉為陣列以兼容物件與原始值
    if (!Array.isArray(obj[currentKey])) {
      obj[currentKey] = [obj[currentKey]];
    }
    // 檢查陣列中是否已有物件容器，若無則新增一個空物件
    let container = obj[currentKey].find(
      (item: any) =>
        typeof item === 'object' && item !== null && !Array.isArray(item)
    );
    if (!container) {
      container = {};
      obj[currentKey].push(container);
    }
    buildHierarchyUnified(container, remainingKeys, value);
    return;
  }

  // 已有物件容器，可直接遞迴
  buildHierarchyUnified(obj[currentKey], remainingKeys, value);
}

function parseTenderDetail(detail: Record<string, any>): Section[] {
  const excludedKeys = ['type', 'type2', 'url', 'pkPmsMain', 'fetched_at'];
  const countFieldsToSkip = ['投標廠商家數', '決標品項數']; // 需要跳過的數量欄位

  // 以統一的階層處理表現來建立結構
  const hierarchy: Record<string, any> = {};

  Object.entries(detail).forEach(([key, value]) => {
    if (excludedKeys.includes(key)) return;

    const keys = key.split(':');
    // 使用 buildHierarchyUnified 取代原本的 buildHierarchy
    buildHierarchyUnified(hierarchy, keys, value);
  });

  // 改進的欄位處理邏輯 (支援多層級結構)
  const processFields = (
    data: any,
    parentKey = '',
    sectionTitle = ''
  ): FieldValue[] => {
    return Object.entries(data).flatMap(([key, val]): FieldValue[] => {
      // 跳過數量統計欄位（當在特定區段時）
      if (
        countFieldsToSkip.includes(key) &&
        ['投標廠商', '決標品項'].includes(sectionTitle)
      ) {
        return [];
      }

      const fullKey = parentKey ? `${parentKey}:${key}` : key;

      // 處理物件型態的資料（優先於陣列處理）
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        const children = processFields(val, fullKey, sectionTitle);
        return [
          {
            label: key,
            value: '',
            children: children.length > 0 ? children : undefined,
          },
        ];
      }

      // 處理陣列型態的資料
      if (Array.isArray(val)) {
        // 優化物件陣列的顯示方式
        const arrayValue = val
          .filter(item => typeof item !== 'object' || item === null)
          .map(String)
          .join(', ');

        return [
          {
            label: key,
            value: arrayValue,
            children: val.flatMap((item, index) =>
              typeof item === 'object'
                ? processFields(item, `${fullKey}[${index}]`, sectionTitle)
                : []
            ),
          },
        ];
      }

      // 處理基本型態資料（優化物件值顯示）
      return [
        {
          label: key,
          value: typeof val === 'object' ? '' : String(val),
        },
      ];
    });
  };

  // 將階層結構轉換為扁平化的區段
  const sections: Section[] = [];

  Object.entries(hierarchy).forEach(([sectionTitle, sectionData]) => {
    const fields = processFields(sectionData, '', sectionTitle);
    sections.push({
      title: sectionTitle,
      fields,
    });
  });

  return sections;
}
