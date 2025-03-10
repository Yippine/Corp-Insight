'use client';

import Link from 'next/link';
import { Building2, FileSpreadsheet, Users, MapPin, ChevronRight } from 'lucide-react';
import { CompanyData } from '@/lib/company/types';
import { formatCapital } from '@/lib/company/utils';
import NoSearchResults from '@/components/common/NoSearchResults';
import DataSource from '@/components/common/DataSource';

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
  searchQuery
}: CompanySearchResultsProps) {
  if (!companies || companies.length === 0) {
    return (
      <NoSearchResults 
        message="找不到符合的公司！"
        searchTerm={searchQuery}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          搜尋 &quot;{searchQuery}&quot; 的結果：共 {companies.length} 筆資料
        </h2>
      </div>

      <div className="space-y-4">
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
          />
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {companies.map((company) => (
              <li key={company.taxId}>
                <Link
                  href={`/company/detail/${encodeURIComponent(company.taxId)}`}
                  className="block hover:bg-gray-50 w-full text-left p-6 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-medium text-blue-600 truncate">
                        {company.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        company.status === '營業中' || company.status?.includes('核准') 
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {company.chairman && company.chairman !== '無' &&
                      <div className="flex items-center text-base text-gray-600">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span className="truncate">負責人：{company.chairman}</span>
                      </div>
                    }
                    {company.industry && company.industry !== '未分類' &&
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {company.capital !== undefined &&
                      <div className="flex items-center text-base text-gray-600">
                        <Building2 className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>實收資本額：{formatCapital(company.capital)}</span>
                      </div>
                    }
                    {company.employees && company.employees !== '未提供' &&
                      <div className="flex items-center text-base text-gray-600">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>員工人數：{company.employees}</span>
                      </div>
                    }
                    {company.address &&
                      <div className="flex items-center text-base text-gray-600">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span className="truncate">{company.address}</span>
                      </div>
                    }
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
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
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

function Pagination({ currentPage, totalPages, searchQuery }: PaginationProps) {
  // 創建頁碼範圍
  const getPageRange = () => {
    const range = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    return range;
  };

  const pageRange = getPageRange();

  return (
    <div className="flex justify-center mt-8">
      <nav className="inline-flex rounded-md shadow-sm">
        {currentPage > 1 && (
          <Link
            href={`/company/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage - 1}`}
            className="px-3 py-2 border border-gray-300 rounded-l-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            上一頁
          </Link>
        )}

        {pageRange.map((page) => (
          <Link
            key={page}
            href={`/company/search?q=${encodeURIComponent(searchQuery)}&page=${page}`}
            className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
              page === currentPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link
            href={`/company/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage + 1}`}
            className="px-3 py-2 border border-gray-300 rounded-r-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            下一頁
          </Link>
        )}
      </nav>
    </div>
  );
} 