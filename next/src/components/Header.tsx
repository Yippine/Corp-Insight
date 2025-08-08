'use client';

import { usePathname } from 'next/navigation';
import { Search, Wrench, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import NavLink from './common/NavLink';
import { generateUrl } from '@/config/site';

export default function Header() {
  const pathname = usePathname();
  const [showTryText, setShowTryText] = useState(true);
  const [currentHost, setCurrentHost] = useState<string>('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.host);
    }
  }, []);

  // 模擬原來的效果，每 3 秒切換文字
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTryText(prev => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // 判斷當前是否在 aitools 域名下，決定 Logo 點擊行為
  const isOnAiTools = currentHost.includes('aitools');
  const logoHref = isOnAiTools 
    ? generateUrl('aitools', '/search', currentHost)
    : generateUrl('company', '/company/search', currentHost);

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <NavLink
            href={logoHref}
            className="flex cursor-pointer items-center"
            smartLoading={true}
            replace={true}
          >
            <img
              src="/magnifier.ico"
              alt="企業放大鏡 Logo"
              className="mr-3 h-8 w-8"
            />
            <h1 className="text-4xl font-bold text-gray-900">
              企業放大鏡™
              <span className="ml-2 text-base text-blue-600">βeta 版本</span>
            </h1>
          </NavLink>

          <nav className="flex space-x-8">
            <NavLink
              href={generateUrl('aitools', '/search', currentHost)}
              className={`${
                pathname?.startsWith('/aitool') || pathname?.startsWith('/search') || pathname?.startsWith('/detail')
                  ? 'border-b-2 border-amber-500 text-amber-500'
                  : 'text-gray-500 hover:text-amber-600'
              } group relative -mb-4 flex cursor-pointer items-center px-1 pb-4 text-base font-medium focus:outline-none`}
              smartLoading={true}
            >
              <Wrench className="mr-2 h-6 w-6" />
              <span className="relative flex h-full min-w-[95px] items-center justify-center">
                <span
                  className={`absolute left-0 right-0 transition-opacity duration-500 ${
                    showTryText ? 'opacity-100' : 'invisible opacity-0'
                  } flex h-full animate-pulse items-center justify-center bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent`}
                >
                  立即試用 Try
                </span>
                <span
                  className={`absolute left-0 right-0 transition-opacity duration-500 ${
                    showTryText ? 'invisible opacity-0' : 'opacity-100'
                  } flex h-full items-center justify-center`}
                >
                  您的 AI 助理
                </span>
              </span>
            </NavLink>

            <NavLink
              href={generateUrl('company', '/company/search', currentHost)}
              className={`${
                pathname?.startsWith('/company')
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              } -mb-4 flex cursor-pointer items-center px-1 pb-4 text-base font-medium focus:outline-none`}
              smartLoading={true}
            >
              <Search className="mr-2 h-6 w-6" />
              企業搜尋
            </NavLink>

            <NavLink
              href={generateUrl('tender', '/tender/search', currentHost)}
              className={`${
                pathname?.startsWith('/tender')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              } -mb-4 flex cursor-pointer items-center px-1 pb-4 text-base font-medium focus:outline-none`}
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
