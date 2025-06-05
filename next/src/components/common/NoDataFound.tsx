'use client';

import { Search } from 'lucide-react';

interface NoDataFoundProps {
  message?: string;
  icon?: React.ElementType;
}

export default function NoDataFound({
  message = '查無資料',
  icon: Icon = Search,
}: NoDataFoundProps) {
  return (
    <div className="py-12 text-center">
      <div className="overflow-hidden bg-white p-12 sm:rounded-lg">
        <div className="space-y-4 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Icon className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">{message}</h3>
        </div>
      </div>
    </div>
  );
}
