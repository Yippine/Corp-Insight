import { useState, useEffect } from 'react';
import { Building2, FileSpreadsheet, FileText, Search } from 'lucide-react';
import Pagination from '../Pagination';
import { useTenderSearch, TenderSearchData } from '../../hooks/useTenderSearch';
import NoSearchResults from '../common/NoSearchResults';
import { InlineLoading } from '../common/loading';
import { useSearchParams } from 'react-router-dom';

interface TenderSearchProps {
  onTenderSelect: (tenderId: string) => void;
  onSearchComplete?: () => void;
}

export default function TenderSearch({ onTenderSelect, onSearchComplete }: TenderSearchProps) {
  const {
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages
  } = useTenderSearch();

  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const urlQuery = searchParams.get('q');

    if (!urlQuery) {
      setSearchResults([]);
      setSearchQuery('');
      setCurrentPage(1);
      setTotalPages(1);
      return;
    }

    if (urlQuery) {
      const decodedQuery = decodeURIComponent(urlQuery);
      setSearchQuery(decodedQuery);
      handleSearch(null, parseInt(searchParams.get('page') || '1'));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(null, 1);
    }
  }, [searchType]);

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

  const handleSearch = async (e: React.FormEvent | null, page: number = 1) => {
    e?.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const data = await fetchSearchData(searchType, trimmedQuery, page);
      
      if (!data.records || data.records.length === 0) {
        throw new Error('找不到符合的標案！');
      }

      const getLabel = (record: Record<string, any>, searchType: 'company' | 'tender'): string => {
        const nameKey = record.brief.companies?.name_key?.[Object.keys(record.brief.companies?.name_key || {})[0]];
        const type = record.brief.type;
        const labels = [];

        if (searchType === 'company') {
          const isLoser = nameKey?.some((key: string) => key.includes('未得標廠商'));
          labels.push(isLoser ? '未得標' : '得標');
        } else {
          const labelPatterns = [
            {
              label: '已決標',
              patterns: [
                /^決標公告/,
                /^更正決標公告/,
                /^定期彙送/,
                /^更正定期彙送/
              ]
            },
            {
              label: '無法決標',
              patterns: [
                /^無法決標公告/,
                /^更正無法決標公告/
              ]
            },
            {
              label: '資訊',
              patterns: [
                /公開徵求廠商提供參考資料/,
                /財物變賣/,
                /拒絕往來廠商/,
                /招標文件公開閱覽/,
                /財物出租/,
                /懲戒公告/
              ]
            }
          ];

          const matchedLabel = labelPatterns.find(({ patterns }) => 
            patterns.some(pattern => pattern.test(type))
          );

          if (matchedLabel) {
            labels.push(matchedLabel.label);
          } else {
            labels.push('招標中');
          }
        }

        return labels.join(',');
      };

      const formattedResults: TenderSearchData[] = data.records.map((record: any, index: number) => ({
        tenderId: `${record.unit_id}-${record.job_number}`,
        uniqueId: `${record.unit_id}-${record.job_number}-${index}`,
        date: record.date,
        type: record.brief.type,
        title: record.brief.title,
        unitName: record.unit_name,
        unitId: record.unit_id,
        amount: record.brief.amount || '未提供',
        label: getLabel(record, searchType),
      }));

      setSearchResults(formattedResults);
      setTotalPages(data.total_pages);
      setCurrentPage(page);

      setSearchParams({
        q: encodeURIComponent(trimmedQuery),
        type: searchType,
        page: page.toString()
      });

      onSearchComplete?.();
    } catch (error) {
      console.error('搜尋失敗：', error);
      setErrorMessage(error instanceof Error ? error.message : '搜尋過程發生錯誤，請稍後再試。');
    } finally {
      setIsSearching(false);
    }
  };

  const getLabelStyle = (label: string) => {
    switch (label) {
      case '招標中':
        return 'bg-yellow-100 text-yellow-800';
      case '已決標':
        return 'bg-green-100 text-green-800';
      case '得標':
        return 'bg-emerald-100 text-emerald-800';
      case '未得標':
        return 'bg-rose-100 text-rose-800';
      case '無法決標':
        return 'bg-red-100 text-red-800 whitespace-pre-line';
      case '資訊':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(null, page);
  };

  const handleReset = () => {
    handleSearch(null, 1);
  };

  const handleTenderSelect = (tenderId: string) => {
    sessionStorage.setItem('tenderSearchParams', searchParams.toString())
    sessionStorage.setItem('tenderSearchScroll', window.scrollY.toString())

    if (onTenderSelect) {
      onTenderSelect(tenderId)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => handleSearch(e)} className="relative">
        {/* 搜尋類型選擇器 */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg p-1 bg-gray-100">
            <button
              type="button"
              onClick={() => setSearchType('company')}
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
              onClick={() => setSearchType('tender')}
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
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[9.5%]">
                    {searchType === 'company' ? '狀態' : '階段'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[9.5%]">
                    日期
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[19%]">
                    類型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[33.5%]">
                    標案名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[19%]">
                    機關名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[9.5%]">
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
                      <div className="flex flex-wrap gap-2 w-20 justify-center">
                        {tender.label.split(',').map((item, index) => (
                          <span 
                            key={index}
                            className={`inline-flex items-center py-[0.4rem] px-3 rounded-full text-sm font-medium ${
                              getLabelStyle(item.trim())
                            } whitespace-nowrap`}
                          >
                            {item.trim()}
                          </span>
                        ))}
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

          <div className="text-sm text-gray-500 text-center mt-4">
            資料來源：{`https://pcc.g0v.ronny.tw/api`}
          </div>
        </div>
      ) : null}
    </div>
  );
}