import { useState } from 'react';
import { Search } from 'lucide-react';
import SearchResults from './SearchResults';
import UnitResults from './UnitResults';
import TenderDetail from './TenderDetail';

type SearchType = 'keyword' | 'company' | 'taxId';

interface SearchState {
  type: SearchType;
  query: string;
  page: number;
}

export default function TenderSearch() {
  const [searchState, setSearchState] = useState<SearchState>({
    type: 'keyword',
    query: '',
    page: 1,
  });
  const [inputValue, setInputValue] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTender, setSelectedTender] = useState<{
    unitId: string;
    jobNumber: string;
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchState(prev => ({ ...prev, query: inputValue, page: 1 }));
    setSelectedUnitId(null);
    setSelectedTender(null);
  };

  const handleUnitClick = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedTender(null);
  };

  const handleTenderClick = (unitId: string, jobNumber: string) => {
    setSelectedTender({ unitId, jobNumber });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex space-x-4">
          <select
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchState.type}
            onChange={(e) => setSearchState(prev => ({ ...prev, type: e.target.value as SearchType }))}
          >
            <option value="keyword">標案名稱</option>
            <option value="company">廠商名稱</option>
            <option value="taxId">統一編號</option>
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              className="block w-full h-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
              placeholder={
                searchState.type === 'keyword' ? '請輸入標案名稱...' :
                searchState.type === 'company' ? '請輸入廠商名稱...' :
                '請輸入統一編號...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            搜尋
          </button>
        </div>
      </form>

      {selectedTender ? (
        <TenderDetail
          unitId={selectedTender.unitId}
          jobNumber={selectedTender.jobNumber}
          onBack={() => setSelectedTender(null)}
        />
      ) : selectedUnitId ? (
        <UnitResults
          unitId={selectedUnitId}
          onTenderClick={handleTenderClick}
          onBack={() => setSelectedUnitId(null)}
        />
      ) : searchState.query && (
        <SearchResults
          searchState={searchState}
          onPageChange={(page) => setSearchState(prev => ({ ...prev, page }))}
          onUnitClick={handleUnitClick}
          onTenderClick={handleTenderClick}
        />
      )}
    </div>
  );
}