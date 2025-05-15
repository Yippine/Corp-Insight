'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, Wrench, FileText } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLoading } from './common/loading/LoadingProvider';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = useLoading();
  const [showTryText, setShowTryText] = useState(true);
  const navigationInProgress = useRef(false);

  // 模擬原來的效果，每 3 秒切換文字
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTryText(prev => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // 預加載常用路由
  useEffect(() => {
    // 提前準備好所有主要路由，優先級高
    const mainRoutes = ['/company/search', '/tender/search', '/aitool/search'];
    Promise.all(mainRoutes.map(route => router.prefetch(route)));
  }, [router]);

  // 優化的路由處理函數
  const handleNavigation = useCallback((path: string) => {
    // 避免重複點擊和重複導航
    if (navigationInProgress.current || path === pathname) {
      return;
    }

    // 標記導航正在進行中
    navigationInProgress.current = true;
    
    // 立即啟動載入指示器
    startLoading();
    
    // 執行導航
    router.push(path);
    
    // 300ms後重置狀態，避免重複點擊
    setTimeout(() => {
      navigationInProgress.current = false;
    }, 300);
  }, [router, pathname, startLoading]);
  
  // 為每個按鈕創建高效的事件處理函數
  const navHandlers = {
    home: () => handleNavigation('/'),
    aiTool: () => handleNavigation('/aitool/search'),
    company: () => handleNavigation('/company/search'),
    tender: () => handleNavigation('/tender/search')
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <button
            onClick={navHandlers.home}
            className="flex items-center cursor-pointer"
          >
            <img src="/magnifier.ico" alt="企業放大鏡 Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              企業放大鏡™
              <span className="text-base ml-2 text-blue-600">βeta 版本</span>
            </h1>
          </button>

          <nav className="flex space-x-8">
            <button
              onClick={navHandlers.aiTool}
              className={`${
                pathname?.startsWith('/aitool')
                  ? 'text-amber-500 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-amber-600'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center group relative cursor-pointer focus:outline-none`}
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
            </button>

            <button
              onClick={navHandlers.company}
              className={`${
                pathname?.startsWith('/company')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center cursor-pointer focus:outline-none`}
            >
              <Search className="mr-2 h-6 w-6" />
              企業搜尋
            </button>

            <button
              onClick={navHandlers.tender}
              className={`${
                pathname?.startsWith('/tender')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center cursor-pointer focus:outline-none`}
            >
              <FileText className="mr-2 h-6 w-6" />
              標案搜尋
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}