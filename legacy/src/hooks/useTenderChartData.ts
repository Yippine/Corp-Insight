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

interface Statistics {
  totalWins: number;
  peakPeriod: string;
  lastWinDate: string;
}

export function useTenderChartData(
  tenders: ProcessedTender[],
  timeUnit: 'year' | 'month',
  isFullyLoaded: boolean
) {
  const [processedData, setProcessedData] = useState<ChartData>({ labels: [], counts: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [statistics, setStatistics] = useState<Statistics>({
    totalWins: 0,
    peakPeriod: '-',
    lastWinDate: '-'
  });

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

  const calculateStatistics = useCallback(( //統計資料計算修改處
    winningTenders: ProcessedTender[],
    statsMap: Record<string, number>,
    timeUnit: 'year' | 'month'
  ): Statistics => {
    // 計算總得標數
    const totalWins = winningTenders.length;

    // 找出最高得標期間（月份或年度）
    let maxCount = 0;
    let peakPeriod = '-';
    Object.entries(statsMap).forEach(([period, count]) => {
      if (count > maxCount) {
        maxCount = count;
        if (timeUnit === 'month') {
          const year = period.substring(0, 4);
          const monthNum = parseInt(period.substring(4, 6));
          peakPeriod = `${year} 年 ${monthNum} 月`;
        } else {
          peakPeriod = `${period} 年`;
        }
      }
    });

    // 找出最近得標日期
    let lastWinDate = '-';
    if (winningTenders.length > 0) {
      // 使用數值比較而不是字串比較
      const sortedDates = winningTenders
        .map(t => String(t.date))
        .filter(date => date && date.length >= 8)
        .sort((a, b) => parseInt(b) - parseInt(a));
      
      if (sortedDates.length > 0) {
        const latestDate = sortedDates[0];
        const year = latestDate.substring(0, 4);
        const month = parseInt(latestDate.substring(4, 6));
        const day = parseInt(latestDate.substring(6, 8));
        lastWinDate = `${year}／${month}／${day}`;
      }
    }

    return {
      totalWins,
      peakPeriod,
      lastWinDate
    };
  }, []);

  const processChartData = useCallback(() => { //資料處理修改處
    if (tenders.length === 0) {
      setProcessedData({ labels: [], counts: [] });
      setStatistics({
        totalWins: 0,
        peakPeriod: '-',
        lastWinDate: '-'
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const processedTenders = new Set<string>();
      const statsMap: { [key: string]: number } = {};
      
      // 先過濾得標案件
      const winningTenders = tenders.filter(t => 
        t.status === '得標' && 
        !processedTenders.has(t.tenderId) &&
        t.date
      );

      // 根據時間單位過濾資料
      const filteredWinningTenders = timeUnit === 'month'
        ? winningTenders.filter(t => {
            const year = parseInt(t.date.toString().substring(0, 4));
            const currentYear = new Date().getFullYear();
            return year >= currentYear - 2;
          })
        : winningTenders;
      
      const validDates = filteredWinningTenders.map(t => t.date.toString());
      const dateRange = generateDateRange(validDates, timeUnit);

      // 使用已過濾的資料進行統計
      filteredWinningTenders.forEach(tender => {
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
          ? `${key.substring(0, 4)} 年 ${parseInt(key.substring(4, 6))} 月`
          : `${key} 年`,
        count: statsMap[key] || 0
      }));

      setProcessedData({
        labels: sortedData.map(d => d.label),
        counts: sortedData.map(d => d.count)
      });

      // 使用已過濾的資料計算統計資訊
      const stats = calculateStatistics(filteredWinningTenders, statsMap, timeUnit);
      setStatistics(stats);
      
      setDataVersion(prev => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  }, [tenders, timeUnit, generateDateRange, calculateStatistics]);

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
    statistics,
    refreshData: processChartData
  };
}