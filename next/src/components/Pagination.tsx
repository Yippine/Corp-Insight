import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { ButtonLoading } from './common/loading/LoadingTypes';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const handleFirstPage = () => onPageChange(1);
  const handleLastPage = () => onPageChange(totalPages);
  const handlePrevPage = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && onPageChange(currentPage + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center">
        <p className="text-base text-gray-700">
          第 <span className="font-medium">{currentPage}</span> 頁， 共{' '}
          <span className="font-medium">{totalPages}</span> 頁
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleFirstPage}
          disabled={currentPage <= 1 || isLoading}
          className="relative inline-flex items-center rounded-md bg-white px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="第一頁"
        >
          <ChevronsLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1 || isLoading}
          className="relative inline-flex items-center rounded-md bg-white px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="上一頁"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <form
          onSubmit={handlePageSubmit}
          className="flex items-center space-x-2"
        >
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={e => setInputPage(e.target.value)}
            disabled={isLoading}
            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            title="輸入頁碼"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-3 py-1 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <ButtonLoading text="前往" /> : '前往'}
          </button>
        </form>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="relative inline-flex items-center rounded-md bg-white px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="下一頁"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          onClick={handleLastPage}
          disabled={currentPage >= totalPages || isLoading}
          className="relative inline-flex items-center rounded-md bg-white px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="最後一頁"
        >
          <ChevronsRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
