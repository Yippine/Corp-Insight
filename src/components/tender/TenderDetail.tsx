import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, FileText, Users, MapPin, Mail, Phone, FileSpreadsheet, Construction } from 'lucide-react';
import { useTenderSearch } from '../../hooks/useTenderSearch';
import UnderDevelopment from '../common/UnderDevelopment';
import { useParams } from 'react-router-dom';
import { InlineLoading } from '../common/loading';

interface TenderDetailProps {
  tenderId?: string;
  onBack?: () => void;
}

interface TenderData {
  basic: {
    title: string;
    type: string;
    amount: string;
    date: string;
    status: string;
    description: string;
    category: string;
    method: string;
    location: string;
  };
  companies: Array<{
    name: string;
    status: string;
    amount: string;
    taxId: string;
  }>;
  progress: {
    startDate: string;
    endDate: string;
    currentPhase: string;
    paymentTerms: string;
    completionRate: string;
  };
  documents: Array<{
    title: string;
    type: string;
    date: string;
    url: string;
  }>;
  unit: {
    name: string;
    code: string;
    address: string;
    contact: string;
    phone: string;
    email: string;
  };
}

const tabs = [
  { id: 'basic', name: '基本資料', icon: Building2 },
  { id: 'companies', name: '投標廠商', icon: Users },
  { id: 'progress', name: '履約進度', icon: Construction },
  { id: 'documents', name: '相關文件', icon: FileText },
  { id: 'unit', name: '機關資訊', icon: MapPin }
];

