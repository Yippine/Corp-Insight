'use client';

import Link from 'next/link';
import { Building2, FileSpreadsheet, Users, MapPin, ChevronRight } from 'lucide-react';
import { CompanyData } from '@/lib/company/types';
import { formatCapital } from '@/lib/company/utils';

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
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">找不到符合的公司</h2>
        <p className="text-gray-600 mt-2">
          沒有找到與 &quot;{searchQuery}&quot; 相符的企業資料，請嘗試其他搜尋關鍵字。
        </p>
      </div>
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
        {companies.map((company) => (
          <Link
            href={`/company/detail/${encodeURIComponent(company.taxId)}`}
            key={company.taxId}
            className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="space-y-2 flex-grow">
                <h3 className="text-lg md:text-xl font-bold text-blue-700">
                  {company.name}
                </h3>
                <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm md:text-base text-gray-600">
                  <span className="flex items-center mb-1 sm:mb-0">
                    <FileSpreadsheet className="h-4 w-4 mr-1 inline" />
                    統編：{company.taxId}
                  </span>
                  {company.chairman && (
                    <span className="flex items-center mb-1 sm:mb-0">
                      <Users className="h-4 w-4 mr-1 inline" />
                      負責人：{company.chairman}
                    </span>
                  )}
                </div>
                {company.address && (
                  <div className="flex items-start text-sm md:text-base text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 mt-1 inline shrink-0" />
                    <span>{company.address}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-600 mt-1">
                  {company.status && (
                    <span className="mb-1 sm:mb-0">
                      登記狀態：
                      <span className={company.status.includes('核准') ? 'text-green-600' : 'text-red-600'}>
                        {company.status}
                      </span>
                    </span>
                  )}
                  {company.capital !== undefined && (
                    <span>資本額：{formatCapital(company.capital)} 元</span>
                  )}
                  {company.tenderCount !== undefined && company.tenderCount > 0 && (
                    <span className="text-blue-600">
                      標案數量：{company.tenderCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex justify-end">
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
        />
      )}
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