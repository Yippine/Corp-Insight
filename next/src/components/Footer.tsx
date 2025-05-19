'use client';

import { usePathname } from 'next/navigation';
import SimpleFooter from '@/components/SimpleFooter';
import NavLink from './common/NavLink';

// 主要搜尋頁面路徑
const SEARCH_ROUTES = ['/company/search', '/tender/search', '/aitool/search'];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              產品服務
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  href="/aitool/search"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  smartLoading={true}
                >
                  試用您的 AI 助理
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/company/search"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  smartLoading={true}
                >
                  企業搜尋
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/tender/search"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  smartLoading={true}
                >
                  標案搜尋
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              資料聲明
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  href="/faq"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  smartLoading={true}
                >
                  常見問題
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/feedback?type=data_correction"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  smartLoading={true}
                >
                  資料勘誤
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/privacy"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  smartLoading={true}
                >
                  資料來源聲明
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
                合作洽詢
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <NavLink
                    href="/feedback?type=business_cooperation"
                    className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                    smartLoading={true}
                  >
                    業務合作
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/feedback"
                    className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                    smartLoading={true}
                  >
                    意見回饋
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <SimpleFooter />
      </div>
    </footer>
  );
}