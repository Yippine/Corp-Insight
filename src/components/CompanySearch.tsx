import { useState } from 'react';
import { Search, Building2, FileSpreadsheet, Users, MapPin } from 'lucide-react';

interface CompanySearchProps {
  onCompanySelect: (companyId: string) => void;
}

export default function CompanySearch({ onCompanySelect }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // TODO: 實際的API呼叫
    // 模擬API回應
    setTimeout(() => {
      setSearchResults([
        {
          id: '1',
          name: '台積電股份有限公司',
          taxId: '22099131',
          address: '新竹科學園區力行六路8號',
          chairman: '劉德音',
          industry: '半導體製造業',
          capital: '259,304,805,000',
          tenders: 156,
          employees: '70,000+'
        },
        {
          id: '2',
          name: '台積電半導體股份有限公司',
          taxId: '84149243',
          address: '台南市南部科學園區南科三路',
          chairman: '魏哲家',
          industry: '半導體製造業',
          capital: '50,000,000',
          tenders: 23,
          employees: '5,000+'
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex shadow-sm rounded-lg">
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full h-full rounded-l-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 text-lg"
              placeholder="輸入公司名稱、統編、負責人或關鍵字"
            />
          </div>
          <button
            type="submit"
            className="relative -ml-px inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            搜尋
          </button>
        </div>
        <div className="mt-2 flex justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Building2 className="h-4 w-4 mr-1" />
            公司名稱
          </span>
          <span className="flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            統一編號
          </span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            負責人
          </span>
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            地址
          </span>
        </div>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {searchResults.map((company) => (
              <li key={company.id}>
                <button
                  onClick={() => onCompanySelect(company.id)}
                  className="block hover:bg-gray-50 w-full text-left"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <p className="text-lg font-medium text-blue-600 truncate">
                          {company.name}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          營業中
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        統編：{company.taxId}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-x-6">
                        <p className="flex items-center text-sm text-gray-500">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          負責人：{company.chairman}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {company.industry}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          <FileSpreadsheet className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          標案數：{company.tenders}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {company.address}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      實收資本額：NT$ {company.capital} | 員工人數：{company.employees}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}