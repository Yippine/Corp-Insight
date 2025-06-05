'use client';

import Link from 'next/link';
import { Building2, FileSpreadsheet, Users, MapPin } from 'lucide-react';
import { CompanyData } from '@/lib/company/types';
import Pagination from '@/components/Pagination';
import NoSearchResults from '@/components/common/NoSearchResults';
import DataSource from '@/components/common/DataSource';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { useLoadingState } from '@/components/common/loading/LoadingHooks';

interface CompanySearchResultsProps {
  companies: CompanyData[];
  totalPages: number;
  currentPage: number;
  searchQuery: string;
}

export default function CompanySearchResults({
  companies,
  totalPages,
  currentPage,
  searchQuery,
}: CompanySearchResultsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isLoading: isPageChangingState, setLoading } = useLoadingState(false);

  // 結合兩種狀態，創建單一isPageChanging變量
  const isPageChanging = isPending || isPageChangingState;

  if (!companies || companies.length === 0) {
    return (
      <NoSearchResults message="找不到符合的公司！" searchTerm={searchQuery} />
    );
  }

  const handlePageChange = (page: number) => {
    // 設置loading狀態，使其更一致
    setLoading(true);

    const url = `/company/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
    startTransition(() => {
      router.push(url);
      // 路由變化會自動重置loading狀態
    });
  };

  return (
    <div className="space-y-6">
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isPageChanging}
        />
      )}

      {isPageChanging ? (
        <div className="py-8">
          <InlineLoading />
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {companies.map(company => (
              <li key={company.taxId}>
                <Link
                  href={`/company/detail/${encodeURIComponent(company.taxId)}`}
                  className="block w-full p-6 text-left transition-colors duration-200 hover:bg-gray-50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="truncate text-xl font-medium text-blue-600">
                        {company.name}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                          company.status === '營業中' ||
                          company.status?.includes('核准')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.status}
                      </span>
                    </div>
                    <div className="text-base text-gray-500">
                      統編：{company.taxId}
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {company.chairman && company.chairman !== '無' && (
                      <div className="flex items-center text-base text-gray-600">
                        <Users className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">
                          負責人：{company.chairman}
                        </span>
                      </div>
                    )}
                    {company.industry && company.industry !== '未分類' && (
                      <div className="flex items-center text-base text-gray-600">
                        <Building2 className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{company.industry}</span>
                      </div>
                    )}
                    {company.tenderCount !== undefined &&
                      company.tenderCount > 0 && (
                        <div className="flex items-center text-base text-gray-600">
                          <FileSpreadsheet className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                          <span>參與標案：{company.tenderCount} 件</span>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {company.paidInCapital &&
                      company.paidInCapital !== '未提供' && (
                        <div className="flex items-center text-base text-gray-600">
                          <Building2 className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                          <span>實收資本額：{company.paidInCapital}</span>
                        </div>
                      )}
                    {company.employees && company.employees !== '未提供' && (
                      <div className="flex items-center text-base text-gray-600">
                        <Users className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span>員工人數：{company.employees}</span>
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-center text-base text-gray-600">
                        <MapPin className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{company.address}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isPageChanging}
        />
      )}

      <DataSource
        sources={[
          {
            name: '台灣公司資料',
            url: 'https://company.g0v.ronny.tw/',
          },
        ]}
      />
    </div>
  );
}
