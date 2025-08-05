'use client';

import Link from 'next/link';
import { Building2, FileSpreadsheet, Calculator } from 'lucide-react';
import { useAiToolsUrl } from '@/hooks/useAiToolsUrl';
import { getMainSiteUrl } from '@/config/site';
import { useEffect, useState } from 'react';

export default function FeatureSection() {
  const { generateAiToolsUrl } = useAiToolsUrl();
  const [isAiToolsDomain, setIsAiToolsDomain] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAiToolsDomain(window.location.host.includes('aitools'));
    }
  }, []);
  return (
    <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Link
        href={generateAiToolsUrl('/search')}
        className="flex cursor-pointer items-start space-x-4 rounded-lg bg-white p-6 shadow-sm transition-colors hover:bg-gray-50"
      >
        <div className="flex-shrink-0">
          <Calculator className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">
            試用您的 AI 助理
          </h3>
          <p className="mt-2 text-base text-gray-500">
            立即解鎖 AI 智能助理！16
            個領域輕鬆提升效率，從寫作到職涯，一鍵客製化您的專屬智能夥伴！
          </p>
        </div>
      </Link>

      <Link
        href={isAiToolsDomain ? getMainSiteUrl('/company/search') : '/company/search'}
        className="flex cursor-pointer items-start space-x-4 rounded-lg bg-white p-6 shadow-sm transition-colors hover:bg-gray-50"
      >
        <div className="flex-shrink-0">
          <Building2 className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">公開企業資料</h3>
          <p className="mt-2 text-base text-gray-500">
            一鍵解析企業全貌：董監事、分公司、商標、判決、標案、稅務等 6
            大面向的企業智能總覽！
          </p>
        </div>
      </Link>

      <Link
        href={isAiToolsDomain ? getMainSiteUrl('/tender/search') : '/tender/search'}
        className="flex cursor-pointer items-start space-x-4 rounded-lg bg-white p-6 shadow-sm transition-colors hover:bg-gray-50"
      >
        <div className="flex-shrink-0">
          <FileSpreadsheet className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">公開標案資料</h3>
          <p className="mt-2 text-base text-gray-500">
            全面政府標案情報：一鍵解析標案名稱、金額、得標廠商，多元智能查詢，讓您精準抓住關鍵商機！
          </p>
        </div>
      </Link>
    </div>
  );
}
