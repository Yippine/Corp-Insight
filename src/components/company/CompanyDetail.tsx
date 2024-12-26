import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, FileText, Users, AlertTriangle, Award, TrendingUp, MapPin, Phone, Globe, Table, BarChart3 } from 'lucide-react';
import { formatDetailData } from '../../utils/companyUtils';
import UnderDevelopment from '../common/UnderDevelopment';
import CompanyMap from '../maps/CompanyMap';
import DirectorsChart from './directors/DirectorsChart';
import DirectorsTable from './directors/DirectorsTable';
import ManagersTimeline from './directors/ManagersTimeline';
import ManagersTable from './directors/ManagersTable';
import TenderStatsChart from './directors/TenderStatsChart';

interface CompanyDetailProps {
  companyTaxId: string;
  onBack: () => void;
  onTenderSelect: (tenderId: string) => void;
  onSearchTender: (query: string, type: 'company' | 'tender') => void;
}

const tabs = [
  { id: 'basic', name: '基本資料', icon: Building2 },
  { id: 'directors', name: '董監事', icon: Users },
  { id: 'tenders', name: '標案資料', icon: FileText },
  { id: 'risk', name: '風險評估', icon: AlertTriangle },
  { id: 'industry', name: '產業分析', icon: TrendingUp },
  { id: 'awards', name: '獎項認證', icon: Award }
];

const fetchDetailData = async (taxId: string) => {
  const baseUrl = 'https://company.g0v.ronny.tw/api';
  
  try {
    const response = await fetch(`${baseUrl}/show/${taxId}`, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const company = result.data;
    const SearchData = formatDetailData(taxId, company);
    return { ...SearchData, businessScope: company.所營事業資料 || [] };
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error('無法連接到搜尋服務，請稍後再試');
  }
};

export default function CompanyDetail({ companyTaxId, onBack, onTenderSelect, onSearchTender}: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [SearchData, setSearchData] = useState<any>(null);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [tenderView, setTenderView] = useState<'list' | 'chart'>('list');
  const [tenders, setTenders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tenderError, setTenderError] = useState<string | null>(null);

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const data = await fetchDetailData(companyTaxId);
        setSearchData(data);
      } catch (error) {
        console.error('載入公司資料時發生錯誤：', error);
        alert('無法載入公司資料，請稍後再試。');
      }
    };

    loadSearchData();
  }, [companyTaxId]);

  useEffect(() => {
    const fetchTenders = async () => {
      setIsLoading(true);
      setTenderError(null);
      try {
        const response = await fetch(`https://pcc.g0v.ronny.tw/api/searchbycompanyid?query=${companyTaxId}`);
        const data = await response.json();
        
        if (!data.records || data.records.length === 0) {
          setTenders([]);
          return;
        }

        const formattedTenders = data.records.map((record: any) => ({
          tenderId: `${record.unit_id}-${record.job_number}`,
          date: record.date,
          title: record.brief.title,
          unitName: record.unit_name,
          status: record.brief.companies?.name_key?.[SearchData.name]?.[1]?.includes('未得標') ? '未得標' : '得標'
        }));

        setTenders(formattedTenders);
      } catch (error) {
        console.error('載入標案資料失敗：', error);
        setTenderError('載入標案資料時發生錯誤，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    if (SearchData?.taxId) {
      fetchTenders();
    }
  }, [SearchData?.taxId, SearchData?.name]);

  if (!SearchData) {
    return <div>載入中...</div>;
  }

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

        {/* 詳細說明部分 */}
        {details.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 flex items-center space-x-2">
              <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
              <span>營業項目說明</span>
            </h4>
            <div className="space-y-4 text-base text-gray-700 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4">
              {details.map((item: string[], index: number) => {
                const content = item[1].replace(/^[•·]/, '').trim();
                // 檢查是否為新段落（包含數字編號）
                const isNewSection = /^[１２３４５６７８９０\d]．/.test(content);
                
                return (
                  <div 
                    key={index} 
                    className={`${isNewSection ? 'mt-6 first:mt-0' : 'ml-8'} leading-relaxed hover:bg-white rounded-lg p-2 transition-colors duration-200`}
                  >
                    {/* 如果是新段落，使用較大字體和不同顏色 */}
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  公司基本資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">統一編號</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.taxId}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">負責人</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.chairman}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">公司狀態</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${SearchData.status === '營業中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {SearchData.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">公司成立日期</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.established}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">最近變更日期</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.established}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">股東結構</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.shareholding}</dd>
                  </div>
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
                </dl>
              </div>
            </div>

            {/* 公司地址區塊 */}
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
                  <CompanyMap address={SearchData.address} />
                </div>
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
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">核准資本額</dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {SearchData.totalCapital}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">實際資本額</dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {SearchData.paidInCapital}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  主要營業項目
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {renderBusinessScope()}
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center mt-4">
              資料來源：{`https://company.g0v.ronny.tw/api`}
            </div>
          </div>
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
                    <span className="font-medium">視覺化圖表</span>
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
                    <span className="font-medium">詳細資料表</span>
                  </button>
                </div>
              </div>

              {view === 'chart' ? (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <DirectorsChart directors={SearchData.directors} />
                  <ManagersTimeline 
                    managers={SearchData.managers} 
                    established={SearchData.established} 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <DirectorsTable 
                    directors={SearchData.directors}
                    onViewChange={setView}
                  />
                  <ManagersTable 
                    managers={SearchData.managers}
                    onViewChange={setView}
                  />
                </div>
              )}
            </div>
          </div>
        );
      case 'tenders':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">標案資訊</h3>
                  <p className="text-gray-600">檢視公司參與的政府採購標案記錄</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setTenderView('list')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      tenderView === 'list'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Table className="h-5 w-5" />
                    <span className="font-medium">標案清單</span>
                  </button>
                  <button
                    onClick={() => setTenderView('chart')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      tenderView === 'chart'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">統計圖表</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
                </div>
              ) : tenderError ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">{tenderError}</p>
                </div>
              ) : tenders.length > 0 ? (
                tenderView === 'list' ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                          日期
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                          標案名稱
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                          機關名稱
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                          狀態
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tenders.map((tender, index) => (
                        <tr
                          key={`${tender.tenderId}-${index}`}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => onTenderSelect(tender.tenderId)}
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
                  <TenderStatsChart 
                    tenders={tenders}
                  />
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">尚無標案資料</p>
                </div>
              )}
              {tenders.length > 0 && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => onSearchTender(SearchData.taxId, 'company')}
                    className="inline-flex items-center px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    查看全部標案 →
                  </button>
                </div>
              )}
            <div className="text-sm text-gray-500 text-center mt-4">
              資料來源：{`https://pcc.g0v.ronny.tw/api`}
            </div>
            </div>
          </div>
        );
      default:
        return <UnderDevelopment />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
        >
          <ArrowLeft className="h-6 w-6 mr-2" />
          返回搜尋結果
        </button>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-8">
        <div className="flex items-start justify-between items-center">
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
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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