'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { SearchType } from '@/lib/tender/types';
import SearchTypeSelector from './search-components/SearchTypeSelector';

interface TenderSearchFormProps {
  initialQuery?: string;
  initialType?: SearchType;
}

export default function TenderSearchForm({
  initialQuery = '',
  initialType = 'company',
}: TenderSearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const router = useRouter();

  // 同步表單狀態與URL參數
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialType === 'tender' || initialType === 'company') {
      setSearchType(initialType);
    }
  }, [initialType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const encodedQuery = encodeURIComponent(searchQuery.trim());
    router.push(`/tender/search?q=${encodedQuery}&type=${searchType}&page=1`);
  };

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      {/* 搜尋類型選擇器 */}
      <SearchTypeSelector
        currentType={searchType}
        onChange={handleTypeChange}
      />

      {/* 搜尋輸入框 */}
      <div className="mt-4 flex rounded-lg shadow-sm">
        <div className="relative flex-grow focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="block h-full w-full rounded-l-lg border-gray-300 pl-10 text-xl focus:border-green-500 focus:ring-green-500"
            placeholder={
              searchType === 'tender'
                ? '輸入標案名稱或關鍵字'
                : '輸入廠商名稱、統編或關鍵字'
            }
          />
        </div>
        <button
          type="submit"
          className="relative -ml-px inline-flex items-center rounded-r-lg border border-transparent bg-green-600 px-8 py-3 text-xl font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          搜尋
        </button>
      </div>

      {/* 搜尋提示 */}
      <div className="mt-2 flex justify-center space-x-4 text-base text-gray-500">
        {searchType === 'tender' ? (
          <>
            <span className="flex items-center">
              <FileText className="mr-1 h-5 w-5" />
              標案名稱
            </span>
            <span className="flex items-center">
              <Search className="mr-1 h-5 w-5" />
              關鍵字
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center">
              <Building2 className="mr-1 h-5 w-5" />
              廠商名稱
            </span>
            <span className="flex items-center">
              <FileSpreadsheet className="mr-1 h-5 w-5" />
              統一編號
            </span>
            <span className="flex items-center">
              <Search className="mr-1 h-5 w-5" />
              關鍵字
            </span>
          </>
        )}
      </div>
    </form>
  );
}
