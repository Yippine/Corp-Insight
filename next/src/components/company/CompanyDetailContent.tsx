'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, FileText, Users, MapPin, Phone, Globe, Table, BarChart3, LucideIcon } from 'lucide-react';
import type { CompanyData } from '@/lib/company/types';
import DataSource from '../common/DataSource';
import { InlineLoading } from '../common/loading';
import BackButton from '../common/BackButton';
import CompanyMap from '../maps/CompanyMap';
import DirectorsChart from '@/components/company/charts/DirectorsChart';
import DirectorsTable from '@/components/company/charts/DirectorsTable';
import ManagersTimeline from '@/components/company/charts/ManagersTimeline';
import ManagersTable from '@/components/company/charts/ManagersTable';
import NoDataFound from '../common/NoDataFound';

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
    BarChart3
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

export default function CompanyDetailContent({ companyData: SearchData, activeTab, tabs }: CompanyDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [tenderView, setTenderView] = useState<'chart' | 'list'>('chart');
  const [tenders, setTenders] = useState<any[]>([]);
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);
  
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
    router.push(`/company/detail/${SearchData.taxId}?${newParams.toString()}`);
  };

  // 獲取標案資料
  useEffect(() => {
    const fetchTenderData = async () => {
      if (activeTab === 'tenders' && SearchData?.taxId) {
        setIsLoadingTenders(true);
        try {
          // 在實際應用中，應該從API獲取標案資料
          // 這裡只是示例
          const response = await fetch(`/api/company/tenders/${SearchData.taxId}`);
          if (response.ok) {
            const data = await response.json();
            setTenders(data.tenders || []);
          }
        } catch (error) {
          console.error('獲取標案資料失敗:', error);
        } finally {
          setIsLoadingTenders(false);
        }
      }
    };
    
    fetchTenderData();
  }, [activeTab, SearchData?.taxId]);

  // 渲染營業項目
  const renderBusinessScope = () => {
    if (!SearchData.businessScope || SearchData.businessScope.length === 0) {
      return <p className="text-gray-500">無營業項目資料</p>;
    }

    // 分離代碼和詳細說明
    const codes = SearchData.businessScope.filter((item: string[]) => item[0]);
    const details = SearchData.businessScope.filter((item: string[]) => !item[0]);

    return (
      <div className="space-y-8 bg-white rounded-lg">
        {codes.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 flex items-center space-x-2">
              <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
              <span>營業項目代碼</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {codes.map((item: string[], index: number) => (
                <div 
                  key={index} 
                  className="group flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium group-hover:bg-blue-700 transition-colors">
                    {item[0]}
                  </div>
                  <span className="text-base text-gray-700 group-hover:text-gray-900 transition-colors">
                    {item[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {details.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 flex items-center space-x-2">
              <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
              <span>營業項目說明</span>
            </h4>
            <div className="space-y-4 text-base text-gray-700 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4">
              {details.map((item: string[], index: number) => {
                const content = item[1].replace(/^[•·]/, '').trim();
                const isNewSection = /^[１２３４５６７８９０\d]．/.test(content);
                
                return (
                  <div 
                    key={index} 
                    className={`${isNewSection ? 'mt-6 first:mt-0' : 'ml-8'} leading-relaxed hover:bg-white rounded-lg p-2 transition-colors duration-200`}
                  >
                    <p className={`${
                      isNewSection 
                        ? 'text-blue-800 font-medium' 
                        : 'text-gray-600'
                    }`}>
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
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  基本資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">公司狀態</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${SearchData.status === '營業中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {SearchData.status}
                      </span>
                    </dd>
                  </div>

                  {SearchData.chairman !== '無' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">負責人</dt>
                      <dd className="mt-1 text-base text-gray-900">{SearchData.chairman}</dd>
                    </div>
                  )}

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">統一編號</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.taxId}</dd>
                  </div>

                  {SearchData.financialReportInfo?.website && SearchData.financialReportInfo?.website !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">網址</dt>
                      <dd className="mt-1 text-base text-blue-600 flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-1" />
                        <a href={SearchData.financialReportInfo?.website} target="_blank" rel="noopener noreferrer">
                          {SearchData.financialReportInfo?.website}
                        </a>
                      </dd>
                    </div>
                  )}

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">中文名稱</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.name}
                      {SearchData.financialReportInfo?.abbreviation && `（${SearchData.financialReportInfo?.abbreviation}）`}
                    </dd>
                  </div>

                  {SearchData.englishName !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">英文名稱</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.englishName}
                        {SearchData.financialReportInfo?.englishAbbreviation && ` (${SearchData.financialReportInfo?.englishAbbreviation})`}
                      </dd>
                    </div>
                  )}

                  {SearchData.phone !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">聯絡電話</dt>
                      <dd className="mt-1 text-base text-gray-900 flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-1" />
                        {SearchData.phone}
                      </dd>
                    </div>
                  )}

                  {SearchData.website !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">公司網站</dt>
                      <dd className="mt-1 text-base text-blue-600 flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-1" />
                        <a href={`https://${SearchData.website}`} target="_blank" rel="noopener noreferrer">
                          {SearchData.website}
                        </a>
                      </dd>
                    </div>
                  )}

                  {SearchData.employees !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">員工人數</dt>
                      <dd className="mt-1 text-base text-gray-900">{SearchData.employees}</dd>
                    </div>
                  )}

                  {SearchData.financialReportInfo?.phone && SearchData.financialReportInfo?.phone !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">電話</dt>
                      <dd className="mt-1 text-base text-gray-900 flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-1" />
                        {SearchData.financialReportInfo?.phone}
                      </dd>
                    </div>
                  )}

                  {SearchData.financialReportInfo?.fax && SearchData.financialReportInfo?.fax !== '未提供' && SearchData.financialReportInfo?.fax !== '無' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">傳真</dt>
                      <dd className="mt-1 text-base text-gray-900 flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-1" />
                        {SearchData.financialReportInfo?.fax}
                      </dd>
                    </div>
                  )}

                  {SearchData.companyType && SearchData.companyType !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">組織型態</dt>
                      <dd className="mt-1 text-base text-gray-900">{SearchData.companyType}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  資本規模
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">核准資本額</dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0">
                      {SearchData.totalCapital}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">實際資本額</dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0">
                      {SearchData.paidInCapital}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  登記資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">公司成立日期</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.established}</dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">最近變更日期</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.lastChanged}</dd>
                  </div>

                  {SearchData.registrationAuthority && SearchData.registrationAuthority !== '未提供' && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">登記機關</dt>
                      <dd className="mt-1 text-base text-gray-900">{SearchData.registrationAuthority}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  營業項目
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {renderBusinessScope()}
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  公司地址
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center text-base text-gray-900 mb-4">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{SearchData.address}</span>
                  </div>
                  {SearchData.financialReportInfo?.englishAddress !== '未提供' && (
                    <div className="flex items-center text-base text-gray-900 mb-4">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span>{SearchData.financialReportInfo?.englishAddress}</span>
                    </div>
                  )}

                  {typeof SearchData.address === 'string' && <CompanyMap address={SearchData.address} />}
                </div>
              </div>
            </div>

            <DataSource
              sources={[
                {
                  name: '台灣公司資料',
                  url: 'https://company.g0v.ronny.tw/'
                }
              ]}
            />
          </div>
        );
      
      case 'financial':
        return (
          <>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="px-8 py-8 border-b border-gray-100">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  企業財務與資本資訊
                </h3>
                <p className="text-gray-600">深入解析公司財務結構與資本運作</p>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                      基本資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {SearchData.financialReportInfo?.marketType !== '未提供' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm font-medium text-gray-500">市場類別</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.marketType}</p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.code !== '未提供' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm font-medium text-gray-500">股票代號</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.code}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-green-600 rounded-full mr-3"></span>
                      領導團隊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {SearchData.financialReportInfo?.chairman !== '未提供' && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-medium text-gray-500">董事長</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.chairman}</p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.generalManager !== '未提供' && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-medium text-gray-500">總經理</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.generalManager}</p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.spokesperson !== '未提供' && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-medium text-gray-500">發言人</p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo?.spokesperson}
                            <span className="text-sm text-gray-500 ml-1">
                              ({SearchData.financialReportInfo?.spokespersonTitle})
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-amber-500 rounded-full mr-3"></span>
                      里程碑
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {SearchData.financialReportInfo?.establishmentDate !== '未提供' && (
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                          <p className="text-sm font-medium text-gray-500">公司創立日期</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.establishmentDate}</p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.listingDate !== '未提供' && (
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                          <p className="text-sm font-medium text-gray-500">股票上市日期</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.listingDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
                      股權結構
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {SearchData.shareholding !== '未提供' && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">主要股東</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.shareholding}</p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.parValuePerShare !== '未提供' && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">普通股面額</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{SearchData.financialReportInfo?.parValuePerShare}</p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.paidInCapital !== '0' && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">實收資本總額</p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            NT$ {parseInt(SearchData.financialReportInfo?.paidInCapital || '0').toLocaleString()}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.privatePlacementShares !== '0' && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">私募股份總數</p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {parseInt(SearchData.financialReportInfo?.privatePlacementShares || '0').toLocaleString()} 股
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo?.preferredShares !== '0' && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">特別股總數</p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {parseInt(SearchData.financialReportInfo?.preferredShares || '0').toLocaleString()} 股
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-rose-600 rounded-full mr-3"></span>
                      投資人服務
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {SearchData.financialReportInfo?.stockTransferAgency !== '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">股務代理機構</p>
                              <p className="mt-1 text-base text-gray-900">{SearchData.financialReportInfo?.stockTransferAgency}</p>
                            </div>
                          )}
                          {SearchData.financialReportInfo?.transferPhone !== '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">股務聯絡電話</p>
                              <p className="mt-1 text-base text-gray-900">{SearchData.financialReportInfo?.transferPhone}</p>
                            </div>
                          )}
                          {SearchData.financialReportInfo?.transferAddress !== '未提供' && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-500">股務聯絡地址</p>
                              <p className="mt-1 text-base text-gray-900">{SearchData.financialReportInfo?.transferAddress}</p>
                            </div>
                          )}
                          {SearchData.financialReportInfo?.certifiedPublicAccountantFirm !== '未提供' && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">財務簽證會計師事務所</p>
                              <p className="mt-1 text-base text-gray-900">{SearchData.financialReportInfo?.certifiedPublicAccountantFirm}</p>
                            </div>
                          )}
                          {(SearchData.financialReportInfo?.certifiedPublicAccountant1 !== '未提供') && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">簽證會計師</p>
                              <p className="mt-1 text-base text-gray-900">
                                {SearchData.financialReportInfo?.certifiedPublicAccountant1}
                                {SearchData.financialReportInfo?.certifiedPublicAccountant2 !== '未提供' && `、${SearchData.financialReportInfo?.certifiedPublicAccountant2}`}
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
                  url: 'https://p.twincn.com/item.aspx'
                }
              ]}
            />
          </>
        );
      
      case 'directors':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">董監事與經理人資訊</h3>
                  <p className="text-gray-600">深入探索公司治理結構，掌握關鍵決策者動態</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setView('chart')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
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
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
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
              ) : (
                view === 'chart' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
                )
              )}
            </div>

            <DataSource
              sources={[
                {
                  name: '台灣公司資料',
                  url: 'https://company.g0v.ronny.tw/'
                }
              ]}
            />
          </div>
        );
      
      case 'tenders':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">標案全景</h3>
                  <p className="text-gray-600">深入解析企業的採購生態圖，追蹤每一筆關鍵商機</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setTenderView('chart')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      tenderView === 'chart'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">視覺圖表</span>
                  </button>
                  <button
                    onClick={() => setTenderView('list')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      tenderView === 'list'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Table className="h-5 w-5" />
                    <span className="font-medium">詳細資訊</span>
                  </button>
                </div>
              </div>

              {isLoadingTenders ? (
                <div className="pt-36 pb-8">
                  <InlineLoading />
                </div>
              ) : tenders.length > 0 ? (
                tenderView === 'list' ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                          得標日期
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                          採購專案名稱
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                          招標機關
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                          得標狀態
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tenders.map((tender, index) => (
                        <tr
                          key={`${tender.tenderId}-${index}`}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            // 點擊標案項目處理
                          }}
                        >
                          <td className="px-6 py-4 text-base text-gray-500">
                            {tender.date}
                          </td>
                          <td className="px-6 py-4 text-base text-gray-900">
                            <div className="line-clamp-2">
                              {tender.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-base text-gray-900">
                            <div className="line-clamp-2">
                              {tender.unitName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              tender.status === '得標' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tender.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 text-center">
                    <p className="text-gray-700">標案圖表視圖尚在開發中</p>
                  </div>
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">查無標案資料</p>
                </div>
              )}
            </div>
            <DataSource
              sources={[
                {
                  name: '標案瀏覽',
                  url: 'https://pcc.g0v.ronny.tw/'
                }
              ]}
            />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-16">
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
      
      <div className="bg-white shadow-sm rounded-lg p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {SearchData.name}
            </h2>
          </div>

          <div className="flex space-x-4">
            <button className="inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              加入追蹤
            </button>
            <button className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              下載報表
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = getIconComponent(tab.icon);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/60'
              } flex-1 flex items-center justify-center py-2.5 px-3 rounded-md text-base font-medium transition-all duration-200`}
            >
              <Icon className={`h-6 w-6 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
              } mr-2`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {renderTabContent()}
    </div>
  );
}