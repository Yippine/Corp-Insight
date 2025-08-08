'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateUrl } from '@/config/site';
import {
  Building2,
  FileText,
  Users,
  MapPin,
  Phone,
  Globe,
  Table,
  BarChart3,
  LucideIcon,
  AlertTriangle,
  Download,
  Clock,
  Filter,
} from 'lucide-react';
import type { CompanyData } from '@/lib/company/types';
import DataSource from '../common/DataSource';
import { InlineLoading } from '../common/loading';
import BackButton from '../common/BackButton';
import CompanyMap from '../maps/CompanyMap';
import DirectorsChart from '@/components/company/charts/DirectorsChart';
import DirectorsTable from '@/components/company/charts/DirectorsTable';
import ManagersTimeline from '@/components/company/charts/ManagersTimeline';
import ManagersTable from '@/components/company/charts/ManagersTable';
import TenderStatsChart from '@/components/company/charts/TenderStatsChart';
import NoDataFound from '../common/NoDataFound';
import { usePaginatedTenders } from '@/lib/hooks/usePaginatedTenders';

// 圖標映射函數
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, LucideIcon> = {
    Building2,
    FileText,
    Users,
    MapPin,
    Phone,
    Globe,
    Table,
    BarChart3,
  };

  return iconMap[iconName] || Building2;
};

interface CompanyDetailContentProps {
  companyData: CompanyData;
  activeTab: string;
  tabs: {
    id: string;
    name: string;
    icon: string; // 現在是字符串識別符而非組件
  }[];
}

