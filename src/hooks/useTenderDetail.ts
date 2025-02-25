import { useState, useEffect } from 'react';
import { TenderDetail, TenderStatus, TenderSection, TenderRecord } from '../types/tender';

interface UseTenderDetailResult {
  data: TenderDetail | null;
  targetRecord: TenderRecord | null;
  isLoading: boolean;
  error: string | null;
  sections: TenderSection[];
  status: TenderStatus | null;
}

export function useTenderDetail(tenderId: string): UseTenderDetailResult {
  const [data, setData] = useState<TenderDetail | null>(null);
  const [targetRecord, setTargetRecord] = useState<TenderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<TenderSection[]>([]);
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

function parseTenderDetail(detail: Record<string, any>): TenderSection[] {
  const sections: TenderSection[] = [];
  const processedKeys = new Set<string>();

  // 遍歷所有鍵值對
  Object.entries(detail).forEach(([key, _]) => {
    if (processedKeys.has(key)) return;
    
    const parts = key.split(':');
    const mainSection = parts[0];

    // 跳過特定欄位
    if (['type', 'type2', 'url', 'pkPmsMain', 'fetched_at'].includes(mainSection)) {
      return;
    }

    // 尋找相同主分類的所有欄位
    const relatedFields = Object.entries(detail)
      .filter(([k]) => k.startsWith(mainSection + ':'))
      .map(([k, v]) => {
        processedKeys.add(k);
        const fieldParts = k.split(':');
        return {
          label: fieldParts[fieldParts.length - 1],
          value: typeof v === 'string' ? v : JSON.stringify(v)
        };
      });

    sections.push({
      title: mainSection,
      fields: relatedFields
    });
  });

  return sections;
}