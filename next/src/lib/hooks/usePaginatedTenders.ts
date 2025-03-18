import { useState, useEffect } from 'react';

export function usePaginatedTenders(taxId: string) {
  const [tenders, setTenders] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // 重試機制的設定
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1500;

  // 請求間隔和批次大小調整
  const REQUEST_DELAY = 1000; // 每個請求之間的延遲時間增加到 1000ms
  const BATCH_SIZE = 2; // 批次請求數量減少到 2 個

  // 增加重試邏輯
  const fetchWithRetry = async (url: string, retries = MAX_RETRIES) => {
    try {
      const response = await fetch(url, {
        // 添加 mode: 'cors' 和必要的 headers
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 429 && retries > 0) {
        console.log(`請求過多 (429)，等待 ${RETRY_DELAY} ms 後重試...剩餘重試次數：${retries}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (retries > 0) {
        console.log(`請求失敗，等待 ${RETRY_DELAY} ms 後重試...剩餘重試次數：${retries}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  };

  const fetchTenderPage = async (page: number) => {
    try {
      console.log(`正在發查第 ${page} 頁的標案資料...`);
      const data = await fetchWithRetry(
        `https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${taxId}&page=${page}`
      );
      
      if (!data.records) {
        throw new Error('無法取得標案資料');
      }

      console.log(`第 ${page} 頁資料載入成功，筆數：${data.records.length}`);
      return {
        tenders: data.records.map((record: any) => {
          const companies = record.brief.companies;
          let status = '未得標';

          if (companies) {
            const idKeyEntry = Object.entries(companies.id_key || {}).find(([id]) => id === 
            taxId);
            if (idKeyEntry) {
              const companyIndex = companies.ids.indexOf(idKeyEntry[0]);
              if (companyIndex !== -1) {
                const companyName = companies.names[companyIndex];
                if (companyName) {
                  const nameKeyStatus = companies.name_key?.[companyName];
                  if (Array.isArray(nameKeyStatus) && !nameKeyStatus.some(s => s.includes('未得標'))) 
                  {
                    status = '得標';
                  }
                }
              }
            }
          }

          return {
            tenderId: `${record.unit_id}-${record.job_number}`,
            date: record.date,
            title: record.brief.title,
            unitName: record.unit_name,
            status
          };
        }),
        totalPages: data.total_pages || 1
      };
    } catch (error) {
      console.error(`載入第 ${page} 頁標案資料失敗：`, error);
      throw error;
    }
  };

  // 序列化請求，避免同時發送太多請求
  const fetchSequentially = async (startPage: number, endPage: number, currentTenders: Map<string, any>) => {
    for (let page = startPage; page <= endPage; page++) {
      try {
        const result = await fetchTenderPage(page);
        
        result.tenders.forEach((tender: any) => {
          currentTenders.set(tender.tenderId, tender);
        });
        
        // 更新進度
        setCurrentPage(page);
        setProgress(Math.round((page / totalPages) * 100));
        setTenders(Array.from(currentTenders.values()));
        
        // 每次請求後添加延遲
        if (page < endPage) {
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
        }
      } catch (error) {
        console.error(`載入第 ${page} 頁標案資料失敗，繼續處理下一頁：`, error);
        // 發生錯誤時繼續處理下一頁，不中斷整個流程
      }
    }
    return currentTenders;
  };

  const loadAllPages = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    setIsFullyLoaded(false);
    setError(null);
    const allTenders = new Map();
    
    try {
      console.log('開始載入標案資料...');
      const firstPage = await fetchTenderPage(1);
      const totalPagesCount = firstPage.totalPages;
      setTotalPages(totalPagesCount);
      
      firstPage.tenders.forEach((tender: any) => {
        allTenders.set(tender.tenderId, tender);
      });

      // 更新進度和資料
      setCurrentPage(1);
      setProgress(Math.round((1 / totalPagesCount) * 100));
      setTenders(Array.from(allTenders.values()));

      if (totalPagesCount > 1) {
        // 限制最大頁數，避免請求過多
        const MAX_PAGES = 10;
        const pagesToFetch = Math.min(totalPagesCount, MAX_PAGES);
        
        if (pagesToFetch > 1) {
          console.log(`將載入剩餘頁面，總頁數：${pagesToFetch}`);
          
          // 序列化請求所有頁面
          await fetchSequentially(2, pagesToFetch, allTenders);
          
          if (pagesToFetch < totalPagesCount) {
            console.log(`限制載入頁數為 ${MAX_PAGES} 頁，實際總頁數為 ${totalPagesCount} 頁`);
          }
        }
      }

      console.log('標案資料載入完成，總筆數：', allTenders.size);
      setTenders(Array.from(allTenders.values()));
      setIsFullyLoaded(true);
      setProgress(100);
    } catch (error) {
      console.error('載入標案資料時發生錯誤：', error);
      // 提供更有意義的錯誤訊息
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          setError('請求頻率過高，請稍後再試');
        } else if (error.message.includes('CORS')) {
          setError('跨域請求被拒絕，無法存取資料來源');
        } else {
          setError(`載入標案資料時發生錯誤：${error.message}`);
        }
      } else {
        setError('載入標案資料時發生未知錯誤');
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchTenders = async () => {
    setIsLoadingMore(true);
    setError(null);
    try {
      await loadAllPages();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('載入標案資料時發生錯誤');
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (taxId) {
      fetchTenders();
    }
  }, [taxId]);

  return {
    tenders,
    isLoadingMore,
    error,
    progress,
    totalPages,
    currentPage,
    isFullyLoaded,
    fetchTenders
  };
}