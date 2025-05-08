'use client';

import { Building2, FileText } from 'lucide-react';
import { SearchType } from '@/lib/tender/types';

interface SearchTypeSelectorProps {
  currentType: SearchType;
  onChange: (type: SearchType) => void;
}

export default function SearchTypeSelector({ 
  currentType, 
  onChange 
}: SearchTypeSelectorProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-lg p-1 bg-gray-100">
        <button
          type="button"
          onClick={() => onChange('company')}
          className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
            currentType === 'company'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="h-5 w-5 mr-2" />
          廠商搜尋
        </button>
        <button
          type="button"
          onClick={() => onChange('tender')}
          className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
            currentType === 'tender'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-5 w-5 mr-2" />
          標案搜尋
        </button>
      </div>
    </div>
  );
}