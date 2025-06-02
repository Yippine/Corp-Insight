import { useState, useEffect, useCallback } from 'react';

export function usePaginatedTenders(taxId: string) {
  const [tenders, setTenders] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const fetchTenderPage = useCallback(async (page: number, signal: AbortSignal) => {
    const apiUrl = `/api/tender-search-proxy?taxId=${taxId}&page=${page}`;

    try {
      console.log(`正在發查第 ${page} 頁的標案資料 (taxId: ${taxId})...`);

      const response = await fetch(
        apiUrl,
        {
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          },
          signal
        }
      );
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.details || data.error || '無法取得標案資料');
      }

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
      if ((error as Error).name === 'AbortError') {
        console.log(`第 ${page} 頁標案資料查詢被中止 (taxId: ${taxId})`);
      } else {
        console.error(`載入第 ${page} 頁標案資料失敗 (taxId: ${taxId})：`, error);
        if (!((error as Error).name === 'AbortError')) {
          setError(error instanceof Error ? error.message : '載入標案資料時發生錯誤');
        }
      }
      throw error;
    }
  }, [taxId]);

  const loadAllPages = useCallback(async (signal: AbortSignal) => {
    setIsFullyLoaded(false);
    const allTenders = new Map();
    
    try {
      console.log(`開始載入所有標案資料 (taxId: ${taxId})...`);
      const firstPage = await fetchTenderPage(1, signal);
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      setTotalPages(firstPage.totalPages);
      
      firstPage.tenders.forEach((tender: any) => {
        allTenders.set(tender.tenderId, tender);
      });
      setTenders(Array.from(allTenders.values()));
      setCurrentPage(1);

      if (firstPage.totalPages > 1) {
        const delay = 250;
        const batchSize = 4;
        
        for (let page = 2; page <= firstPage.totalPages; page += batchSize) {
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          console.log(`開始載入第 ${page} 到第 ${Math.min(page + batchSize - 1, firstPage.totalPages)} 頁 (taxId: ${taxId})`);
          const batchPromises = [];
          for (let i = 0; i < batchSize && page + i <= firstPage.totalPages; i++) {
            batchPromises.push(fetchTenderPage(page + i, signal));
          }

          const results = await Promise.all(batchPromises);
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

          results.forEach(result => {
            result.tenders.forEach((tender: any) => {
              allTenders.set(tender.tenderId, tender);
            });
          });
          
          const currentTendersArray = Array.from(allTenders.values());
          console.log(`目前已載入 ${currentTendersArray.length} 筆標案資料 (taxId: ${taxId})`);
          setTenders(currentTendersArray);
          setCurrentPage(Math.min(page + batchSize - 1, firstPage.totalPages));
          
          if (page + batchSize <= firstPage.totalPages) {
            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      console.log(`所有標案資料載入完成 (taxId: ${taxId})，總筆數：`, allTenders.size);
      setIsFullyLoaded(true);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`標案資料查詢被中止 (taxId: ${taxId})`);
      } else {
        console.error(`載入標案資料時發生錯誤 (taxId: ${taxId})：`, error);
        if (!((error as Error).name === 'AbortError')) {
          setError(error instanceof Error ? error.message : '載入標案資料時發生錯誤');
        }
      }
      setIsFullyLoaded(false);
    } finally {
      if (signal.aborted) {
        console.log(`loadAllPages for taxId ${taxId} was aborted. isLoadingMore will be handled by effect cleanup.`);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [taxId, fetchTenderPage]);

  useEffect(() => {
    if (!taxId) {
      setTenders([]);
      setCurrentPage(1);
      setTotalPages(1);
      setError(null);
      setIsLoadingMore(false);
      setIsFullyLoaded(false);
      return;
    }

    setTenders([]);
    setCurrentPage(1);
    setTotalPages(1);
    setError(null);
    setIsLoadingMore(true);
    setIsFullyLoaded(false);

    const abortController = new AbortController();
    const signal = abortController.signal;

    loadAllPages(signal).catch(error => {
      if ((error as Error).name === 'AbortError') {
        console.log(`loadAllPages call was directly aborted for taxId: ${taxId}`);
      } else {
        console.error("Unhandled error in loadAllPages effect promise: ", error);
      }
    });

    return () => {
      console.log(`清理 usePaginatedTenders effect (taxId: ${taxId})，中止請求...`);
      abortController.abort();
      setIsLoadingMore(false);
      setIsFullyLoaded(false);
    };
  }, [taxId, loadAllPages]);

  return {
    tenders,
    isLoadingMore,
    error,
    progress: totalPages > 0 && currentPage > 0 ? (currentPage / totalPages) * 100 : 0,
    totalPages,
    currentPage,
    isFullyLoaded,
  };
}