import { useState } from 'react';
import { Search, Building2, FileSpreadsheet, Wrench, ChevronRight, TrendingUp, AlertTriangle, Award, Users } from 'lucide-react';
import CompanySearch from './components/CompanySearch';
import CompanyDetail from './components/CompanyDetail';
import Tools from './components/Tools';
import { useCompanySearch } from './hooks/useCompanySearch';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'tools'>('search');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const {
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages
  } = useCompanySearch();

  // 處理公司選擇
  const handleCompanySelect = (companyTaxId: string) => {
    setSelectedCompany(companyTaxId);
  };

  // 處理返回
  const handleBack = () => {
    setSelectedCompany(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">企業放大鏡</h1>
            <nav className="flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('search');
                  setSelectedCompany(null);
                }}
                className={`${
                  activeTab === 'search'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-4 -mb-4 px-1 font-medium text-sm flex items-center`}
              >
                <Search className="mr-2 h-5 w-5" />
                企業搜尋
              </button>
              <button
                onClick={() => {
                  setActiveTab('tools');
                  setSelectedCompany(null);
                }}
                className={`${
                  activeTab === 'tools'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-4 -mb-4 px-1 font-medium text-sm flex items-center`}
              >
                <Wrench className="mr-2 h-5 w-5" />
                實用工具
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && !selectedCompany && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                快速查詢企業資訊
              </h2>
              <p className="max-w-xl mx-auto text-xl text-gray-500">
                輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊
              </p>
            </div>

            {/* Search Section */}
            <CompanySearch 
              onCompanySelect={handleCompanySelect}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
            />

            {/* Feature Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 mt-12">
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">企業資料</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    完整的公司登記資料、董監事名單、分公司資訊
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">標案資訊</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    政府標案歷史、得標紀錄、招標公告
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">風險評估</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    訴訟紀錄、負面新聞、信用評等
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">產業分析</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    市場趨勢、競爭對手、產業報告
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">最新動態</h2>
                <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
                  查看更多 <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-500">重大標案</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    台積電獲得新竹科學園區擴建案
                  </h3>
                  <p className="text-sm text-gray-600">
                    總金額達 NT$ 1,500,000,000...
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-500">人事異動</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    聯發科技董事會改選
                  </h3>
                  <p className="text-sm text-gray-600">
                    新任董事長及總經理名單公布...
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <Building2 className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-500">新設立公司</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    本週新設立公司統計
                  </h3>
                  <p className="text-sm text-gray-600">
                    本週全台新設立公司共計 1,234 家...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && selectedCompany && (
          <CompanyDetail 
            companyTaxId={selectedCompany} 
            onBack={handleBack}
          />
        )}

        {activeTab === 'tools' && <Tools />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                關於我們
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    公司介紹
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    使用條款
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    隱私政策
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                產品服務
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    企業搜尋
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    標案查詢
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    實用工具
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                資源中心
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    使用教學
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    常見問題
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    API文件
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                聯絡我們
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    客服中心
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    合作提案
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    意見回饋
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2024 企業放大鏡. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;