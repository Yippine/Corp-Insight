'use client';

import { Building2, FileText } from 'lucide-react';
import { SearchType } from '@/lib/tender/types';

interface SearchTypeSelectorProps {
  currentType: SearchType;
  onChange: (type: SearchType) => void;
}

export default function SearchTypeSelector({
  currentType,
  onChange,
}: SearchTypeSelectorProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onChange('company')}
          className={`flex items-center rounded-md px-4 py-2 text-base font-medium transition-all duration-200 ${
            currentType === 'company'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="mr-2 h-5 w-5" />
          廠商搜尋
        </button>
        <button
          type="button"
          onClick={() => onChange('tender')}
          className={`flex items-center rounded-md px-4 py-2 text-base font-medium transition-all duration-200 ${
            currentType === 'tender'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="mr-2 h-5 w-5" />
          標案搜尋
        </button>
      </div>
    </div>
  );
}
