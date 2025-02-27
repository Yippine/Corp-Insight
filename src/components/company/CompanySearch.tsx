import { useState, useEffect } from 'react';
import { Search, Building2, FileSpreadsheet, Users, MapPin } from 'lucide-react';
import { SearchData, SearchResponse, formatSearchData } from '../../utils/companyUtils';
import Pagination from '../Pagination';
import NoSearchResults from '../common/NoSearchResults';
import { InlineLoading } from '../common/loading';
import { useSearchParams } from 'react-router-dom';
import DataSource from '../common/DataSource';

interface CompanySearchProps {
  onCompanySelect?: (taxId: string) => void;
  onSearchComplete?: () => void;
}

const fetchSearchData = async (type: 'taxId' | 'name' | 'chairman', query: string, page: number = 1): Promise<any> => {
  const baseUrl = 'https://company.g0v.ronny.tw/api';
  const endpoints = {
    taxId: `${baseUrl}/show/${query}`,
    name: `${baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`,
    chairman: `${baseUrl}/name?q=${encodeURIComponent(query)}&page=${page}`
  };

  try {
    const response = await fetch(endpoints[type], {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error('無法連接到搜尋服務，請稍後再試');
  }
};

const fetchTenderInfo = async (taxId: string): Promise<{ count: number; }> => {
  try {
    const response = await fetch(`https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${taxId}`);
    if (!response.ok) {
      throw new Error(`標案查詢失敗：狀態碼 ${response.status}`);
    }
    const data = await response.json();
    return { count: data.total_records || 0 };
  } catch (error) {
    console.error('載入標案資料失敗：', error);
    return { count: 0 };
  }
};

export default function CompanySearch({ onCompanySelect, onSearchComplete }: CompanySearchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchData[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1') || 1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async (
    e: React.FormEvent | null, 
    page: number = 1,
    customQuery?: string  
  ) => {
    e?.preventDefault();
    const trimmedQuery = customQuery || searchQuery.trim();
    if (!trimmedQuery) return;
    
    setIsSearching(true);
    setErrorMessage(null);
    
    try {
      const searchType = determineSearchType(trimmedQuery);
      if (searchType === 'taxId') {
        const response = await fetchSearchData('taxId', trimmedQuery);
        if (!response.data) {
          throw new Error('找不到符合的公司！');
        }
        response.data.統一編號 = trimmedQuery;
        const formattedResults = await formatCompanyResults('taxId', response);
        setSearchResults(formattedResults);
        setTotalPages(1);
      } else {
        let response = await fetchSearchData('name', trimmedQuery, page);
        let formattedResults = await formatCompanyResults('name', response);
        if (formattedResults.length === 0) {
          response = await fetchSearchData('chairman', trimmedQuery, page);
          formattedResults = await formatCompanyResults('chairman', response);
        }
        if (formattedResults.length === 0) {
          throw new Error('找不到符合的公司！');
        }
        setSearchResults(formattedResults);
        setTotalPages(Math.ceil(response.found / 10) || 1);
        setCurrentPage(page);
      }

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

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (!urlQuery) {
      setSearchResults([])
      setSearchQuery('')
      onSearchComplete?.()
      return
    }
    
    const decodedQuery = decodeURIComponent(urlQuery)
    setSearchQuery(decodedQuery)
    
    const executeSearch = async () => {
      await handleSearch(null, parseInt(searchParams.get('page') || '1'), decodedQuery)
    }
    executeSearch()
  }, [])

  const determineSearchType = (query: string): 'taxId' | 'name' => {
    const taxIdPattern = /^\d{8}$/;
    return taxIdPattern.test(query) ? 'taxId' : 'name';
  };

  const formatCompanyResults = async (type: 'taxId' | 'name' | 'chairman', data: any): Promise<SearchData[]> => {
    const companies = data.data;
    
    if (!companies) return [formatSearchData({})];

    if (type === 'taxId') {
      const company = formatSearchData(companies);
      const tenderInfo = await fetchTenderInfo(company.taxId);
      return [{
        ...company,
        tenderCount: tenderInfo.count,
      }];
    }

    const formattedResults = await Promise.all(
      Array.isArray(companies) 
        ? companies
            .map((company: SearchResponse) => formatSearchData(company))
            .filter(company => company.name !== '未提供')
            .map(async (company) => {
              const tenderInfo = await fetchTenderInfo(company.taxId);
              return {
                ...company,
                tenderCount: tenderInfo.count,
              };
            })
        : [formatSearchData({})]
    );

    return formattedResults;
  };

  const handlePageChange = (page: number) => {
    handleSearch(null, page);
  };

  const handleReset = () => {
    handleSearch(null, 1);
  };

  const handleCompanySelect = (taxId: string) => {
    sessionStorage.setItem('companySearchParams', searchParams.toString())
    sessionStorage.setItem('companySearchScroll', window.scrollY.toString())

    if (onCompanySelect) {
      onCompanySelect(taxId)
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => handleSearch(e)} className="relative">
        <div className="flex shadow-sm rounded-lg">
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full h-full rounded-l-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 text-xl"
              placeholder="輸入公司名稱、統編、負責人或關鍵字"
            />
          </div>
          <button
            type="submit"
            className="relative -ml-px inline-flex items-center px-8 py-3 border border-transparent text-xl font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            搜尋
          </button>
        </div>
        <div className="mt-2 flex justify-center space-x-4 text-base text-gray-500">
          <span className="flex items-center">
            <Building2 className="h-5 w-5 mr-1" />
            公司名稱
          </span>
          <span className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-1" />
            統一編號
          </span>
          <span className="flex items-center">
            <Users className="h-5 w-5 mr-1" />
            負責人
          </span>
          <span className="flex items-center">
            <Search className="h-5 w-5 mr-1" />
            關鍵字
          </span>
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
            <ul className="divide-y divide-gray-200">
              {searchResults.map((company) => (
                <li key={company.taxId}>
                  <button
                    onClick={() => handleCompanySelect(company.taxId)}
                    className="block hover:bg-gray-50 w-full text-left p-6 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-medium text-blue-600 truncate">
                          {company.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          company.status === '營業中' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status}
                        </span>
                      </div>
                      <div className="text-base text-gray-500">
                        統編：{company.taxId}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {company.chairman !== '無' &&
                        <div className="flex items-center text-base text-gray-600">
                          <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span className="truncate">負責人：{company.chairman}</span>
                        </div>
                      }
                      {company.industry !== '未分類' &&
                        <div className="flex items-center text-base text-gray-600">
                          <Building2 className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span className="truncate">{company.industry}</span>
                        </div>
                      }
                      {company.tenderCount !== undefined && company.tenderCount > 0 &&
                        <div className="flex items-center text-base text-gray-600">
                          <FileSpreadsheet className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>參與標案：{company.tenderCount} 件</span>
                        </div>
                      }
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {company.paidInCapital !== '未提供' &&
                        <div className="flex items-center text-base text-gray-600">
                          <Building2 className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>實收資本額：{company.paidInCapital}</span>
                        </div>
                      }
                      {company.employees !== '未提供' &&
                        <div className="flex items-center text-base text-gray-600">
                          <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>員工人數：{company.employees}</span>
                        </div>
                      }
                      <div className="flex items-center text-base text-gray-600">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span className="truncate">{company.address}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
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
                name: '台灣公司資料',
                url: 'https://company.g0v.ronny.tw/'
              }
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}