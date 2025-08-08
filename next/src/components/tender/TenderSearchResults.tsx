'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TenderSearchResult, SearchType } from '@/lib/tender/types';
import Pagination from '@/components/Pagination';
import DataSource from '@/components/common/DataSource';
import TenderResultRow from './search-components/TenderResultRow';
import { generateUrl } from '@/config/site';

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
  searchType,
}: TenderSearchResultsProps) {
  const router = useRouter();
  const [currentHost, setCurrentHost] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.host);
    }
  }, []);

  const handlePageChange = (page: number) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = generateUrl('tender', `/tender/search?q=${encodedQuery}&type=${searchType}&page=${page}`, currentHost);
    router.push(url);
  };

  const handleTenderSelect = (tenderId: string) => {
    // 存儲當前搜尋狀態到sessionStorage，以便返回時恢復
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'tenderSearchParams',
        JSON.stringify({ q: searchQuery, type: searchType, page: currentPage })
      );
      sessionStorage.setItem('tenderSearchScroll', window.scrollY.toString());
    }

    router.push(generateUrl('tender', `/tender/detail/${tenderId}`, currentHost));
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

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="w-[5%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
              >
                {searchType === 'company' ? '狀態' : '階段'}
              </th>
              <th
                scope="col"
                className="w-[12%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
              >
                日期
              </th>
              <th
                scope="col"
                className="w-[19.5%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
              >
                類型
              </th>
              <th
                scope="col"
                className="w-[34%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
              >
                標案名稱
              </th>
              <th
                scope="col"
                className="w-[19.5%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
              >
                機關名稱
              </th>
              <th
                scope="col"
                className="w-[10%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
              >
                金額
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {results.map(tender => (
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
            url: 'https://pcc-api.openfun.app/',
          },
        ]}
      />
    </div>
  );
}
