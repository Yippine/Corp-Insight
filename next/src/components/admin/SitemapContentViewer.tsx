'use client';

import React from 'react';

interface SitemapContentViewerProps {
  url: string;
  content: string;
  isLoading: boolean;
  onClose: () => void;
  onValidate: () => void;
  onOpenNewWindow: () => void;
}

export default function SitemapContentViewer({
  url,
  content,
  isLoading,
  onClose,
  onValidate,
  onOpenNewWindow,
}: SitemapContentViewerProps) {
  if (!url) return null;

  return (
    <div id="sitemap-content" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📄 內容查看器</h3>
            <p className="text-sm text-gray-600">
              <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">{url}</code>
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onValidate}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              ✅ 驗證格式
            </button>
            <button
              onClick={onOpenNewWindow}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              🔗 新視窗開啟
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              ✕ 關閉
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">載入中...</span>
            </div>
          </div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border max-h-96 whitespace-pre-wrap break-words">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}