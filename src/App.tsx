import { useState, useEffect } from 'react';
import { Search, Wrench, FileText } from 'lucide-react';
import CompanySearch from './components/company/CompanySearch';
import CompanyDetail from './components/company/CompanyDetail';
import TenderSearch from './components/tender/TenderSearch';
import TenderDetail from './components/tender/TenderDetail';
import Tools from './components/tools/Tools';
import { useCompanySearch } from './hooks/useCompanySearch';
import { useTenderSearch } from './hooks/useTenderSearch';
import { PageState } from './types/index';
import FeatureSection from './components/FeatureSection';
// import RecentUpdates from './components/RecentUpdates';

function App() {
  const [pageState, setPageState] = useState<PageState>(PageState.COMPANY_SEARCH);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedTender, setSelectedTender] = useState<string | null>(null);

  const {
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    resetCompanySearch
  } = useCompanySearch();

  const {
    resetTenderSearch,
    setSearchQuery: setTenderSearchQuery,
    setSearchType: setTenderSearchType
  } = useTenderSearch();

  useEffect(() => {
    window.addEventListener('load', handleTitleClick);

    return () => {
      window.removeEventListener('load', handleTitleClick);
    };
  }, []);

  const handleTitleClick = () => {
    setSelectedCompany(null);
    setSelectedTender(null);
    resetCompanySearch();
    resetTenderSearch();
    setPageState(PageState.COMPANY_SEARCH);
  };

  const handleNavigation = (state: PageState) => {
    setPageState(state);
    setSelectedCompany(null);
    setSelectedTender(null);
  };

  const handleCompanySelect = (companyTaxId: string) => {
    setSelectedCompany(companyTaxId);
    setPageState(PageState.COMPANY_DETAIL);
  };

  const handleTenderSelect = (tenderId: string) => {
    setSelectedTender(tenderId);
    setPageState(PageState.TENDER_DETAIL);
  };

  const handleBack = () => {
    if (pageState === PageState.COMPANY_DETAIL) {
      setPageState(PageState.COMPANY_SEARCH);
      setSelectedCompany(null);
    } else if (pageState === PageState.TENDER_DETAIL) {
      setPageState(PageState.TENDER_SEARCH);
      setSelectedTender(null);
    }
  };

  const handleFeatureCardClick = (feature: 'company' | 'tender' | 'tools') => {
    if (feature === 'company' && pageState !== PageState.COMPANY_SEARCH) {
      setPageState(PageState.COMPANY_SEARCH);
      setSelectedTender(null);
      resetTenderSearch();
    } else if (feature === 'tender' && pageState !== PageState.TENDER_SEARCH) {
      setPageState(PageState.TENDER_SEARCH);
      setSelectedCompany(null);
      resetCompanySearch();
    } else if (feature === 'tools' && pageState !== PageState.TOOLS) {
      setPageState(PageState.TOOLS);
      setSelectedCompany(null);
      setSelectedTender(null);
      resetCompanySearch();
      resetTenderSearch();
    }
  };

  const handleSearchTender = (query: string, type: 'company' | 'tender') => {
    setPageState(PageState.TENDER_SEARCH);
    setSelectedCompany(null);
    
    setTenderSearchQuery(query);
    setTenderSearchType(type);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center cursor-pointer" onClick={handleTitleClick}>
              <img src="/magnifier.ico" alt="企業放大鏡 Logo" className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                企業放大鏡™
                <span className={`text-base ml-2 ${
                  pageState === PageState.COMPANY_SEARCH ? 'text-blue-600' :
                  pageState === PageState.TENDER_SEARCH ? 'text-green-600' :
                  pageState === PageState.TOOLS ? 'text-amber-500' : 'text-blue-600'
                }`}>βeta 版本</span>
              </h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => handleFeatureCardClick('company')}
                className={`${
                  pageState === PageState.COMPANY_SEARCH
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-4 -mb-4 px-1 font-medium text-base flex items-center`}
              >
                <Search className="mr-2 h-6 w-6" />
                企業搜尋
              </button>
              <button
                onClick={() => handleFeatureCardClick('tender')}
                className={`${
                  pageState === PageState.TENDER_SEARCH
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-4 -mb-4 px-1 font-medium text-base flex items-center`}
              >
                <FileText className="mr-2 h-6 w-6" />
                標案搜尋
              </button>
              <button
                onClick={() => handleNavigation(PageState.TOOLS)}
                className={`${
                  pageState === PageState.TOOLS
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-gray-500 hover:text-gray-700'
                } pb-4 -mb-4 px-1 font-medium text-base flex items-center`}
              >
                <Wrench className="mr-2 h-6 w-6" />
                實用工具
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pageState === PageState.COMPANY_SEARCH && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl sm:tracking-tight lg:text-6xl">
                快速查詢
                <span className="text-blue-600">企業資訊</span>
              </h2>
              <p className="mx-auto text-2xl text-gray-500">
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
            <FeatureSection onFeatureClick={handleFeatureCardClick} />

            {/* Recent Updates */}
            {/* <RecentUpdates /> */}
          </div>
        )}

        {pageState === PageState.COMPANY_DETAIL && selectedCompany && (
          <CompanyDetail 
            companyTaxId={selectedCompany} 
            onBack={handleBack}
            onTenderSelect={handleTenderSelect}
            onSearchTender={handleSearchTender}
          />
        )}

        {pageState === PageState.TENDER_SEARCH && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl sm:tracking-tight lg:text-6xl">
                快速查詢
                <span className="text-green-600">標案資訊</span>
              </h2>
              <p className="mx-auto text-2xl text-gray-500">
                輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊
              </p>
            </div>

            {/* Search Section */}
            <TenderSearch 
              onTenderSelect={handleTenderSelect}
            />

            {/* Feature Section */}
            <FeatureSection onFeatureClick={handleFeatureCardClick} />

            {/* Recent Updates */}
            {/* <RecentUpdates /> */}
          </div>
        )}

        {pageState === PageState.TENDER_DETAIL && selectedTender && (
          <TenderDetail
            tenderId={selectedTender}
            onBack={handleBack}
          />
        )}

        {pageState === PageState.TOOLS && <Tools />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        {/* <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
                關於我們
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    公司介紹
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    使用條款
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    隱私政策
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
                產品服務
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    企業搜尋
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    標案查詢
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    實用工具
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
                資源中心
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    使用教學
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    常見問題
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    API件
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
                聯絡我們
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    客服中心
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    合作提案
                  </a>
                </li>
                <li>
                  <a href="#" className="text-lg text-gray-500 hover:text-gray-900">
                    意見回饋
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-lg text-gray-400 text-center">
              © 2024 企業放大鏡. All rights reserved.
            </p>
          </div>
        </div> */}
        <div className="border-gray-200 pt-8 pb-8">
            <p className="text-lg text-gray-400 text-center">
              © 2024 企業放大鏡. All rights reserved.
            </p>
          </div>
      </footer>
    </div>
  );
}

export default App;