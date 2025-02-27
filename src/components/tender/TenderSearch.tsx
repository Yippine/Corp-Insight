import React, { useEffect, useMemo, useState } from 'react';
import { Building2, FileSpreadsheet, FileText, Search } from 'lucide-react';
import Pagination from '../Pagination';
import { useTenderSearch, TenderSearchData } from '../../hooks/useTenderSearch';
import NoSearchResults from '../common/NoSearchResults';
import { InlineLoading } from '../common/loading';
import { useSearchParams } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import { getCompanyLabel, getTenderLabel, getLabelStyle } from '../../utils/tenderLabels';
import DataSource from '../common/DataSource';

interface TenderSearchProps {
  onTenderSelect: (tenderId: string) => void;
}

export const useSearchParamsSync = () => {
  const [searchParams] = useSearchParams();
  return useMemo(() => ({
    q: decodeURIComponent(searchParams.get('q') || ''),
    type: (searchParams.get('type') || 'company') as 'company' | 'tender',
    page: Math.max(1, parseInt(searchParams.get('page') || '1'))
  }), [searchParams]);
};

export default function TenderSearch({ onTenderSelect }: TenderSearchProps) {
  const {
    searchResults,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    currentPage,
    totalPages,
    batchUpdateSearchState
  } = useTenderSearch();

  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { q, type, page } = useSearchParamsSync();

  useEffect(() => {
    if (type !== searchType && (type === 'company' || type === 'tender')) {
      setSearchType(type);
      batchUpdateSearchState({
        results: [],
        query: searchQuery,
        currentPage: 1,
        totalPages: 1
      });
    }
  }, [type]);

  useEffect(() => {
    const syncStateAndSearch = async () => {
      if (!q) {
        batchUpdateSearchState({
          results: [],
          query: '',
          currentPage: 1,
          totalPages: 1
        });
        return;
      }

      setIsSearching(true);
      setErrorMessage(null);

      try {
        let currentPage = page;
        let data = await fetchSearchData(searchType, q, currentPage);
        if (data.records.length === 0 && currentPage > 1) {
          currentPage = 1;
          data = await fetchSearchData(searchType, q, currentPage);
        }
        console.log(JSON.stringify(data))

        const formattedResults = formatResults(data, searchType);
        setSearchParams({
          q: encodeURIComponent(q),
          type: searchType,
          page: currentPage.toString()
        });

        batchUpdateSearchState({
          results: formattedResults,
          query: q,
          currentPage: currentPage,
          totalPages: data.total_pages
        });

        if (formattedResults.length === 0) {
          throw new Error('找不到符合的標案！');
        }
      } catch (error) {
        console.error('搜尋失敗：', error);
        setErrorMessage(error instanceof Error ? error.message : '搜尋過程發生錯誤，請稍後再試。');
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(syncStateAndSearch, 100);
    return () => clearTimeout(timeoutId);
  }, [q, searchType, page]);

  const fetchSearchData = async (type: 'company' | 'tender', query: string, page: number = 1): Promise<any> => {
    const baseUrl = 'https://pcc.g0v.ronny.tw/api';
    const endpoints = {
      tender: `${baseUrl}/searchbytitle?query=${encodeURIComponent(query)}&page=${page}`,
      company: /^\d{8}$/.test(query) 
        ? `${baseUrl}/searchbycompanyid?query=${encodeURIComponent(query)}&page=${page}`
        : `${baseUrl}/searchbycompanyname?query=${encodeURIComponent(query)}&page=${page}`
    };

    try {
      const response = await fetch(endpoints[type], {
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API 請求失敗：', error);
      throw new Error('無法連線到標案搜尋服務，請稍後再試');
    }
  };

  const handleSearch = async (e?: React.FormEvent, page?: number) => {
    e?.preventDefault();
    const targetPage = page || 1;
    
    setSearchParams({
      q: encodeURIComponent(searchQuery),
      type: searchType,
      page: targetPage.toString()
    });
  };

  const formatResults = (data: any, searchType: 'company' | 'tender'): TenderSearchData[] => {
    return data.records.map((record: any, index: number) => {
      const label = searchType === 'company' 
        ? getCompanyLabel(record, searchQuery)
        : getTenderLabel(record.brief.type);
      
      return {
        uniqueId: index,
        tenderId: `${record.unit_id}_${record.job_number}_${record.date}`,
        date: record.date ? formatDate(record.date) : '未提供',
        type: record.brief.type,
        title: record.brief.title,
        unitName: record.unit_name,
        unitId: record.unit_id,
        amount: record.brief.amount || '未提供',
        label,
      };
    });
  };

  const handlePageChange = (page: number) => {
    handleSearch(undefined, page);
  };

  const handleReset = () => {
    handleSearch(undefined, 1);
  };

  const handleTenderSelect = (tenderId: string) => {
    sessionStorage.setItem('tenderSearchParams', searchParams.toString())
    sessionStorage.setItem('tenderSearchScroll', window.scrollY.toString())

    if (onTenderSelect) {
      onTenderSelect(tenderId)
    }
  }

  const handleTypeChange = (newType: 'company' | 'tender') => {
    setSearchType(newType);
    setSearchParams({ 
      q: encodeURIComponent(searchQuery),
      type: newType,
      page: '1'
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => handleSearch(e)} className="relative">
        {/* 搜尋類型選擇器 */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg p-1 bg-gray-100">
            <button
              type="button"
              onClick={() => handleTypeChange('company')}
              className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                searchType === 'company'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              廠商搜尋
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('tender')}
              className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                searchType === 'tender'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-5 w-5 mr-2" />
              標案搜尋
            </button>
          </div>
        </div>

        {/* 搜尋輸入框 */}
        <div className="flex shadow-sm rounded-lg">
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full h-full rounded-l-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 text-xl"
              placeholder={
                searchType === 'tender' 
                  ? '輸入標案名稱或關鍵字'
                  : '輸入廠商名稱、統編或關鍵字'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="relative -ml-px inline-flex items-center px-8 py-3 border border-transparent text-xl font-medium rounded-r-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            搜尋
          </button>
        </div>

        {/* 搜尋提示 */}
        <div className="mt-2 flex justify-center space-x-4 text-base text-gray-500">
          {searchType === 'tender' ? (
            <>
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-1" />
                標案名稱
              </span>
              <span className="flex items-center">
                <Search className="h-5 w-5 mr-1" />
                關鍵字
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center">
                <Building2 className="h-5 w-5 mr-1" />
                廠商名稱
              </span>
              <span className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-1" />
                統一編號
              </span>
              <span className="flex items-center">
                <Search className="h-5 w-5 mr-1" />
                關鍵字
              </span>
            </>
          )}
        </div>
      </form>

      {isSearching ? (
        <div className="py-8">
          <InlineLoading />
        </div>
      ) : errorMessage ? (
        <NoSearchResults 
          message={errorMessage} 
          searchTerm={searchQuery}
          onReset={handleReset}
        />
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                    {searchType === 'company' ? '狀態' : '階段'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                    日期
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[19.5%]">
                    類型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[34%]">
                    標案名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[19.5%]">
                    機關名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    金額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((tender) => (
                  <tr 
                    key={tender.uniqueId}
                    onClick={() => handleTenderSelect(tender.tenderId)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap gap-2 w-[3.25rem] justify-center">
                        <span className={getLabelStyle(tender.label.trim())}>
                          {tender.label.trim()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-500">
                      {tender.date}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-500">
                      {tender.type}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-900">
                      <div className="line-clamp-3">
                        {tender.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-900">
                      <div className="line-clamp-2">
                        {tender.unitName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-500">
                      {tender.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <DataSource
            sources={[
              {
                name: '標案瀏覽',
                url: 'https://pcc.g0v.ronny.tw/'
              }
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}