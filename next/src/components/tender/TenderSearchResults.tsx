'use client';

import { useRouter } from 'next/navigation';
import { TenderSearchResult, SearchType } from '@/lib/tender/types';
import Pagination from '@/components/Pagination';
import DataSource from '@/components/common/DataSource';
import { getLabelStyle } from '@/lib/tender/labels';
import TenderResultRow from './search-components/TenderResultRow';

interface TenderSearchResultsProps {
  results: TenderSearchResult[];
  totalPages: number;
  currentPage: number;
  searchQuery: string;
  searchType: SearchType;
}

export default function TenderSearchResults({
  results,
  totalPages,
  currentPage,
  searchQuery,
  searchType
}: TenderSearchResultsProps) {
  const router = useRouter();
  
  const handlePageChange = (page: number) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    router.push(`/tender/search?q=${encodedQuery}&type=${searchType}&page=${page}`);
  };
  
  const handleTenderSelect = (tenderId: string) => {
    // 存儲當前搜尋狀態到sessionStorage，以便返回時恢復
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tenderSearchParams', 
        JSON.stringify({ q: searchQuery, type: searchType, page: currentPage })
      );
      sessionStorage.setItem('tenderSearchScroll', window.scrollY.toString());
    }
    
    router.push(`/tender/detail/${tenderId}`);
  };

  return (
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
            {results.map((tender) => (
              <TenderResultRow
                key={tender.uniqueId}
                tender={tender}
                onClick={() => handleTenderSelect(tender.tenderId)}
              />
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
  );
}