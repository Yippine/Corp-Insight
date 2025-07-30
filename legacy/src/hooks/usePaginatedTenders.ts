import { useState, useEffect } from 'react';

export function usePaginatedTenders(taxId: string) {
  const [tenders, setTenders] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const fetchTenderPage = async (page: number) => {
    try {
      console.log(`正在發查第 ${page} 頁的標案資料...`);
      const response = await fetch(
        `https://pcc-api.openfun.app/api/searchbycompanyid?query=${taxId}&page=${page}`
      );
      const data = await response.json();

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

  const loadAllPages = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    setIsFullyLoaded(false);
    const allTenders = new Map();

    try {
      console.log('開始載入所有標案資料...');
      const firstPage = await fetchTenderPage(1);
      setTotalPages(firstPage.totalPages);

      firstPage.tenders.forEach((tender: any) => {
        allTenders.set(tender.tenderId, tender);
      });

      if (firstPage.totalPages > 1) {
        const delay = 250;
        const batchSize = 4;

        for (let page = 2; page <= firstPage.totalPages; page += batchSize) {
          console.log(`開始載入第 ${page} 到 ${Math.min(page + batchSize - 1, firstPage.totalPages)} 頁`);
          const batch = [];
          for (let i = 0; i < batchSize && page + i <= firstPage.totalPages; i++) {
            batch.push(fetchTenderPage(page + i));
          }

          const results = await Promise.all(batch);
          results.forEach(result => {
            result.tenders.forEach((tender: any) => {
              allTenders.set(tender.tenderId, tender);
            });
          });

          const currentTenders = Array.from(allTenders.values());
          console.log(`目前已載入 ${currentTenders.length} 筆標案資料`);
          setTenders(currentTenders);
          setCurrentPage(Math.min(page + batchSize - 1, firstPage.totalPages));

          if (page + batchSize <= firstPage.totalPages) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } else {
        setTenders(Array.from(allTenders.values()));
      }

      // 全部載入完成後，再次確認資料完整性
      console.log('所有標案資料載入完成，總筆數：', allTenders.size);
      setTenders(Array.from(allTenders.values()));
      setIsFullyLoaded(true);
    } catch (error) {
      console.error('載入標案資料時發生錯誤：', error);
      setError(error instanceof Error ? error.message : '載入標案資料時發生錯誤');
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
      setError(error instanceof Error ? error.message : '載入標案資料時發生錯誤');
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [taxId]);

  return {
    tenders,
    isLoadingMore,
    error,
    progress: (currentPage / totalPages) * 100,
    totalPages,
    currentPage,
    isFullyLoaded,
    fetchTenders
  };
}
