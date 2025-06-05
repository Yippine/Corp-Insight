'use client';

import { Search, RefreshCw } from 'lucide-react';

interface NoSearchResultsProps {
  message?: string;
  searchTerm?: string;
  query?: string;
  tag?: string;
  onReset?: () => void;
  onClear?: () => void;
}

export default function NoSearchResults({
  message = '很抱歉，我們找不到符合您搜尋條件的結果。',
  searchTerm,
  query,
  tag,
  onReset,
  onClear,
}: NoSearchResultsProps) {
  // 使用 query 或 searchTerm，優先使用 query
  const displayTerm = query || searchTerm;
  const handleReset = onClear || onReset;

  return (
    <div className="overflow-hidden bg-white p-12 shadow sm:rounded-lg">
      <div className="space-y-4 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Search className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">查無搜尋結果</h3>
        <p className="mx-auto max-w-md text-gray-600">
          {message && (
            <>
              {message}
              <br />
            </>
          )}
          {displayTerm && (
            <span className="font-medium">搜尋詞：「{displayTerm}」</span>
          )}
          {tag && (
            <>
              {displayTerm && <br />}
              <span className="font-medium">標籤：「{tag}」</span>
            </>
          )}
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">您可以：</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 檢查關鍵字是否有誤字</li>
            <li>• 嘗試使用不同的關鍵字</li>
            <li>• 使用較寬鬆的搜尋條件</li>
            <li>• 清除篩選條件重新搜尋</li>
          </ul>
        </div>
        {handleReset && (
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            onClick={handleReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            清除篩選
          </button>
        )}
      </div>
    </div>
  );
}
