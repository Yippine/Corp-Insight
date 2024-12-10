import { useState } from 'react';
import { Search, Building2, FileSpreadsheet, Users, MapPin } from 'lucide-react';
import { SearchData, SearchResponse, formatSearchData } from '../../utils/companyUtils';
import Pagination from '../Pagination';

interface CompanySearchProps {
  onCompanySelect: (companyTaxId: string) => void;
  searchResults: SearchData[];
  setSearchResults: (results: SearchData[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
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

export default function CompanySearch({ 
  onCompanySelect, 
  searchResults, 
  setSearchResults,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  setTotalPages
}: CompanySearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent | null, page: number = 1) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    
    try {
      const searchType = determineSearchType(searchQuery);
      if (searchType === 'taxId') {
        const response = await fetchSearchData('taxId', searchQuery);
        if (!response.data) {
          throw new Error('找不到符合的公司');
        }
        response.data.統一編號 = searchQuery;
        const formattedResults = formatCompanyResults('taxId', response);
        setSearchResults(formattedResults);
        setTotalPages(1);
      } else {
        let response = await fetchSearchData('name', searchQuery, page);
        let formattedResults = formatCompanyResults('name', response);
        if (formattedResults.length === 0) {
          response = await fetchSearchData('chairman', searchQuery, page);
          formattedResults = formatCompanyResults('chairman', response);
        }
        if (formattedResults.length === 0) {
          throw new Error('找不到符合的公司');
        }
        setSearchResults(formattedResults);
        setTotalPages(Math.ceil(response.found / 10) || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('搜尋失敗：', error);
      setError(error instanceof Error ? error.message : '搜尋過程發生錯誤，請稍後再試');
    } finally {
      setIsSearching(false);
    }
  };

  const determineSearchType = (query: string): 'taxId' | 'name' => {
    const taxIdPattern = /^\d{8}$/;
    return taxIdPattern.test(query) ? 'taxId' : 'name';
  };

  const formatCompanyResults = (type: 'taxId' | 'name' | 'chairman', data: any): SearchData[] => {
    const companies = data.data;
    
    if (!companies) return [formatSearchData({})];

    if (type === 'taxId') return [formatSearchData(companies)];

    return Array.isArray(companies) 
      ? companies
          .map((company: SearchResponse) => formatSearchData(company))
          .filter(company => company.name !== '未提供')
      : [formatSearchData({})];
  };

  const handlePageChange = (page: number) => {
    handleSearch(null, page);
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
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {searchResults.map((company) => (
                <li key={company.taxId}>
                  <button
                    onClick={() => onCompanySelect(company.taxId)}
                    className="block hover:bg-gray-50 w-full text-left"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <p className="text-xl font-medium text-blue-600 truncate">
                            {company.name}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${company.status === '營業中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {company.status}
                          </span>
                        </div>
                        <div className="text-base text-gray-500">
                          統編：{company.taxId}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-x-6">
                          <p className="flex item-start text-base text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            負責人：{company.chairman}
                          </p>
                          <p className="flex item-start text-base text-gray-500" style={{ whiteSpace: 'pre-line' }}>
                            <Building2 className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {company.industry}
                          </p>
                          <p className="flex item-start text-base text-gray-500">
                            <FileSpreadsheet className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            標案數：{company.tenders}
                          </p>
                        </div>
                        <div className="flex item-start text-base text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {company.address}
                        </div>
                      </div>
                      <div className="mt-2 text-base text-gray-500">
                        實收資本額：{company.capital} | 員工人數：{company.employees}
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

          <div className="text-sm text-gray-500 text-center mt-4">
            資料來源：{`https://company.g0v.ronny.tw/api`}
          </div>
        </div>
      ) : null}
    </div>
  );
}