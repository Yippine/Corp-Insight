import { useEffect, useState } from 'react';
import Pagination from '../Pagination';

interface SearchResultsProps {
  searchState: {
    type: string;
    query: string;
    page: number;
  };
  onPageChange: (page: number) => void;
  onUnitClick: (unitId: string) => void;
  onTenderClick: (unitId: string, jobNumber: string) => void;
}

export default function SearchResults({
  searchState,
  onPageChange,
  onUnitClick,
  onTenderClick,
}: SearchResultsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '';
        const encodedQuery = encodeURIComponent(searchState.query);
        
        switch (searchState.type) {
          case 'keyword':
            url = `https://pcc.g0v.ronny.tw/api/searchbytitle?query=${encodedQuery}&page=${searchState.page}`;
            break;
          case 'company':
            url = `https://pcc.g0v.ronny.tw/api/searchbycompanyname?query=${encodedQuery}&page=${searchState.page}`;
            break;
          case 'taxId':
            url = `https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${encodedQuery}&page=${searchState.page}`;
            break;
        }

        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('資料載入失敗，請稍後再試');
      }
      setLoading(false);
    };

    fetchData();
  }, [searchState]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">{error}</div>
    );
  }

  const renderRow = (item: any) => {
    const isCompanySearch = searchState.type === 'company' || searchState.type === 'taxId';
    
    // 整合公司資訊
    const companyInfo = Object.entries(item.brief.companies.name_key as Record<string, string[]>)
      .map(([companyName, bidStatus]) => {
        return {
          name: companyName.split('(')[0].trim(),
          status: bidStatus[1]?.includes('未得標') ? '未得標' : '得標'
        };
      })
    
    return (
      <tr
        key={`${item.unit_id}-${item.job_number}-${item.date}`}
        className="hover:bg-gray-50"
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {item.date}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {item.brief.type}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <button
            onClick={() => onUnitClick(item.unit_id)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {item.unit_name}
          </button>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <button
            onClick={() => onTenderClick(item.unit_id, item.job_number)}
            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {item.brief.title}
          </button>
        </td>
        {isCompanySearch && (
          <td className="px-6 py-4 text-sm text-gray-900">
            <div className="space-y-2">
              {companyInfo?.map((company: any, index: number) => (
                <div
                  key={`${item.unit_id}-${item.job_number}-company-${index}`}
                  className={`px-3 py-1 rounded-md ${
                    company.status === '得標'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {company.name}
                  <span className="ml-2 text-xs font-medium">
                    ({company.status})
                  </span>
                </div>
              ))}
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {data?.total_pages > 0 && (
        <Pagination
          currentPage={searchState.page}
          totalPages={data.total_pages}
          onPageChange={onPageChange}
        />
      )}
      
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                類別
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                機關
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                標案名稱
              </th>
              {(searchState.type === 'company' || searchState.type === 'taxId') && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投標廠商
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.records?.map(renderRow)}
          </tbody>
        </table>
      </div>

      {data?.total_pages > 0 && (
        <Pagination
          currentPage={searchState.page}
          totalPages={data.total_pages}
          onPageChange={onPageChange}
        />
      )}

      <div className="text-xs text-gray-500 text-center mt-4">
        資料來源：{`https://pcc.g0v.ronny.tw/api`}
      </div>
    </div>
  );
}