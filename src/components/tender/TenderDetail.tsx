import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTenderDetail } from '../../hooks/useTenderDetail';
import { InlineLoading } from '../common/loading';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import BackButton from '../common/BackButton';
import SEOHead from '../SEOHead';
import { SitemapCollector } from '../../services/SitemapCollector';
import NoDataFound from '../common/NoDataFound';
import DataSource from '../common/DataSource';
import TenderHeader from './detail/TenderHeader';
import TenderTabNavigation from './detail/TenderTabNavigation';
import YesNoSection from './detail/YesNoSection';
import TenderBasicInfo from './detail/TenderBasicInfo';
import TenderSpecialInfo from './detail/TenderSpecialInfo';

export default function TenderDetail() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic');
  const { trackEvent } = useGoogleAnalytics();
  const { data, targetRecord, isLoading, error, sections } = useTenderDetail(tenderId || '');

  useEffect(() => {
    if (tenderId) {
      SitemapCollector.recordTenderVisit(tenderId);
    }
  }, [tenderId]);

  const handleTabChange = (tab: string) => {
    // 驗證有效 tab 值
    const decodedTab = decodeURIComponent(tab);
    const isValidTab = decodedTab && sections.some(s => s.title === decodedTab);
    const defaultTab = sections.length > 0 ? sections[0].title : '';
    const finalTab = isValidTab ? decodedTab : defaultTab;

    // 處理 URL 編碼與參數設定
    if (finalTab) {
      const encodedTab = encodeURIComponent(finalTab);
      setSearchParams({ tab: encodedTab }, { replace: true });
    }
    
    // 更新狀態與追蹤事件
    setActiveTab(finalTab);
    trackEvent('tender_detail_tab_change', { tab: finalTab });
  };

  useEffect(() => {
    const currentTab = searchParams.get('tab') || '';
    handleTabChange(currentTab);
  }, [sections, searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <div className="pt-36 pb-8">
        <InlineLoading />
      </div>
    );
  }

  if (error || !data) {
    return <NoDataFound message={error || '無法載入標案資料'} />;
  }

  const seoTitle = targetRecord ? `${targetRecord.brief.title} - 標案資訊 | 企業放大鏡™` : '標案資訊 | 企業放大鏡™';
  const seoDescription = targetRecord 
    ? `查看 ${targetRecord.brief.title} 的詳細標案資訊，包含基本資料、投標廠商、履約進度等完整內容。招標機關：${data.unit_name || '未提供'}。`
    : '查看完整的政府標案資訊，包含基本資料、投標廠商、履約進度等詳細內容。';

  // 修改區塊渲染邏輯
  const renderSection = (section: typeof sections[0]) => {
    if (section.title === '最有利標' || section.title === '其他') {
      return <TenderSpecialInfo section={section} targetRecord={targetRecord} />;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* <YesNoSection section={section} /> */}
        <TenderBasicInfo section={section} />
      </motion.div>
    );
  };

  // 修改為使用 CSS-in-JS 方式實現全局樣式
  const GlobalStyles = () => {
    return (
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.8);
          border-radius: 999px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
        
        @media (hover: hover) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            opacity: 1;
          }
        }
      `}} />
    );
  };

  return (
    <div className="space-y-6">
      <GlobalStyles />
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={`/tender/detail/${tenderId}`}
      />

      <BackButton
        returnPath="/tender/search"
        sessionKey="tenderSearchParams"
      />

      <TenderHeader targetRecord={targetRecord} data={data} />

      <TenderTabNavigation 
        sections={sections} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {sections.map((section) => (
        (activeTab === section.title || (activeTab === '' && section === sections[0])) && (
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
      ))}

      <DataSource
        sources={[
          {
            name: '政府電子採購網',
            url: 'https://web.pcc.gov.tw/pis/'
          },
          {
            name: '標案瀏覽',
            url: 'https://pcc.g0v.ronny.tw/'
          }
        ]}
      />
    </div>
  );
}