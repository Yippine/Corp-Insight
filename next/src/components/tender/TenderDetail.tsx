'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTenderDetail } from '../../hooks/useTenderDetail';
import BackButton from '../common/BackButton';
import TenderDetailTracker from './TenderDetailTracker';
import TenderHeader from './detail/TenderHeader';
import TenderTabNavigation from './detail/TenderTabNavigation';
import YesNoSection from './detail/YesNoSection';
import TenderBasicInfo from './detail/TenderBasicInfo';
import TenderSpecialInfo from './detail/TenderSpecialInfo';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { generateUrl } from '@/config/site';

interface TenderDetailProps {
  tenderId: string;
}

export default function TenderDetail({ tenderId }: TenderDetailProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'basic'
  );
  const { data, targetRecord, isLoading, error, sections } = useTenderDetail(
    tenderId || ''
  );

  const handleTabChange = (tab: string) => {
    // 驗證有效 tab 值
    const decodedTab = decodeURIComponent(tab);
    const isValidTab = decodedTab && sections.some(s => s.title === decodedTab);
    const defaultTab = sections.length > 0 ? sections[0].title : '';
    const finalTab = isValidTab ? decodedTab : defaultTab;

    // 處理 URL 編碼與參數設定
    if (finalTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', encodeURIComponent(finalTab));
      const url = generateUrl('tender', `/tender/detail/${tenderId}?${params.toString()}`);
      router.replace(url, {
        scroll: false,
      });
    }

    // 更新狀態
    setActiveTab(finalTab);
  };

  useEffect(() => {
    const currentTab = searchParams.get('tab') || '';
    handleTabChange(currentTab);
  }, [sections, searchParams]);

  // 處理載入中或錯誤狀態
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,80px))] w-full items-center justify-center">
        <InlineLoading />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pb-8 pt-10 text-center">
        <div className="rounded-lg bg-red-50 p-6 text-red-800">
          <h3 className="text-lg font-medium">無法載入標案資料</h3>
          <p className="mt-2">{error || '發生未知錯誤'}</p>
        </div>
      </div>
    );
  }

  // 修改區塊渲染邏輯
  const renderSection = (section: (typeof sections)[0]) => {
    if (section.title === '最有利標' || section.title === '其他') {
      return <TenderSpecialInfo section={section} />;
    }

    // 檢查是否包含是/否欄位
    const hasYesNoFields = section.fields.some(field => {
      if (typeof field.value === 'string') {
        const value = field.value.trim().toLowerCase();
        return value === '是' || value === '否';
      }
      return false;
    });

    if (hasYesNoFields) {
      return <YesNoSection section={section} />;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <TenderBasicInfo section={section} />
      </motion.div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* GA 標案詳情追蹤 */}
      <TenderDetailTracker
        tenderId={tenderId}
        tenderTitle={targetRecord?.brief?.title}
      />

      <BackButton returnPath="/tender/search" />

      <TenderHeader targetRecord={targetRecord} data={data} />

      <TenderTabNavigation
        sections={sections}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {sections.map(
        section =>
          (activeTab === section.title ||
            (activeTab === '' && section === sections[0])) && (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection(section)}
            </motion.div>
          )
      )}

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h4 className="mb-2 text-sm font-medium text-gray-500">資料來源</h4>
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <a
              href="https://web.pcc.gov.tw/pis/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              政府電子採購網
            </a>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <a
              href="https://pcc-api.openfun.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              標案瀏覽
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
