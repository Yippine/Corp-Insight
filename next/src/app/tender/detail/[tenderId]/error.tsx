'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function TenderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Tender detail error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-800">
            載入標案詳情時發生錯誤
          </h2>
        </div>
        <p className="mt-3 text-sm text-red-700">
          {error.message || '發生未知錯誤，請稍後再試。'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          重新載入
        </button>
      </div>
    </div>
  );
}
