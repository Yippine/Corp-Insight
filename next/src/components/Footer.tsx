'use client';

import SimpleFooter from '@/components/SimpleFooter';
import NavLink from './common/NavLink';
import { useAiToolsUrl } from '@/hooks/useAiToolsUrl';
import { getMainSiteUrl } from '@/config/site';
import { useEffect, useState } from 'react';

export default function Footer() {
  const { generateAiToolsUrl } = useAiToolsUrl();
  const [isAiToolsDomain, setIsAiToolsDomain] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAiToolsDomain(window.location.host.includes('aitools'));
    }
  }, []);
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 text-center sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wider text-gray-400">
              產品服務
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  href={generateAiToolsUrl('/search')}
                  className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                  smartLoading={true}
                >
                  試用您的 AI 助理
                </NavLink>
              </li>
              <li>
                <NavLink
                  href={isAiToolsDomain ? getMainSiteUrl('/company/search') : '/company/search'}
                  className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                  smartLoading={true}
                >
                  企業搜尋
                </NavLink>
              </li>
              <li>
                <NavLink
                  href={isAiToolsDomain ? getMainSiteUrl('/tender/search') : '/tender/search'}
                  className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                  smartLoading={true}
                >
                  標案搜尋
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold uppercase tracking-wider text-gray-400">
              資料聲明
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  href="/faq"
                  className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                  smartLoading={true}
                >
                  常見問題
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/feedback?type=data_correction"
                  className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                  smartLoading={true}
                >
                  資料勘誤
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/privacy"
                  className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                  smartLoading={true}
                >
                  資料來源聲明
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-8">
              <h3 className="text-base font-semibold uppercase tracking-wider text-gray-400">
                合作洽詢
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <NavLink
                    href="/feedback?type=business_cooperation"
                    className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
                    smartLoading={true}
                  >
                    業務合作
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/feedback"
                    className="cursor-pointer text-lg text-gray-500 hover:text-gray-900"
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
