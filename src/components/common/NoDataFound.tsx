import { Search } from 'lucide-react';

interface NoDataFoundProps {
  message?: string;
  icon?: React.ElementType;
}

export default function NoDataFound({
  message = '查無資料',
  icon: Icon = Search
}: NoDataFoundProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-white overflow-hidden sm:rounded-lg p-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Icon className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">{message}</h3>
        </div>
      </div>
    </div>
  );
}