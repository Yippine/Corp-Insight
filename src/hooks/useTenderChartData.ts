import { useState, useCallback, useEffect } from 'react';

interface ChartData {
  labels: string[];
  counts: number[];
}

interface ProcessedTender {
  tenderId: string;
  date: string;
  status: string;
}

export function useTenderChartData(
  tenders: ProcessedTender[],
  timeUnit: 'year' | 'month',
  isFullyLoaded: boolean
) {
  const [processedData, setProcessedData] = useState<ChartData>({ labels: [], counts: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const generateDateRange = useCallback((dates: string[], unit: 'year' | 'month') => {
    if (dates.length === 0) return [];

    const minDate = Math.min(...dates.map(d => parseInt(d.substring(0, 6))));
    const maxDate = Math.max(...dates.map(d => parseInt(d.substring(0, 6))));

    const range: string[] = [];
    if (unit === 'year') {
      const startYear = Math.floor(minDate / 100);
      const endYear = Math.floor(maxDate / 100);
      for (let year = startYear; year <= endYear; year++) {
        range.push(year.toString());
      }
    } else {
      let current = minDate;
      while (current <= maxDate) {
        range.push(current.toString().padStart(6, '0'));
        let year = Math.floor(current / 100);
        let month = current % 100;
        if (month === 12) {
          year++;
          month = 1;
        } else {
          month++;
        }
        current = year * 100 + month;
      }
    }
    return range;
  }, []);

  const processChartData = useCallback(() => {
    if (tenders.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const processedTenders = new Set<string>();
      const statsMap: { [key: string]: number } = {};
      
      const validDates = tenders
        .filter(t => t.date && t.status === '得標')
        .map(t => t.date.toString());
      
      const dateRange = generateDateRange(validDates, timeUnit);

      tenders.forEach(tender => {
        if (!tender.date || tender.status !== '得標' || processedTenders.has(tender.tenderId)) {
          return;
        }

        processedTenders.add(tender.tenderId);
        const date = tender.date.toString();
        const key = timeUnit === 'month' 
          ? date.substring(0, 6)
          : date.substring(0, 4);

        statsMap[key] = (statsMap[key] || 0) + 1;
      });

      const sortedData = dateRange.map(key => ({
        key,
        label: timeUnit === 'month' 
          ? `${key.substring(0, 4)}年${parseInt(key.substring(4, 6))}月`
          : `${key}年`,
        count: statsMap[key] || 0
      }));

      setProcessedData({
        labels: sortedData.map(d => d.label),
        counts: sortedData.map(d => d.count)
      });
      
      // 增加數據版本以觸發重新渲染
      setDataVersion(prev => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  }, [tenders, timeUnit, generateDateRange]);

  // 監聽數據變化
  useEffect(() => {
    const timer = setTimeout(() => {
      processChartData();
    }, 100);
    return () => clearTimeout(timer);
  }, [tenders, timeUnit, processChartData]);

  // 數據完整時強制更新
  useEffect(() => {
    if (isFullyLoaded) {
      const timer = setTimeout(() => {
        processChartData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFullyLoaded, processChartData]);

  return {
    processedData,
    isProcessing,
    dataVersion,
    refreshData: processChartData
  };
}