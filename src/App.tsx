import { useState } from 'react';
import { Building2, FileSpreadsheet } from 'lucide-react';
import TenderSearch from './components/TenderSearch';
import CompanySearch from './components/CompanySearch';

function App() {
  const [activeTab, setActiveTab] = useState('tender');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">企業放大鏡</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tender')}
                className={`${
                  activeTab === 'tender'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center w-1/3 py-4 px-4 border-b-2 font-medium text-sm`}
              >
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                標案資料
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`${
                  activeTab === 'company'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center w-1/3 py-4 px-4 border-b-2 font-medium text-sm`}
              >
                <Building2 className="mr-2 h-5 w-5" />
                企業資料
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'tender' && <TenderSearch />}
            {activeTab === 'company' && <CompanySearch />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;