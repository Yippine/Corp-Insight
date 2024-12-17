import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, FileText, Users, AlertTriangle, Award, TrendingUp, MapPin, Mail, Phone, Globe, FileSpreadsheet } from 'lucide-react';
import { formatDetailData } from '../../utils/companyUtils';
import UnderDevelopment from '../common/UnderDevelopment';

interface CompanyDetailProps {
  companyTaxId: string;
  onBack: () => void;
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

    // 模擬公司資料
    // const SearchData = {
    //   name: '台積電股份有限公司',
    //   taxId: '22099131',
    //   address: '新竹科學園區力行六路8號',
    //   chairman: '劉德音',
    //   industry: '半導體製造業',
    //   capital: '259,304,805,000',
    //   established: '1987/02/21',
    //   status: '營業中',
    //   email: 'contact@tsmc.com',
    //   phone: '03-5636688',
    //   website: 'www.tsmc.com',
    //   employees: '70,000+',
    //   directors: [
    //     { name: '劉德音', title: '董事長', shares: '1,653,709' },
    //     { name: '魏哲家', title: '董事', shares: '1,245,786' }
    //   ],
    //   tenders: [
    //     {
    //       date: '2024/01/15',
    //       title: '晶圓廠擴建工程',
    //       amount: '1,500,000,000',
    //       status: '已決標'
    //     },
    //     {
    //       date: '2023/12/20',
    //       title: '廠區空調系統更新',
    //       amount: '50,000,000',
    //       status: '履約中'
    //     }
    //   ]
    // };

    const SearchData = formatDetailData(taxId, company);
    return SearchData;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error('無法連接到搜尋服務，請稍後再試');
  }
};

export default function CompanyDetail({ companyTaxId, onBack }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [SearchData, setSearchData] = useState<any>(null);

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

  if (!SearchData) {
    return <div>載入中...</div>;
  }

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
                    <dt className="text-base font-medium text-gray-500">公司狀態</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${SearchData.status === '營業中' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {SearchData.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">負責人</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.chairman}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">設立日期</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.established}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-base font-medium text-gray-500">公司地址</dt>
                    <dd className="mt-1 text-base text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-1" />
                      {SearchData.address}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">聯絡電話</dt>
                    <dd className="mt-1 text-base text-gray-900 flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-1" />
                      {SearchData.phone}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">電子郵件</dt>
                    <dd className="mt-1 text-base text-gray-900 flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-1" />
                      {SearchData.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">公司網站</dt>
                    <dd className="mt-1 text-base text-blue-600 flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-1" />
                      <a href={`https://${SearchData.website}`} target="_blank" rel="noopener noreferrer">
                        {SearchData.website}
                      </a>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">員工人數</dt>
                    <dd className="mt-1 text-base text-gray-900">{SearchData.employees}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  財務概況
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">實收資本額</dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {SearchData.capital}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">營業額</dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {SearchData.revenue}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-center mt-4">
              資料來源：{`https://company.g0v.ronny.tw/api`}
            </div>
          </div>
        );
      case 'directors':
        return (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  董監事名單
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        姓名
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        職稱
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        持股數
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {SearchData.directors.map((director: { name: string; title: string; shares: string }, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                          {director.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                          {director.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                          {director.shares}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {SearchData.directors.length > 0 && (
              <div className="text-sm text-gray-500 text-center mt-4">
                資料來源：{`https://company.g0v.ronny.tw/api`}
              </div>
            )}
          </>
        );
      case 'tenders':
        if (!SearchData.tenders || SearchData.tenders.length === 0) {
          return <UnderDevelopment />;
        }
        
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                標案資料
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      標案名稱
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      機關名稱
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      標案類型
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {SearchData.tenders.map((tender: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {tender.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-blue-600">
                        <button 
                          onClick={() => window.open(tender.tender_api_url, '_blank')}
                          className="hover:underline text-left"
                        >
                          {tender.brief.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-blue-600">
                        <button 
                          onClick={() => window.open(tender.unit_api_url, '_blank')}
                          className="hover:underline"
                        >
                          {tender.unit_name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          tender.brief.type.includes('決標') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tender.brief.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-sm text-gray-500 text-center mt-4">
              資料來源：{`https://pcc.g0v.ronny.tw/api`}
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
        <div className="flex items-start justify-between">
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {SearchData.name}
              </h2>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-base font-medium text-gray-600">
                統一編號
              </span>
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-gray-400" />
                <span className="text-base text-gray-700">{SearchData.taxId}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-base font-medium text-gray-600">
                產業類別
              </span>
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg w-[30rem]">
                <Building2 className="h-6 w-6 text-gray-400" />
                <span className="text-base text-gray-700 whitespace-pre-line">{SearchData.industry}</span>
              </div>
            </div>
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