export default function CompanyDetailContent({
  companyData: SearchData,
  activeTab,
  tabs,
}: CompanyDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentHost, setCurrentHost] = useState<string>('');
  const [view, setView] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.host);
    }
  }, []);
  const [tenderView, setTenderView] = useState<'chart' | 'list'>('chart');
  const [tenders, setTenders] = useState<any[]>([]);

  const {
    tenders: paginatedTenders,
    isLoadingMore,
    error: fetchTenderError,
    progress,
    totalPages,
    currentPage,
    isFullyLoaded,
  } = usePaginatedTenders(SearchData?.taxId || '');

  // 處理頁籤變更
  const handleTabChange = (tab: string) => {
    // 驗證有效 tab 值
    const validTabs = tabs.map(t => t.id);
    const decodedTab = decodeURIComponent(tab);
    const isValidTab = validTabs.includes(decodedTab);
    const finalTab = isValidTab ? decodedTab : 'basic';

    // 構建新的URL參數
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', finalTab);

    // 更新URL
    const url = generateUrl('company', `/company/detail/${SearchData.taxId}?${newParams.toString()}`, currentHost);
    router.push(url);
  };

  // 處理標案資料
  useEffect(() => {
    // 當獲取到標案資料時更新本地狀態
    if (paginatedTenders.length > 0) {
      setTenders(paginatedTenders);
    }
  }, [paginatedTenders, isLoadingMore, fetchTenderError]);

  // 渲染營業項目
  const renderBusinessScope = () => {
    if (!SearchData.businessScope || SearchData.businessScope.length === 0) {
      return <p className="text-gray-500">無營業項目資料</p>;
    }

    // 分離代碼和詳細說明
    const codes = SearchData.businessScope.filter((item: string[]) => item[0]);
    const details = SearchData.businessScope.filter(
      (item: string[]) => !item[0]
    );

    return (
      <div className="space-y-8 rounded-lg bg-white">
        {codes.length > 0 && (
          <div className="space-y-4">
            <h4 className="flex items-center space-x-2 text-base font-medium text-gray-900">
              <span className="inline-block h-4 w-1 rounded-full bg-blue-600"></span>
              <span>營業項目代碼</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {codes.map((item: string[], index: number) => (
                <div
                  key={index}
                  className="group flex items-start space-x-3 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-3 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex-shrink-0 rounded bg-blue-600 px-2 py-1 text-sm font-medium text-white transition-colors group-hover:bg-blue-700">
                    {item[0]}
                  </div>
                  <span className="text-base text-gray-700 transition-colors group-hover:text-gray-900">
                    {item[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {details.length > 0 && (
          <div className="space-y-4">
            <h4 className="flex items-center space-x-2 text-base font-medium text-gray-900">
              <span className="inline-block h-4 w-1 rounded-full bg-blue-600"></span>
              <span>營業項目說明</span>
            </h4>
            <div className="space-y-4 rounded-lg bg-gradient-to-r from-gray-50 to-white p-4 text-base text-gray-700">
              {details.map((item: string[], index: number) => {
                const content = item[1].replace(/^[•·]/, '').trim();
                const isNewSection = /^[１２３４５６７８９０\d]．/.test(
                  content
                );

                return (
                  <div
                    key={index}
                    className={`${isNewSection ? 'mt-6 first:mt-0' : 'ml-8'} rounded-lg p-2 leading-relaxed transition-colors duration-200 hover:bg-white`}
                  >
                    <p
                      className={`${
                        isNewSection
                          ? 'font-medium text-blue-800'
                          : 'text-gray-600'
                      }`}
                    >
                      {content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染頁籤內容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl font-medium leading-6 text-gray-900">
                  基本資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      公司狀態
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${SearchData.status === '營業中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {SearchData.status}
                      </span>
                    </dd>
                  </div>

                  {SearchData.chairman !== '無' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        負責人
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.chairman}
                      </dd>
                    </div>
                  )}

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      統一編號
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.taxId}
                    </dd>
                  </div>

                  {SearchData.financialReportInfo?.website &&
                    SearchData.financialReportInfo?.website !== '未提供' && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          網址
                        </dt>
                        <dd className="mt-1 flex items-center text-base text-blue-600">
                          <Globe className="mr-1 h-5 w-5 text-gray-400" />
                          <a
                            href={SearchData.financialReportInfo?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {SearchData.financialReportInfo?.website}
                          </a>
                        </dd>
                      </div>
                    )}

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      中文名稱
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.name}
                      {SearchData.financialReportInfo?.abbreviation &&
                        `（${SearchData.financialReportInfo?.abbreviation}）`}
                    </dd>
                  </div>

                  {SearchData.englishName !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        英文名稱
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.englishName}
                        {SearchData.financialReportInfo?.englishAbbreviation &&
                          ` (${SearchData.financialReportInfo?.englishAbbreviation})`}
                      </dd>
                    </div>
                  )}

                  {SearchData.phone !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        聯絡電話
                      </dt>
                      <dd className="mt-1 flex items-center text-base text-gray-900">
                        <Phone className="mr-1 h-5 w-5 text-gray-400" />
                        {SearchData.phone}
                      </dd>
                    </div>
                  )}

                  {SearchData.website !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        公司網站
                      </dt>
                      <dd className="mt-1 flex items-center text-base text-blue-600">
                        <Globe className="mr-1 h-5 w-5 text-gray-400" />
                        <a
                          href={`https://${SearchData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {SearchData.website}
                        </a>
                      </dd>
                    </div>
                  )}

                  {SearchData.employees !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        員工人數
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.employees}
                      </dd>
                    </div>
                  )}

                  {SearchData.financialReportInfo?.phone &&
                    SearchData.financialReportInfo?.phone !== '未提供' && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          電話
                        </dt>
                        <dd className="mt-1 flex items-center text-base text-gray-900">
                          <Phone className="mr-1 h-5 w-5 text-gray-400" />
                          {SearchData.financialReportInfo?.phone}
                        </dd>
                      </div>
                    )}

                  {SearchData.financialReportInfo?.fax &&
                    SearchData.financialReportInfo?.fax !== '未提供' &&
                    SearchData.financialReportInfo?.fax !== '無' && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          傳真
                        </dt>
                        <dd className="mt-1 flex items-center text-base text-gray-900">
                          <Phone className="mr-1 h-5 w-5 text-gray-400" />
                          {SearchData.financialReportInfo?.fax}
                        </dd>
                      </div>
                    )}

                  {SearchData.companyType &&
                    SearchData.companyType !== '未提供' && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          組織型態
                        </dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {SearchData.companyType}
                        </dd>
                      </div>
                    )}
                </dl>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl font-medium leading-6 text-gray-900">
                  資本規模
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      核准資本額
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0">
                      {SearchData.totalCapital}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      實際資本額
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0">
                      {SearchData.paidInCapital}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl font-medium leading-6 text-gray-900">
                  登記資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      公司成立日期
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.established}
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      最近變更日期
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.lastChanged}
                    </dd>
                  </div>

                  {SearchData.registrationAuthority &&
                    SearchData.registrationAuthority !== '未提供' && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          登記機關
                        </dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {SearchData.registrationAuthority}
                        </dd>
                      </div>
                    )}
                </dl>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl font-medium leading-6 text-gray-900">
                  營業項目
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {renderBusinessScope()}
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl font-medium leading-6 text-gray-900">
                  公司地址
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <div className="mb-4 flex items-center text-base text-gray-900">
                    <MapPin className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <span>{SearchData.address}</span>
                  </div>
                  {SearchData.financialReportInfo?.englishAddress !==
                    '未提供' && (
                    <div className="mb-4 flex items-center text-base text-gray-900">
                      <MapPin className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <span>
                        {SearchData.financialReportInfo?.englishAddress}
                      </span>
                    </div>
                  )}

                  {typeof SearchData.address === 'string' && (
                    <CompanyMap address={SearchData.address} />
                  )}
                </div>
              </div>
            </div>

            <DataSource
              sources={[
                {
                  name: '台灣公司資料',
                  url: 'https://company.g0v.ronny.tw/',
                },
              ]}
            />
          </div>
        );

      case 'financial':
        return (
          <>
            <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="border-b border-gray-100 px-8 py-8">
                <h3 className="mb-2 text-3xl font-bold text-gray-900">
                  企業財務與資本資訊
                </h3>
                <p className="text-gray-600">深入解析公司財務結構與資本運作</p>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  <div>
                    <h4 className="mb-6 flex items-center text-xl font-medium leading-6 text-gray-900">
                      <span className="mr-3 inline-block h-6 w-1 rounded-full bg-blue-600"></span>
                      基本資訊
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {SearchData.financialReportInfo?.marketType !==
                        '未提供' && (
                        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            市場類別
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.marketType}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.code !== '未提供' && (
                        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            股票代號
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-6 flex items-center text-xl font-medium leading-6 text-gray-900">
                      <span className="mr-3 inline-block h-6 w-1 rounded-full bg-green-600"></span>
                      領導團隊
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {SearchData.financialReportInfo?.chairman !==
                        '未提供' && (
                        <div className="rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            董事長
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.chairman}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.generalManager !==
                        '未提供' && (
                        <div className="rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            總經理
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.generalManager}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.spokesperson !==
                        '未提供' && (
                        <div className="rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            發言人
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.spokesperson}
                            <span className="ml-1 text-sm text-gray-500">
                              (
                              {
                                SearchData.financialReportInfo
                                  ?.spokespersonTitle
                              }
                              )
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-6 flex items-center text-xl font-medium leading-6 text-gray-900">
                      <span className="mr-3 inline-block h-6 w-1 rounded-full bg-amber-500"></span>
                      里程碑
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {SearchData.financialReportInfo?.establishmentDate !==
                        '未提供' && (
                        <div className="rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            公司創立日期
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.establishmentDate}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.listingDate !==
                        '未提供' && (
                        <div className="rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            股票上市日期
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.listingDate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-6 flex items-center text-xl font-medium leading-6 text-gray-900">
                      <span className="mr-3 inline-block h-6 w-1 rounded-full bg-purple-600"></span>
                      股權結構
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {SearchData.shareholding !== '未提供' && (
                        <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            主要股東
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.shareholding}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.parValuePerShare !==
                        '未提供' && (
                        <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            普通股面額
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.parValuePerShare}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.paidInCapital !==
                        '0' && (
                        <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            實收資本總額
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            NT${' '}
                            {parseInt(
                              SearchData.financialReportInfo?.paidInCapital ||
                                '0'
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo
                        ?.privatePlacementShares !== '0' && (
                        <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            私募股份總數
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {parseInt(
                              SearchData.financialReportInfo
                                ?.privatePlacementShares || '0'
                            ).toLocaleString()}{' '}
                            股
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.preferredShares !==
                        '0' && (
                        <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
                          <p className="text-sm font-medium text-gray-500">
                            特別股總數
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {parseInt(
                              SearchData.financialReportInfo?.preferredShares ||
                                '0'
                            ).toLocaleString()}{' '}
                            股
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-6 flex items-center text-xl font-medium leading-6 text-gray-900">
                      <span className="mr-3 inline-block h-6 w-1 rounded-full bg-rose-600"></span>
                      投資人服務
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="rounded-lg border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {SearchData.financialReportInfo
                            ?.stockTransferAgency !== '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                股務代理機構
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    ?.stockTransferAgency
                                }
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo?.transferPhone !==
                            '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                股務聯絡電話
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {SearchData.financialReportInfo?.transferPhone}
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo?.transferAddress !==
                            '未提供' && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-500">
                                股務聯絡地址
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    ?.transferAddress
                                }
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo
                            ?.certifiedPublicAccountantFirm !== '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                財務簽證會計師事務所
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    ?.certifiedPublicAccountantFirm
                                }
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo
                            ?.certifiedPublicAccountant1 !== '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                簽證會計師
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    ?.certifiedPublicAccountant1
                                }
                                {SearchData.financialReportInfo
                                  ?.certifiedPublicAccountant2 !== '未提供' &&
                                  `、${SearchData.financialReportInfo?.certifiedPublicAccountant2}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DataSource
              sources={[
                {
                  name: '台灣上市上櫃公司',
                  url: 'https://p.twincn.com/item.aspx',
                },
              ]}
            />
          </>
        );

      case 'directors':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-2xl">
              <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="mb-2 text-3xl font-bold text-gray-900">
                    董監事與經理人資訊
                  </h3>
                  <p className="text-gray-600">
                    深入探索公司治理結構，掌握關鍵決策者動態
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setView('chart')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-300 ${
                      view === 'chart'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">視覺圖表</span>
                  </button>
                  <button
                    onClick={() => setView('table')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-300 ${
                      view === 'table'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Table className="h-5 w-5" />
                    <span className="font-medium">詳細資訊</span>
                  </button>
                </div>
              </div>

              {(!SearchData.directors || SearchData.directors.length === 0) &&
              (!SearchData.managers || SearchData.managers.length === 0) ? (
                <NoDataFound message="查無董事會、經理人資料" />
              ) : view === 'chart' ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                  {SearchData.directors && SearchData.directors.length > 0 ? (
                    <DirectorsChart directors={SearchData.directors} />
                  ) : (
                    <NoDataFound message="查無董事會資料" />
                  )}
                  {SearchData.managers && SearchData.managers.length > 0 ? (
                    <ManagersTimeline
                      managers={SearchData.managers}
                      established={SearchData.established}
                    />
                  ) : (
                    <NoDataFound message="查無經理人資料" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                  {SearchData.directors && SearchData.directors.length > 0 ? (
                    <DirectorsTable
                      directors={SearchData.directors}
                      onViewChange={setView}
                    />
                  ) : (
                    <NoDataFound message="查無董事會資料" />
                  )}
                  {SearchData.managers && SearchData.managers.length > 0 ? (
                    <ManagersTable
                      managers={SearchData.managers}
                      onViewChange={setView}
                    />
                  ) : (
                    <NoDataFound message="查無經理人資料" />
                  )}
                </div>
              )}
            </div>

            <DataSource
              sources={[
                {
                  name: '台灣公司資料',
                  url: 'https://company.g0v.ronny.tw/',
                },
              ]}
            />
          </div>
        );

      // case 'tenders':
      //   return (
      //     <div className="space-y-6">
      //       <div className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-2xl">
      //         <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      //           <div>
      //             <h3 className="mb-2 text-3xl font-bold text-gray-900">
      //               標案全景
      //             </h3>
      //             <p className="text-gray-600">
      //               深入解析企業的採購生態圖，追蹤每一筆關鍵商機
      //             </p>
      //           </div>
      //           <div className="flex flex-col gap-3 sm:flex-row">
      //             <button
      //               onClick={() => setTenderView('chart')}
      //               className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-300 ${
      //                 tenderView === 'chart'
      //                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      //                   : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      //               }`}
      //             >
      //               <BarChart3 className="h-5 w-5" />
      //               <span className="font-medium">視覺圖表</span>
      //             </button>
      //             <button
      //               onClick={() => setTenderView('list')}
      //               className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-300 ${
      //                 tenderView === 'list'
      //                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      //                   : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      //               }`}
      //             >
      //               <Table className="h-5 w-5" />
      //               <span className="font-medium">詳細資訊</span>
      //             </button>
      //           </div>
      //         </div>

      //         {fetchTenderError ? (
      //           <div className="py-12 text-center">
      //             <p className="text-gray-500">{fetchTenderError}</p>
      //           </div>
      //         ) : tenders.length > 0 ? (
      //           tenderView === 'list' ? (
      //             <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      //               <table className="min-w-full divide-y divide-gray-200">
      //                 <thead className="bg-gray-50">
      //                   <tr>
      //                     <th
      //                       scope="col"
      //                       className="w-[10%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
      //                     >
      //                       得標日期
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="w-[35%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
      //                     >
      //                       採購專案名稱
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="w-[20%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
      //                     >
      //                       招標機關
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="w-[10%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
      //                     >
      //                       得標狀態
      //                     </th>
      //                   </tr>
      //                 </thead>
      //                 <tbody className="divide-y divide-gray-200 bg-white">
      //                   {tenders.map((tender, index) => (
      //                     <tr
      //                       key={`${tender.tenderId}-${index}`}
      //                       className="cursor-pointer hover:bg-gray-50"
      //                       onClick={() => {
      //                         router.push(`/tender/detail/${tender.tenderId}`);
      //                       }}
      //                     >
      //                       <td className="px-6 py-4 text-base text-gray-500">
      //                         {tender.date}
      //                       </td>
      //                       <td className="px-6 py-4 text-base text-gray-900">
      //                         <div className="line-clamp-2">{tender.title}</div>
      //                       </td>
      //                       <td className="px-6 py-4 text-base text-gray-900">
      //                         <div className="line-clamp-2">
      //                           {tender.unitName}
      //                         </div>
      //                       </td>
      //                       <td className="px-6 py-4">
      //                         <span
      //                           className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
      //                             tender.status === '得標'
      //                               ? 'bg-green-100 text-green-800'
      //                               : 'bg-yellow-100 text-yellow-800'
      //                           }`}
      //                         >
      //                           {tender.status}
      //                         </span>
      //                       </td>
      //                     </tr>
      //                   ))}
      //                 </tbody>
      //               </table>
      //             </div>
      //           ) : (
      //             <TenderStatsChart
      //               tenders={tenders}
      //               isLoadingMore={isLoadingMore}
      //               progress={progress}
      //               totalPages={totalPages}
      //               currentPage={currentPage}
      //               isFullyLoaded={isFullyLoaded}
      //             />
      //           )
      //         ) : isFullyLoaded ? (
      //           <NoDataFound message="查無標案資料" />
      //         ) : (
      //           <div className="py-8">
      //             <InlineLoading />
      //           </div>
      //         )}
      //       </div>
      //       <DataSource
      //         sources={[
      //           {
      //             name: '標案瀏覽',
      //             url: 'https://pcc-api.openfun.app/',
      //           },
      //         ]}
      //       />
      //     </div>
      //   );

      // case 'risk':
      //   return (
      //     <div className="space-y-6">
      //       <div className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-2xl">
      //         <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      //           <div>
      //             <h3 className="mb-2 text-3xl font-bold text-gray-900">
      //               風險評估
      //             </h3>
      //             <div className="flex items-center">
      //               <p className="mr-2 text-gray-600">
      //                 企業法律風險全景分析與深度洞察
      //               </p>
      //               <div className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      //                 機密情報
      //               </div>
      //             </div>
      //           </div>
      //           <div className="flex flex-col gap-3 sm:flex-row">
      //             <button
      //               onClick={() => {
      //                 setView('chart');
      //               }}
      //               className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-300 ${
      //                 view === 'chart'
      //                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      //                   : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      //               }`}
      //             >
      //               <BarChart3 className="h-5 w-5" />
      //               <span className="font-medium">視覺圖表</span>
      //             </button>
      //             <button
      //               onClick={() => {
      //                 setView('table');
      //               }}
      //               className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all duration-300 ${
      //                 view === 'table'
      //                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      //                   : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      //               }`}
      //             >
      //               <Table className="h-5 w-5" />
      //               <span className="font-medium">詳細資訊</span>
      //             </button>
      //           </div>
      //         </div>

      //         {view === 'chart' ? (
      //           <div className="space-y-6">
      //             {/* 風險評估圖表視圖內容 */}
      //             <div className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
      //               <div className="rounded-xl bg-white p-6">
      //                 <div className="mb-6 flex items-center justify-between">
      //                   <h4 className="text-xl font-semibold text-gray-800">
      //                     法律風險概覽
      //                   </h4>
      //                   <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
      //                     更新於 {new Date().toLocaleDateString()}
      //                   </div>
      //                 </div>

      //                 <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      //                   <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-100 opacity-40"></div>
      //                   <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-24 w-24 rounded-full bg-indigo-100 opacity-40"></div>

      //                   <div className="relative z-10 flex flex-col items-center justify-between md:flex-row">
      //                     <div className="mb-4 text-center md:mb-0 md:text-left">
      //                       <h5 className="mb-1 text-lg font-medium text-gray-800">
      //                         整體風險評分
      //                       </h5>
      //                       <div className="text-5xl font-bold text-blue-600">
      //                         36
      //                       </div>
      //                       <p className="mt-1 text-sm text-gray-600">
      //                         低等風險水平
      //                       </p>
      //                     </div>

      //                     <div className="relative h-52 w-52">
      //                       <svg
      //                         className="h-full w-full"
      //                         viewBox="0 0 100 100"
      //                       >
      //                         <circle
      //                           cx="50"
      //                           cy="50"
      //                           r="45"
      //                           fill="none"
      //                           stroke="#e5e7eb"
      //                           strokeWidth="10"
      //                         />
      //                         <circle
      //                           cx="50"
      //                           cy="50"
      //                           r="45"
      //                           fill="none"
      //                           stroke="#3b82f6"
      //                           strokeWidth="10"
      //                           strokeDasharray="100 200"
      //                           strokeDashoffset="0"
      //                           strokeLinecap="round"
      //                           className="transition-all duration-100 ease-out"
      //                           transform="rotate(-90 50 50)"
      //                         />
      //                         <text
      //                           x="50"
      //                           y="55"
      //                           textAnchor="middle"
      //                           className="text-2xl font-bold"
      //                           fill="#1e40af"
      //                         >
      //                           36%
      //                         </text>
      //                       </svg>
      //                     </div>

      //                     <div className="text-center md:text-right">
      //                       <h5 className="mb-1 text-lg font-medium text-gray-800">
      //                         同行業平均
      //                       </h5>
      //                       <div className="text-5xl font-bold text-gray-400">
      //                         42
      //                       </div>
      //                       <p className="mt-1 text-sm text-gray-600">
      //                         低風險水平
      //                       </p>
      //                     </div>
      //                   </div>

      //                   <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 md:grid-cols-4">
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">
      //                         合約糾紛
      //                       </div>
      //                       <div className="text-xl font-bold text-blue-600">
      //                         45
      //                       </div>
      //                     </div>
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">
      //                         財務爭議
      //                       </div>
      //                       <div className="text-xl font-bold text-purple-600">
      //                         38
      //                       </div>
      //                     </div>
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">
      //                         智財風險
      //                       </div>
      //                       <div className="text-xl font-bold text-pink-600">
      //                         22
      //                       </div>
      //                     </div>
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">
      //                         合規指數
      //                       </div>
      //                       <div className="text-xl font-bold text-green-600">
      //                         60
      //                       </div>
      //                     </div>
      //                   </div>
      //                 </div>

      //                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      //                   <div className="flex flex-col rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      //                     <div className="mb-2 text-xl font-medium text-gray-900">
      //                       案件類型佔比
      //                     </div>
      //                     <div className="flex flex-1 items-center justify-center">
      //                       <div className="relative h-64 w-full">
      //                         <div className="absolute inset-0 flex items-center justify-center">
      //                           <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-md">
      //                             <span className="text-lg font-semibold text-gray-800">
      //                               219
      //                             </span>
      //                           </div>
      //                         </div>
      //                         <svg
      //                           className="h-full w-full"
      //                           viewBox="0 0 100 100"
      //                         >
      //                           <circle
      //                             cx="50"
      //                             cy="50"
      //                             r="45"
      //                             fill="none"
      //                             stroke="#ddd"
      //                             strokeWidth="10"
      //                           />
      //                           <circle
      //                             cx="50"
      //                             cy="50"
      //                             r="45"
      //                             fill="none"
      //                             stroke="#3b82f6"
      //                             strokeWidth="10"
      //                             strokeDasharray="205 283"
      //                             strokeDashoffset="0"
      //                             strokeLinecap="round"
      //                             transform="rotate(-90 50 50)"
      //                           >
      //                             <animate
      //                               attributeName="stroke-dasharray"
      //                               values="0 283;205 283"
      //                               dur="1.5s"
      //                               fill="freeze"
      //                             />
      //                           </circle>
      //                           <circle
      //                             cx="50"
      //                             cy="50"
      //                             r="45"
      //                             fill="none"
      //                             stroke="#10b981"
      //                             strokeWidth="10"
      //                             strokeDasharray="75 283"
      //                             strokeDashoffset="-205"
      //                             strokeLinecap="round"
      //                             transform="rotate(-90 50 50)"
      //                           >
      //                             <animate
      //                               attributeName="stroke-dasharray"
      //                               values="0 283;75 283"
      //                               dur="1.5s"
      //                               fill="freeze"
      //                             />
      //                           </circle>
      //                           <circle
      //                             cx="50"
      //                             cy="50"
      //                             r="45"
      //                             fill="none"
      //                             stroke="#ef4444"
      //                             strokeWidth="10"
      //                             strokeDasharray="3 283"
      //                             strokeDashoffset="-280"
      //                             strokeLinecap="round"
      //                             transform="rotate(-90 50 50)"
      //                           >
      //                             <animate
      //                               attributeName="stroke-dasharray"
      //                               values="0 283;3 283"
      //                               dur="1.5s"
      //                               fill="freeze"
      //                             />
      //                           </circle>
      //                         </svg>
      //                       </div>
      //                     </div>
      //                     <div className="mt-4 grid grid-cols-3 gap-4">
      //                       <div className="flex items-center">
      //                         <span className="mr-2 h-4 w-4 rounded-full bg-blue-500"></span>
      //                         <span className="text-sm font-medium">
      //                           民事 (85%)
      //                         </span>
      //                       </div>
      //                       <div className="flex items-center">
      //                         <span className="mr-2 h-4 w-4 rounded-full bg-red-500"></span>
      //                         <span className="text-sm font-medium">
      //                           刑事 (12%)
      //                         </span>
      //                       </div>
      //                       <div className="flex items-center">
      //                         <span className="mr-2 h-4 w-4 rounded-full bg-green-500"></span>
      //                         <span className="text-sm font-medium">
      //                           行政 (3%)
      //                         </span>
      //                       </div>
      //                     </div>
      //                   </div>

      //                   <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-6">
      //                     <div className="mb-2 text-xl font-medium text-gray-900">
      //                       時間趨勢分析
      //                     </div>
      //                     <div className="relative h-64">
      //                       <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
      //                       <div className="absolute bottom-0 left-0 top-0 w-px bg-gray-200"></div>
      //                       <div className="absolute inset-0 flex items-end pb-6 pl-6">
      //                         <svg
      //                           viewBox="0 0 300 200"
      //                           className="h-full w-full overflow-visible"
      //                         >
      //                           <defs>
      //                             <linearGradient
      //                               id="gradient"
      //                               x1="0%"
      //                               y1="0%"
      //                               x2="100%"
      //                               y2="0%"
      //                             >
      //                               <stop offset="0%" stopColor="#8b5cf6" />
      //                               <stop offset="100%" stopColor="#ec4899" />
      //                             </linearGradient>
      //                             <linearGradient
      //                               id="gradientFill"
      //                               x1="0%"
      //                               y1="0%"
      //                               x2="100%"
      //                               y2="0%"
      //                             >
      //                               <stop
      //                                 offset="0%"
      //                                 stopColor="rgba(139, 92, 246, 0.2)"
      //                               />
      //                               <stop
      //                                 offset="100%"
      //                                 stopColor="rgba(236, 72, 153, 0.2)"
      //                               />
      //                             </linearGradient>
      //                           </defs>

      //                           <path
      //                             d="M0,150 L50,130 L100,140 L150,90 L200,100 L250,70 L300,30 V200 H0 Z"
      //                             fill="url(#gradientFill)"
      //                           />

      //                           <polyline
      //                             points="0,150 50,130 100,140 150,90 200,100 250,70 300,30"
      //                             fill="none"
      //                             stroke="url(#gradient)"
      //                             strokeWidth="3"
      //                             strokeLinecap="round"
      //                             strokeLinejoin="round"
      //                             className="trend-line"
      //                           >
      //                             <animate
      //                               attributeName="points"
      //                               dur="1.5s"
      //                               values="0,150 0,150 0,150 0,150 0,150 0,150 0,150;0,150 50,130 100,140 150,90 200,100 250,70 300,30"
      //                               fill="freeze"
      //                             />
      //                           </polyline>

      //                           <circle cx="0" cy="150" r="4" fill="#8b5cf6" />
      //                           <circle cx="50" cy="130" r="4" fill="#8b5cf6" />
      //                           <circle
      //                             cx="100"
      //                             cy="140"
      //                             r="4"
      //                             fill="#8b5cf6"
      //                           />
      //                           <circle cx="150" cy="90" r="4" fill="#8b5cf6" />
      //                           <circle
      //                             cx="200"
      //                             cy="100"
      //                             r="4"
      //                             fill="#ec4899"
      //                           />
      //                           <circle cx="250" cy="70" r="4" fill="#ec4899" />
      //                           <circle cx="300" cy="30" r="4" fill="#ec4899" />
      //                         </svg>
      //                       </div>
      //                       <div className="absolute bottom-0 left-0 flex w-full justify-between px-6 text-xs text-gray-500">
      //                         <span>2018</span>
      //                         <span>2019</span>
      //                         <span>2020</span>
      //                         <span>2021</span>
      //                         <span>2022</span>
      //                         <span>2023</span>
      //                         <span>2024</span>
      //                       </div>
      //                     </div>
      //                     <div className="mt-4 text-sm text-gray-600">
      //                       <p className="font-medium">
      //                         近3年案件數量增長
      //                         <span className="font-bold text-red-500">
      //                           25%
      //                         </span>
      //                       </p>
      //                       <p className="mt-1 text-xs text-gray-500">
      //                         趨勢預測：未來一年可能增加15-20件新案件
      //                       </p>
      //                     </div>
      //                   </div>
      //                 </div>
      //               </div>
      //             </div>

      //             <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      //               {/* 風險評估指數卡片 */}
      //               <div className="flex transform flex-col rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:scale-105">
      //                 <div className="mb-4 flex items-center justify-between">
      //                   <h4 className="text-lg font-semibold text-gray-800">
      //                     風險評估指數
      //                   </h4>
      //                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
      //                     <AlertTriangle className="h-5 w-5 text-amber-600" />
      //                   </div>
      //                 </div>
      //                 <div className="relative flex-1 pt-2">
      //                   <div className="mb-4 text-3xl font-bold text-amber-500">
      //                     36
      //                   </div>
      //                   <div className="h-3 overflow-hidden rounded-full bg-gray-200">
      //                     <div
      //                       className="animate-pulse-slow h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500"
      //                       style={{ width: '36%' }}
      //                     ></div>
      //                   </div>
      //                   <div className="mt-1 flex justify-between text-xs text-gray-500">
      //                     <span>低風險</span>
      //                     <span>中等風險</span>
      //                     <span>高風險</span>
      //                   </div>
      //                 </div>
      //                 <div className="mt-4 text-sm text-gray-600">
      //                   基於判決書分析的綜合風險評估
      //                   <br />
      //                   <span className="font-medium text-amber-600">
      //                     需關注：財務爭議、智財權訴訟
      //                   </span>
      //                 </div>
      //               </div>

      //               {/* 主要風險類型卡片 */}
      //               <div className="transform rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:scale-105">
      //                 <div className="mb-4 flex items-center justify-between">
      //                   <h4 className="text-lg font-semibold text-gray-800">
      //                     主要風險類型
      //                   </h4>
      //                   <div className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600">
      //                     關鍵指標
      //                   </div>
      //                 </div>
      //                 <div className="space-y-4">
      //                   <div>
      //                     <div className="mb-1 flex items-center justify-between">
      //                       <span className="flex items-center text-sm font-medium">
      //                         <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
      //                         合約糾紛
      //                       </span>
      //                       <span className="text-sm font-medium">32%</span>
      //                     </div>
      //                     <div className="h-2 overflow-hidden rounded-full bg-gray-200">
      //                       <div
      //                         className="h-full rounded-full bg-blue-500"
      //                         style={{ width: '42%' }}
      //                       ></div>
      //                     </div>
      //                   </div>
      //                   <div>
      //                     <div className="mb-1 flex items-center justify-between">
      //                       <span className="flex items-center text-sm font-medium">
      //                         <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
      //                         財務爭議
      //                       </span>
      //                       <span className="text-sm font-medium">31%</span>
      //                     </div>
      //                     <div className="h-2 overflow-hidden rounded-full bg-gray-200">
      //                       <div
      //                         className="h-full rounded-full bg-green-500"
      //                         style={{ width: '31%' }}
      //                       ></div>
      //                     </div>
      //                   </div>
      //                   <div>
      //                     <div className="mb-1 flex items-center justify-between">
      //                       <span className="flex items-center text-sm font-medium">
      //                         <span className="mr-2 inline-block h-2 w-2 rounded-full bg-purple-500"></span>
      //                         智慧財產
      //                       </span>
      //                       <span className="text-sm font-medium">18%</span>
      //                     </div>
      //                     <div className="h-2 overflow-hidden rounded-full bg-gray-200">
      //                       <div
      //                         className="h-full rounded-full bg-purple-500"
      //                         style={{ width: '18%' }}
      //                       ></div>
      //                     </div>
      //                   </div>
      //                   <div>
      //                     <div className="mb-1 flex items-center justify-between">
      //                       <span className="flex items-center text-sm font-medium">
      //                         <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gray-500"></span>
      //                         其他
      //                       </span>
      //                       <span className="text-sm font-medium">9%</span>
      //                     </div>
      //                     <div className="h-2 overflow-hidden rounded-full bg-gray-200">
      //                       <div
      //                         className="h-full rounded-full bg-gray-500"
      //                         style={{ width: '9%' }}
      //                       ></div>
      //                     </div>
      //                   </div>
      //                 </div>
      //                 <div className="mt-4 border-t border-gray-100 pt-2 text-xs text-gray-500">
      //                   <div className="flex items-center">
      //                     <div className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
      //                     <span>同行業合約糾紛平均僅為27%</span>
      //                   </div>
      //                 </div>
      //               </div>

      //               <div className="transform rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:scale-105">
      //                 <div className="mb-4 text-lg font-semibold text-gray-800">
      //                   法院審理分布
      //                 </div>
      //                 <div className="space-y-3">
      //                   <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-blue-50">
      //                     <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
      //                       1
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">
      //                         臺灣臺北地方法院
      //                       </div>
      //                       <div className="text-xs text-gray-500">
      //                         89 件案件
      //                       </div>
      //                     </div>
      //                     <div className="text-sm font-medium">31%</div>
      //                   </div>
      //                   <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-blue-50">
      //                     <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
      //                       2
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">
      //                         臺灣士林地方法院
      //                       </div>
      //                       <div className="text-xs text-gray-500">
      //                         58 件案件
      //                       </div>
      //                     </div>
      //                     <div className="text-sm font-medium">21%</div>
      //                   </div>
      //                   <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-blue-50">
      //                     <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
      //                       3
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">
      //                         臺灣新北地方法院
      //                       </div>
      //                       <div className="text-xs text-gray-500">
      //                         34 件案件
      //                       </div>
      //                     </div>
      //                     <div className="text-sm font-medium">16%</div>
      //                   </div>
      //                   <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-blue-50">
      //                     <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600">
      //                       4+
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">其他法院</div>
      //                       <div className="text-xs text-gray-500">
      //                         76 件案件
      //                       </div>
      //                     </div>
      //                     <div className="text-sm font-medium">35%</div>
      //                   </div>
      //                   <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-blue-50">
      //                     <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600">
      //                       5
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">
      //                         臺灣桃園地方法院
      //                       </div>
      //                       <div className="text-xs text-gray-500">
      //                         35 件案件
      //                       </div>
      //                     </div>
      //                     <div className="text-sm font-medium">12%</div>
      //                   </div>
      //                 </div>
      //                 <button className="mt-4 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
      //                   查看所有法院分佈 →
      //                 </button>
      //               </div>
      //             </div>
      //           </div>
      //         ) : (
      //           <div className="rounded-xl bg-white shadow-sm">
      //             <div className="border-b border-gray-200 px-6 py-4">
      //               <p className="mt-1 text-sm text-gray-500">
      //                 共有 219 筆資料
      //               </p>
      //             </div>

      //             <div className="border-b border-gray-200 bg-gray-50 p-4">
      //               <div className="flex flex-wrap items-center gap-3">
      //                 <div className="flex-1">
      //                   <div className="relative">
      //                     <input
      //                       type="search"
      //                       placeholder="搜尋判決書關鍵字..."
      //                       className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
      //                     />
      //                     <div className="absolute left-3 top-2.5 text-gray-400">
      //                       <svg
      //                         xmlns="http://www.w3.org/2000/svg"
      //                         className="h-5 w-5"
      //                         fill="none"
      //                         viewBox="0 0 24 24"
      //                         stroke="currentColor"
      //                       >
      //                         <path
      //                           strokeLinecap="round"
      //                           strokeLinejoin="round"
      //                           strokeWidth={2}
      //                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      //                         />
      //                       </svg>
      //                     </div>
      //                   </div>
      //                 </div>

      //                 <div className="flex gap-2">
      //                   <div className="relative inline-block">
      //                     <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
      //                       <Filter className="h-4 w-4 text-gray-500" />
      //                       <span>過濾條件</span>
      //                     </button>
      //                   </div>

      //                   <div className="relative inline-block">
      //                     <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
      //                       <Clock className="h-4 w-4 text-gray-500" />
      //                       <span>日期範圍</span>
      //                     </button>
      //                   </div>

      //                   <div className="relative inline-block">
      //                     <button className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
      //                       <Download className="h-4 w-4" />
      //                       <span>匯出報告</span>
      //                     </button>
      //                   </div>
      //                 </div>
      //               </div>
      //             </div>

      //             <div className="overflow-x-auto">
      //               <table className="min-w-full divide-y divide-gray-200">
      //                 <thead className="bg-gray-50">
      //                   <tr>
      //                     <th
      //                       scope="col"
      //                       className="w-[15%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
      //                     >
      //                       日期
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="w-[85%] px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
      //                     >
      //                       內容
      //                     </th>
      //                   </tr>
      //                 </thead>
      //                 <tbody className="divide-y divide-gray-200 bg-white">
      //                   {/* 風險項目列表 */}
      //                   <tr className="risk-item-hover transition-colors hover:bg-gray-50">
      //                     <td className="whitespace-nowrap px-6 py-4 text-base text-gray-500">
      //                       <div className="flex flex-col">
      //                         <span className="font-medium">2024/11/08</span>
      //                         <span className="text-xs text-gray-400">
      //                           5天前
      //                         </span>
      //                       </div>
      //                     </td>
      //                     <td className="px-6 py-4">
      //                       <div className="flex items-start gap-3">
      //                         <div className="mt-1 flex-shrink-0">
      //                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
      //                             <FileText className="h-4 w-4 text-blue-600" />
      //                           </div>
      //                         </div>
      //                         <div className="flex-1">
      //                           <div className="mb-1 text-base font-medium text-gray-900">
      //                             給付買賣價金等
      //                           </div>
      //                           <div className="text-sm text-gray-500">
      //                             <p>
      //                               <span className="font-medium">
      //                                 法院案號：
      //                               </span>
      //                               臺灣新竹地方法院 113年度補字1196號
      //                             </p>
      //                             <p>
      //                               <span className="font-medium">
      //                                 案件類別：
      //                               </span>
      //                               <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
      //                                 民事
      //                               </span>
      //                             </p>
      //                             <p>
      //                               <span className="font-medium">
      //                                 相關人員：
      //                               </span>
      //                               彭義,楊明,超群,彭義誠,楊明箴,王超群,葉欣宜,郭家慧,聲明第二項,國眾電腦股份有限公司
      //                             </p>
      //                           </div>
      //                           <div className="mt-2">
      //                             <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
      //                               查看詳情 →
      //                             </button>
      //                           </div>
      //                         </div>
      //                       </div>
      //                     </td>
      //                   </tr>
      //                 </tbody>
      //               </table>
      //             </div>
      //           </div>
      //         )}
      //       </div>

      //       <DataSource
      //         sources={[
      //           {
      //             name: '司法院全球資訊網',
      //             url: 'https://www.judicial.gov.tw/tw/np-117-1.html',
      //           },
      //         ]}
      //       />
      //     </div>
      //   );

      default:
        return (
          <div className="py-16 text-center">
            <p className="text-lg text-gray-500">功能開發中，敬請期待</p>
          </div>
        );
    }
  };

  // 主要渲染
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton
          returnPath="/company/search"
          sessionKey="companySearchParams"
        />
      </div>

      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {SearchData.name}
            </h2>
          </div>

          <div className="flex space-x-4">
            <button className="duration-2000 inline-flex items-center rounded-lg border border-transparent bg-pink-400 px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-pink-500">
              一鍵生成精美官網
            </button>
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-base font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50">
              加入追蹤
            </button>
            <button className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-2.5 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700">
              下載報表
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        {tabs.map(tab => {
          const Icon = getIconComponent(tab.icon);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/60'
              } flex flex-1 items-center justify-center rounded-md px-3 py-2.5 text-base font-medium transition-all duration-200`}
            >
              <Icon
                className={`h-6 w-6 ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                } mr-2`}
              />
              {tab.name}
            </button>
          );
        })}
      </div>

      {renderTabContent()}
    </div>
  );
}
