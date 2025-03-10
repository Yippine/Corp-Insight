'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, FileSpreadsheet, Users } from 'lucide-react';

interface CompanySearchFormProps {
  initialQuery?: string;
  disableAutoRedirect?: boolean;
}

export default function CompanySearchForm({ initialQuery = '', disableAutoRedirect = false }: CompanySearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    // 使用 Next.js 路由進行導航，保持 URL 乾淨
    const url = `/company/search?q=${encodeURIComponent(trimmedQuery)}${disableAutoRedirect ? '&noRedirect=true' : ''}`;
    router.push(url);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex shadow-sm rounded-lg">
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full h-full rounded-l-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 text-xl"
              placeholder="輸入公司名稱、統編、負責人或關鍵字"
            />
          </div>
          <button
            type="submit"
            className="relative -ml-px inline-flex items-center px-8 py-3 border border-transparent text-xl font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            搜尋
          </button>
        </div>
        <div className="mt-2 flex justify-center space-x-4 text-base text-gray-500">
          <span className="flex items-center">
            <Building2 className="h-5 w-5 mr-1" />
            公司名稱
          </span>
          <span className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-1" />
            統一編號
          </span>
          <span className="flex items-center">
            <Users className="h-5 w-5 mr-1" />
            負責人
          </span>
          <span className="flex items-center">
            <Search className="h-5 w-5 mr-1" />
            關鍵字
          </span>
        </div>
      </form>
    </div>
  );
}