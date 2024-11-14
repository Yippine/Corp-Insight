import { useState } from 'react';
import { Building2, FileSpreadsheet, FileText, Search } from 'lucide-react';
import Pagination from '../Pagination';
import { useTenderSearch, TenderSearchData } from '../../hooks/useTenderSearch';

interface TenderSearchProps {
  onTenderSelect: (tenderId: string) => void;
}

export default function TenderSearch({ onTenderSelect }: TenderSearchProps) {
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
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent | null, page: number = 1) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      let url = '';
      const encodedQuery = encodeURIComponent(searchQuery);
      
      switch (searchType) {
        case 'keyword':
          url = `https://pcc.g0v.ronny.tw/api/searchbytitle?query=${encodedQuery}&page=${page}`;
          break;
        case 'company':
          url = `https://pcc.g0v.ronny.tw/api/searchbycompanyname?query=${encodedQuery}&page=${page}`;
          break;
        case 'taxId':
          url = `https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${encodedQuery}&page=${page}`;
          break;
      }

      const response = await fetch(url);
      const data = await response.json();

      const formattedResults: TenderSearchData[] = data.records.map((record: any) => ({
        tenderId: `${record.unit_id}-${record.job_number}`,
        date: record.date,
        type: record.brief.type,
        title: record.brief.title,
        unitName: record.unit_name,
        unitId: record.unit_id,
        amount: record.brief.amount || '未提供',
        status: record.brief.type.includes('決標') ? '已決標' : '招標中',
        companies: Object.entries(record.brief.companies?.name_key || {}).map(([name, status]: [string, any]) => ({
          name: name.split('(')[0].trim(),
          status: status[1]?.includes('未得標') ? '未得標' : '得標'
        }))
      }));

      setSearchResults(formattedResults);
      setTotalPages(Math.ceil(data.found / 10) || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('搜尋失敗：', error);
      setError('搜尋過程發生錯誤，請稍後再試');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(null, page);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
        <div className="flex space-x-4">
          <select
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'keyword' | 'company' | 'taxId')}
          >
            <option value="keyword">標案名稱</option>
            <option value="company">廠商名稱</option>
            <option value="taxId">統一編號</option>
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              className="block w-full h-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
              placeholder={
                searchType === 'keyword' ? '請輸入標案名稱...' :
                searchType === 'company' ? '請輸入廠商名稱...' :
                '請輸入統一編號...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            搜尋
          </button>
        </div>
        
        <div className="mt-2 flex justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            標案名稱
          </span>
          <span className="flex items-center">
            <Building2 className="h-4 w-4 mr-1" />
            公司名稱
          </span>
          <span className="flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            統一編號
          </span>
          <span className="flex items-center">
            <Search className="h-4 w-4 mr-1" />
            關鍵字
          </span>
        </div>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    類型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    標案名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    機關名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((tender) => (
                  <tr key={tender.tenderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tender.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tender.type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => onTenderSelect(tender.tenderId)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {tender.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tender.unitName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tender.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tender.status === '已決標' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tender.status}
                      </span>
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

          <div className="text-xs text-gray-500 text-center mt-4">
            資料來源：{`https://pcc.g0v.ronny.tw/api`}
          </div>
        </div>
      ) : null}
    </div>
  );
}