export default function TenderDetail({ onBack }: TenderDetailProps) {
  const { tenderId } = useParams<{ tenderId: string }>();
  const [activeTab, setActiveTab] = useState('basic');
  const [data, setData] = useState<TenderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { batchUpdateSearchState } = useTenderSearch();

  const handleUnitClick = async (unitId: string, unitName: string) => {
    try {
      const response = await fetch(`https://pcc.g0v.ronny.tw/api/listbyunit?unit_id=${unitId}`);
      const result = await response.json();

      const formattedResults = result.records.map((record: any) => ({
        tenderId: `${record.unit_id}-${record.job_number}`,
        date: record.date,
        type: record.brief.type,
        title: record.brief.title,
        unitName: record.unit_name,
        unitId: record.unit_id,
        amount: record.brief.amount || '未提供',
        status: record.brief.type.includes('決標') ? '已決標' : '招標中',
        companies: Object.entries(record.brief.companies?.name_key || {}).map(([name, status]: [string, any]) => ({
          name: name.split('(')[0].trim(),
          status: status[1]?.includes('未得標') ? '未得標' : '得標'
        }))
      }));

      batchUpdateSearchState(
        formattedResults,
        unitName,
        1,
        1
      );

      setTimeout(() => {
        onBack?.();
      }, 0);
    } catch (err) {
      console.error('載入機關標案資料失敗：', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [unitId, jobNumber] = tenderId!.split('-');
        const response = await fetch(
          `https://pcc.g0v.ronny.tw/api/tender?unit_id=${unitId}&job_number=${jobNumber}`
        );
        const result = await response.json();
        
        // 轉換API資料為所需格式
        const formattedData: TenderData = {
          basic: {
            title: result.records[0].brief.title,
            type: result.records[0].brief.type,
            amount: result.records[0].brief.amount || '未提供',
            date: result.records[0].date,
            status: result.records[0].brief.type.includes('決標') ? '已決標' : '招標中',
            description: result.records[0].detail['採購品項'] || '未提供',
            category: result.records[0].detail['標的分類'] || '未提供',
            method: result.records[0].detail['招標方式'] || '未提供',
            location: result.records[0].detail['履約地點'] || '未提供'
          },
          companies: Object.entries(result.records[0].brief.companies?.name_key || {}).map(([name, status]: [string, any]) => ({
            name: name.split('(')[0].trim(),
            status: status[1]?.includes('未得標') ? '未得標' : '得標',
            amount: status[1]?.match(/金額(\d+)/)?.[1] || '未提供',
            taxId: status[0] || '未提供'
          })),
          progress: {
            startDate: result.records[0].detail['預計開工日'] || '未提供',
            endDate: result.records[0].detail['預計竣工日'] || '未提供',
            currentPhase: result.records[0].detail['履約階段'] || '未提供',
            paymentTerms: result.records[0].detail['付款條件'] || '未提供',
            completionRate: result.records[0].detail['完工進度'] || '未提供'
          },
          documents: [
            {
              title: '招標公告',
              type: 'announcement',
              date: result.records[0].date,
              url: '#'
            },
            {
              title: '決標公告',
              type: 'award',
              date: result.records[0].date,
              url: '#'
            }
          ],
          unit: {
            name: result.unit_name,
            code: result.records[0].unit_id,
            address: result.records[0].detail['機關地址'] || '未提供',
            contact: result.records[0].detail['聯絡人'] || '未提供',
            phone: result.records[0].detail['聯絡電話'] || '未提供',
            email: result.records[0].detail['電子郵件'] || '未提供'
          }
        };

        setData(formattedData);
      } catch (err) {
        setError('資料載入失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenderId]);

  if (loading) {
    return (
      <div className="py-8">
        <InlineLoading />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-red-600 text-center py-4">{error || '無法載入資料'}</div>
    );
  }

  const handleBack = () => {
    window.history.back();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  標案基本資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-base font-medium text-gray-500">標案名稱</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.title}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">標案類型</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.type}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">公告日期</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.date}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">預算金額</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.amount}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">標案狀態</dt>
                    <dd className="mt-1 text-base">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        data.basic.status === '已決標' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {data.basic.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-base font-medium text-gray-500">採購品項</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.description}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">標的分類</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.category}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">招標方式</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.method}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-base font-medium text-gray-500">履約地點</dt>
                    <dd className="mt-1 text-base text-gray-900">{data.basic.location}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );

      case 'companies':
        if (!data.companies || data.companies.length === 0) {
          return <UnderDevelopment message="" />;
        }
        
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                投標廠商資訊
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      廠商名稱
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      統一編號
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      投標金額
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.companies.map((company, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {company.taxId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {company.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          company.status === '得標' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'progress':
        if (!data.progress || data.progress.currentPhase === '未提供') {
          return <UnderDevelopment message="" />;
        }

        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                履約進度
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">預計開工日</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.progress.startDate}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">預計竣工日</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.progress.endDate}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">目前階段</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.progress.currentPhase}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">完工進度</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.progress.completionRate}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-base font-medium text-gray-500">付款條件</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.progress.paymentTerms}</dd>
                </div>
              </dl>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                相關文件
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      文件名稱
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      類型
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.documents.map((doc, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-blue-600 hover:text-blue-800">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {doc.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {doc.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'unit':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                機關資訊
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-base font-medium text-gray-500">機關名稱</dt>
                  <dd className="mt-1 text-base text-gray-900">
                    <button
                      onClick={() => handleUnitClick(data.unit.code, data.unit.name)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {data.unit.name}
                    </button>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">機關代碼</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.unit.code}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-base font-medium text-gray-500">機關地址</dt>
                  <dd className="mt-1 text-base text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-1" />
                    {data.unit.address}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">聯絡人</dt>
                  <dd className="mt-1 text-base text-gray-900">{data.unit.contact}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">聯絡電話</dt>
                  <dd className="mt-1 text-base text-gray-900 flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-1" />
                    {data.unit.phone}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-base font-medium text-gray-500">電子郵件</dt>
                  <dd className="mt-1 text-base text-gray-900 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-1" />
                    {data.unit.email}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return <UnderDevelopment message="" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
        >
          <ArrowLeft className="h-6 w-6 mr-2" />
          返回搜尋結果
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {data.basic.title}
            </h2>
            <p className="flex items-center text-base text-gray-500">
              <FileSpreadsheet className="h-5 w-5 mr-1" />
              預算金額：{data.basic.amount}
            </p>
            <p className="flex items-center text-base text-gray-500">
              <Building2 className="h-5 w-5 mr-1" />
              {data.unit.name}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              加入追蹤
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              下載報表
            </button>
          </div>
        </div>
      </div>

      <UnderDevelopment />

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

      <div className="text-sm text-gray-500 text-center mt-4">
        資料來源：{`https://pcc.g0v.ronny.tw/api`}
      </div>
    </div>
  );
}