import { useState } from 'react';
import { Search, Building2, FileSpreadsheet, Users, MapPin } from 'lucide-react';

interface CompanyData {
  id: string;
  name: string;
  status: string;
  taxId: string;
  chairman: string;
  industry: string;
  tenders: number;
  address: string;
  capital: string;
  employees: string;
}

interface ApiCompanyResponse {
  id?: string;
  商業名稱?: string;
  公司名稱?: string;
  現況?: string;
  公司狀況?: string;
  統一編號?: string;
  負責人姓名?: string;
  代表人姓名?: string;
  營業項目?: string;
  所營事業資料?: string;
  地址?: string;
  公司所在地?: string;
  '資本額(元)'?: number | string;
  '資本總額(元)'?: number | string;
}

interface CompanySearchProps {
  onCompanySelect: (companyId: string) => void;
}

export default function CompanySearch({ onCompanySelect }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    
    try {
      const searchType = determineSearchType(query);
      if (searchType === 'taxId') {
        // 如果是統編，直接搜尋
        const response = await fetchCompanyData('taxId', query);
        const formattedResults = formatCompanyResults('taxId', response);
        setSearchResults(formattedResults);
      } else {
        // 先嘗試用公司名稱搜尋
        const response = await fetchCompanyData('name', query);
        let formattedResults = formatCompanyResults('name', response);
        if (formattedResults.length === 0) {
          // 如果公司名稱搜尋失敗，改用負責人名稱搜尋
          const response = await fetchCompanyData('chairman', query);
          formattedResults = formatCompanyResults('chairman', response);
        }
        setSearchResults(formattedResults);
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
      setError('搜尋過程發生錯誤，請稍後再試');
    } finally {
      setIsSearching(false);
    }
  };

  const determineSearchType = (query: string): 'taxId' | 'name' => {
    const taxIdPattern = /^\d{8}$/;
    return taxIdPattern.test(query) ? 'taxId' : 'name';
  };

  const fetchCompanyData = async (type: 'taxId' | 'name' | 'chairman', query: string) => {
    const baseUrl = 'http://company.g0v.ronny.tw/api';
    const endpoints = {
      taxId: `${baseUrl}/show/${query}`,
      name: `${baseUrl}/search?q=${encodeURIComponent(query)}&page=1`,
      chairman: `${baseUrl}/name?q=${encodeURIComponent(query)}&page=1`
    };

    const response = await fetch(endpoints[type]);
    if (!response.ok) throw new Error('API 請求失敗');
    return await response.json() as CompanyData[];
  };

  const getCompanyName = (name: string): string => {
    return Array.isArray(name) ? name[0] : name.trim();
  };

  const getCompanyStatus = (company: ApiCompanyResponse): string => {
    const statusConditions = ['歇業', '撤銷', '廢止', '解散'];
    const fields = ['現況', '公司狀況'];
    
    for (const condition of statusConditions) {
      for (const field of fields) {
        const fieldValue = company[field as keyof ApiCompanyResponse];
        if (typeof fieldValue === 'string' && fieldValue.includes(condition)) {
          return `已${condition}`;
        }
      }
    }
    return '營業中';
  };

  const getIndustryInfo = (industryInfo: string): string => {
    // 定義一個正則表達式，用於匹配所有的中文字符和標點符號
    const chineseTextRegex = /[\u4e00-\u9fa5\u3000-\u303f\u2014\uFF00-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFFEF]+/g;

    const pureChineseItems = industryInfo
      .replace(/[\(（︹][^)）]*[\)）︺]/g, '') // 移除括號及其內容
      .replace(/(?<![０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾])([０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾]{1,2}、)/g, '') // 移除項目編號，包括"拾壹"等情況
      .replace(/[．。]+/g, '\n') // 移除末尾的句號或其他標點符號
      .match(chineseTextRegex)?.join('\n') || '未分類';

    return pureChineseItems;
  };

  const formatCompanyData = (company: ApiCompanyResponse): CompanyData => {
    return {
      id: company.id || String(Math.random()),
      name: getCompanyName(company.商業名稱 || company.公司名稱 || '未知'),
      status: getCompanyStatus(company),
      taxId: company.統一編號 || '未知',
      chairman: company.負責人姓名 || company.代表人姓名 || '無',
      industry: getIndustryInfo(company.所營事業資料?.[0]?.[1] || company.營業項目 || ''),
      tenders: NaN,
      address: company.地址 || company.公司所在地 || '未知',
      capital: formatCapital(company['資本額(元)'] || company['資本總額(元)'] || 0),
      employees: '未知'
    };
  };

  const formatCompanyResults = (type: 'taxId' | 'name' | 'chairman', data: any): CompanyData[] => {
    const companies = data.data;
    
    if (!companies)
      return [formatCompanyData({})];

    if (type === 'taxId')
      return [formatCompanyData(companies)];

    return Array.isArray(companies) 
      ? companies.map((company: ApiCompanyResponse) => formatCompanyData(company))
      : [formatCompanyData({})];
  };

  const formatCapital = (capital: number | string): string => {
    const sanitizedCapital = String(capital).replace(/,/g, '');
    const amount = Number(sanitizedCapital);
    return `NT$ ${amount.toLocaleString()}`;
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.status === '營業中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {company.status}
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
                        <p className="flex items-center text-sm text-gray-500" style={{ whiteSpace: 'pre-line' }}>
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
                      實收資本額：{company.capital} | 員工人數：{company.employees}
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