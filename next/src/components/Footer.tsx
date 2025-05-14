'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SimpleFooter from '@/components/SimpleFooter';

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
                <Link
                  href="/aitool/search"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  試用您的 AI 助理
                </Link>
              </li>
              <li>
                <Link
                  href="/company/search"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  企業搜尋
                </Link>
              </li>
              <li>
                <Link
                  href="/tender/search"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  標案搜尋
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              資料聲明
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/faq"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  常見問題
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback?type=data_correction"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  資料勘誤
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  資料來源聲明
                </Link>
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
                  <Link
                    href="/feedback?type=business_cooperation"
                    className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    業務合作
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    意見回饋
                  </Link>
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