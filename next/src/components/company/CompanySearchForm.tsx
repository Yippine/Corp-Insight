'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, FileSpreadsheet, Users } from 'lucide-react';
import { ButtonLoading, InlineLoading } from '../common/loading/LoadingTypes';
import { useLoadingState } from '../common/loading/LoadingHooks';

interface CompanySearchFormProps {
  initialQuery?: string;
  disableAutoRedirect?: boolean;
  isSingleResult?: boolean;
}

export default function CompanySearchForm({
  initialQuery = '',
  disableAutoRedirect = false,
  isSingleResult = false,
}: CompanySearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isLoading: isSearchingDebounced, setLoading } =
    useLoadingState(false);

  // 組合本地載入狀態和全局載入狀態
  const isSearching = isPending || isSearchingDebounced;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setLoading(true);

    // 如果搜尋結果只有一筆且不需要禁用自動跳轉，則直接跳轉到詳情頁
    if (isSingleResult && !disableAutoRedirect) {
      // 直接跳轉到企業詳情頁，由伺服器端處理跳轉邏輯
      startTransition(() => {
        router.push(
          `/company/search?q=${encodeURIComponent(trimmedQuery)}&autoRedirect=true`
        );
      });
    } else {
      // 正常搜尋流程
      const url = `/company/search?q=${encodeURIComponent(trimmedQuery)}${disableAutoRedirect ? '&noRedirect=true' : ''}`;

      startTransition(() => {
        router.push(url);
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex rounded-lg shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block h-full w-full rounded-l-lg border-gray-300 pl-10 text-xl focus:border-blue-500 focus:ring-blue-500"
              placeholder="輸入公司名稱、統編、負責人或關鍵字"
              disabled={isSearching || isSingleResult}
            />
          </div>
          <button
            type="submit"
            className="relative -ml-px inline-flex items-center rounded-r-lg border border-transparent bg-blue-600 px-8 py-3 text-xl font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSearching}
          >
            {isSearching || isSingleResult ? (
              <ButtonLoading text="搜尋" />
            ) : (
              '搜尋'
            )}
          </button>
        </div>
        <div className="mt-2 flex justify-center space-x-4 text-base text-gray-500">
          <span className="flex items-center">
            <Building2 className="mr-1 h-5 w-5" />
            公司名稱
          </span>
          <span className="flex items-center">
            <FileSpreadsheet className="mr-1 h-5 w-5" />
            統一編號
          </span>
          <span className="flex items-center">
            <Users className="mr-1 h-5 w-5" />
            負責人
          </span>
          <span className="flex items-center">
            <Search className="mr-1 h-5 w-5" />
            關鍵字
          </span>
        </div>
      </form>

      {(isSearching || isSingleResult) && (
        <div className="py-8">
          <InlineLoading />
        </div>
      )}
    </div>
  );
}
