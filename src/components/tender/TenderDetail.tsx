import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, Users, MapPin, Phone, Mail, Globe, Calendar, ChevronDown } from 'lucide-react';
import { useTenderDetail } from '../../hooks/useTenderDetail';
import { InlineLoading } from '../common/loading';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import BackButton from '../common/BackButton';
import SEOHead from '../SEOHead';
import { SitemapCollector } from '../../services/SitemapCollector';
import NoDataFound from '../common/NoDataFound';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { getAttendanceLabel, getLabelStyle } from '../../utils/tenderLabels';

interface FieldValue {
  label: string;
  value: string | string[];
  children?: FieldValue[];
}

const tabIcons = {
  '機關資料': Building2,
  '已公告資料': FileText,
  '投標廠商': Users,
  '決標品項': FileText,
  '決標資料': FileText,
  '採購資料': FileText,
  '招標資料': FileText,
  '領投開標': FileText,
  '其他': FileText,
  '無法決標公告': FileText,
  '標案內容': FileText,
  '最有利標': Users
} as const;

export default function TenderDetail() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  const { data, targetRecord, isLoading, error, sections } = useTenderDetail(tenderId || '');
  const activeTab = searchParams.get('tab') || sections[0]?.title || '';

  useEffect(() => {
    if (tenderId) {
      SitemapCollector.recordTenderVisit(tenderId);
    }
  }, [tenderId]);

  useEffect(() => {
    if (sections.length > 0 && !activeTab) {
      setSearchParams({ tab: sections[0].title });
    }
  }, [sections, activeTab, setSearchParams]);

  useEffect(() => {
    const currentSearch = window.location.search;
    const tabParam = searchParams.get('tab') || sections[0]?.title || '';

    trackEvent('tender_detail_tab_change', {
      tab: tabParam
    });

    navigate(`/tender/detail/${tenderId}?tab=${tabParam}`, {
      state: { previousSearch: currentSearch },
      replace: true
    });
  }, [tenderId, searchParams, navigate, sections, trackEvent]);

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

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // 新增切換展開狀態的處理函數
  const toggleFieldExpansion = (fieldKey: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // 渲染欄位值的通用函數
  const renderFieldValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <p key={index} className="text-base text-gray-900">{item}</p>
      ));
    }

    // 處理特殊格式
    if (value.includes('\n')) {
      return value.split('\n').map((line, index) => (
        <p key={index} className="text-base text-gray-900">{line}</p>
      ));
    }

    // 處理電話號碼
    if (value.match(/^\(\d{2,4}\)[0-9\-#]+$/)) {
      return (
        <div className="flex items-center">
          <Phone className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    // 處理電子郵件
    if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return (
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    // 處理網址
    if (value.startsWith('http')) {
      return (
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-400 mr-2" />
          <a 
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-blue-600 hover:text-blue-800"
          >
            {value}
          </a>
        </div>
      );
    }

    // 處理地址
    if (value.match(/[縣市區鄉鎮路街]/)) {
      return (
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    // 新增評選委員特殊格式處理
    if (typeof value === 'string' && value.startsWith('評選委員_')) {
      const [_, ...parts] = value.split('_');
      return (
        <div className="flex flex-wrap gap-2">
          {parts.map((part, index) => (
            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
              {part}
            </Badge>
          ))}
        </div>
      );
    }

    return <span className="text-base text-gray-900">{value}</span>;
  };

  // 在 renderSection 函數前新增評選委員專用渲染邏輯
  const renderEvaluationCommittee = (committee: any) => {
    const attendanceLabel = getAttendanceLabel(committee.出席會議 === '是');

    return (
      <motion.div 
        key={committee.姓名} 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <h4 className="text-base font-medium flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {committee.姓名 || '未提供姓名'}
            </h4>
            {committee.專業領域 && (
              <div className="flex flex-wrap gap-2">
                {committee.專業領域.split(',').map((field: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-base"
                    title="點擊查看相關標案"
                  >
                    {field.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <span className={getLabelStyle(attendanceLabel)}>
            {attendanceLabel}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
          <div className="col-span-1">
            <dt className="text-gray-500">職稱</dt>
            <dd className="text-gray-900">{committee.服務機關 || committee.職業 || '未提供'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500">專業經歷</dt>
            <dd className="text-gray-900 whitespace-pre-line">
              {committee.與採購案相關之學經歷 || '無相關學經歷記錄'}
            </dd>
          </div>
          {committee.備註 && (
            <div className="col-span-2">
              <dt className="text-gray-500">備註</dt>
              <dd className="text-gray-900">{committee.備註}</dd>
            </div>
          )}
        </dl>
      </motion.div>
    );
  };

  // 修改欄位渲染邏輯
  const renderField = (field: FieldValue, depth: number = 0, sectionTitle: string, parentKey: string = '') => {
    const hasChildren = field.children && field.children.length > 0;
    const paddingClass = depth > 0 ? 'pl-4' : '';
    const borderClass = depth > 0 ? 'border-l-2 border-gray-200' : '';
    // 生成唯一識別鍵
    const fieldKey = `${parentKey}-${field.label}`;
    const isExpanded = expandedFields[fieldKey] ?? true; // 預設展開

    // 修改後的特定區塊佈局判斷條件
    const gridClass = 
      (sectionTitle === '投標廠商' && depth === 0) || 
      (sectionTitle === '決標品項' && depth === 1) 
        ? 'grid grid-cols-2 gap-4' 
        : '';

    // 處理陣列型態的複雜資料結構
    const isArrayOfObjects = Array.isArray(field.value) && field.value.some(item => typeof item === 'object');

    return (
      <div key={field.label} className={`${paddingClass} ${borderClass} mb-4`}>
        <div 
          className="flex justify-between items-start group cursor-pointer"
          onClick={() => hasChildren && toggleFieldExpansion(fieldKey)}
          role="button"
          aria-expanded={isExpanded}
        >
          <dt className={`text-base ${
            depth === 0 ? 'font-medium text-gray-700' : 
            depth === 1 ? 'font-normal text-gray-600' : 'font-light text-gray-500'
          }`}>
            <span className="inline-block w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
            {field.label}
          </dt>
          {(hasChildren || isArrayOfObjects) && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          )}
        </div>
        
        {/* 只在展開時顯示內容 */}
        {isExpanded && (
          <>
            {/* 統一值顯示區域 */}
            {field.value && !isArrayOfObjects && (
              <dd className="mt-1 ml-5">
                {renderFieldValue(field.value)}
              </dd>
            )}

            {isArrayOfObjects ? (
              <div className={`mt-2 ${gridClass}`}>
                {(field.value as any[]).map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key} className="mb-3 last:mb-0">
                        <div className="text-sm font-medium text-gray-600">{key}</div>
                        <div className="text-base text-gray-900">
                          {Array.isArray(value) 
                            ? value.join(', ')
                            : typeof value === 'object' 
                              ? JSON.stringify(value, null, 2)
                              : String(value || '')}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              hasChildren && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`space-y-3 mt-2 ${gridClass}`}
                >
                  {field.children?.map(child => 
                    renderField(child, depth + 1, sectionTitle, fieldKey)
                  )}
                </motion.div>
              )
            )}
          </>
        )}
      </div>
    );
  };

  // 修改區塊渲染邏輯
  const renderSection = (section: typeof sections[0]) => {
    // 針對最有利標頁籤特殊處理
    if (section.title === '最有利標') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              評選委員組成
            </h3>
          </div>
          
          <div className="px-6 py-5 space-y-6">
            {targetRecord?.detail['最有利標:評選委員']?.map((group: any[], index: number) => (
              <motion.div 
                key={index} 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="text-base font-medium text-gray-700">
                    第 {index + 1} 次評選會議
                  </h4>
                  <p className="text-sm text-gray-500">
                    {targetRecord.detail[`最有利標:評選次數:第${index + 1}次`] || '無會議時間記錄'}
                  </p>
                </div> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.map(renderEvaluationCommittee)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
            {section.title}
          </h3>
        </div>
        
        <div className="px-6 py-5 space-y-6">
          <dl className={`grid ${['投標廠商', '決標品項'].includes(section.title) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
            {section.fields.map((field, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                {renderField(field, 0, section.title)}
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={`/tender/detail/${tenderId}`}
      />

      <BackButton
        returnPath="/tender/search"
        sessionKey="tenderSearchParams"
      />

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">
                {targetRecord?.brief.title}
              </h2>
            </div>
            {targetRecord?.date && (
              <p className="flex items-center text-base text-gray-500">
                <Calendar className="h-5 w-5 mr-1" />
                公告日期：{formatDate(targetRecord.date)}
              </p>
            )}
            {targetRecord?.brief?.type && (
              <p className="flex items-center text-base text-gray-500">
                <FileText className="h-5 w-5 mr-1" />
                公告類型：{targetRecord.brief.type}
              </p>
            )}
            {data?.unit_name && (
              <p className="flex items-center text-base text-gray-500">
                <Building2 className="h-5 w-5 mr-1" />
                招標機關：{data.unit_name}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap">
              加入追蹤
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap">
              下載報表
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gradient-to-r from-blue-50 to-gray-50 p-1 rounded-xl shadow-inner">
        {sections.map((section) => {
          const Icon = tabIcons[section.title as keyof typeof tabIcons] || FileText;
          return (
            <motion.button
              key={section.title}
              onClick={() => handleTabChange(section.title)}
              className={`${
                activeTab === section.title
                  ? 'bg-white shadow-lg text-blue-600'
                  : 'text-gray-500 hover:bg-white/80'
              } flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`h-5 w-5 mr-2 ${
                activeTab === section.title ? 'text-blue-500' : 'text-gray-400'
              }`} />
              {section.title}
            </motion.button>
          );
        })}
      </div>

      {sections.map((section) => (
        activeTab === section.title && (
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

      <div className="text-sm text-gray-500 text-center mt-4">
        資料來源：{`https://pcc.g0v.ronny.tw/api`}
      </div>
    </div>
  );
}