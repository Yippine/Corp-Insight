'use client';

import { Search, RefreshCw } from 'lucide-react';

interface NoSearchResultsProps {
  message?: string;
  searchTerm?: string;
  onReset?: () => void;
}

export default function NoSearchResults({ 
  message = '很抱歉，我們找不到符合您搜尋條件的結果。',
  searchTerm,
  onReset
}: NoSearchResultsProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Search className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">查無搜尋結果</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {message && (
            <>
              {message}
              <br />
            </>
          )}
          {searchTerm && (
            <span className="font-medium">「{searchTerm}」</span>
          )}
        </p>
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">您可以：</p>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>• 檢查關鍵字是否有誤字</li>
            <li>• 嘗試使用不同的關鍵字</li>
            <li>• 使用較寬鬆的搜尋條件</li>
          </ul>
        </div>
        {onReset && (
          <button 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            onClick={onReset}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </button>
        )}
      </div>
    </div>
  );
}