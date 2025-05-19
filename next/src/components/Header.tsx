'use client';

import { usePathname } from 'next/navigation';
import { Search, Wrench, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import NavLink from './common/NavLink';

// 主要搜尋頁面路徑
const SEARCH_ROUTES = ['/company/search', '/tender/search', '/aitool/search'];

export default function Header() {
  const pathname = usePathname();
  const [showTryText, setShowTryText] = useState(true);

  // 模擬原來的效果，每 3 秒切換文字
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTryText(prev => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <NavLink
            href="/company/search"
            className="flex items-center cursor-pointer"
            smartLoading={true}
            replace={true}
          >
            <img src="/magnifier.ico" alt="企業放大鏡 Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              企業放大鏡™
              <span className="text-base ml-2 text-blue-600">βeta 版本</span>
            </h1>
          </NavLink>

          <nav className="flex space-x-8">
            <NavLink
              href="/aitool/search"
              className={`${
                pathname?.startsWith('/aitool')
                  ? 'text-amber-500 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-amber-600'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center group relative cursor-pointer focus:outline-none`}
              smartLoading={true}
            >
              <Wrench className="mr-2 h-6 w-6" />
              <span className="relative h-full flex items-center min-w-[95px] justify-center">
                <span 
                  className={`absolute left-0 right-0 transition-opacity duration-500 ${
                    showTryText ? 'opacity-100' : 'opacity-0 invisible'
                  } bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent animate-pulse flex justify-center items-center h-full`}
                >
                  立即試用 Try
                </span>
                <span 
                  className={`transition-opacity duration-500 absolute left-0 right-0 ${
                    showTryText ? 'opacity-0 invisible' : 'opacity-100'
                  } flex justify-center items-center h-full`}
                >
                  您的 AI 助理
                </span>
              </span>
            </NavLink>

            <NavLink
              href="/company/search"
              className={`${
                pathname?.startsWith('/company')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center cursor-pointer focus:outline-none`}
              smartLoading={true}
            >
              <Search className="mr-2 h-6 w-6" />
              企業搜尋
            </NavLink>

            <NavLink
              href="/tender/search"
              className={`${
                pathname?.startsWith('/tender')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center cursor-pointer focus:outline-none`}
              smartLoading={true}
            >
              <FileText className="mr-2 h-6 w-6" />
              標案搜尋
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}