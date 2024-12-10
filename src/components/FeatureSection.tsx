import { Building2, FileSpreadsheet, /* AlertTriangle, TrendingUp, */ Calculator } from 'lucide-react';

interface FeatureSectionProps {
  onFeatureClick?: (feature: 'company' | 'tender' | 'tools') => void;
}

export default function FeatureSection({ onFeatureClick }: FeatureSectionProps) {
  const handleFeatureClick = (feature: 'company' | 'tender' | 'tools') => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-12">
      <div 
        onClick={() => handleFeatureClick('company')}
        className={`bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4 ${onFeatureClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      >
        <div className="flex-shrink-0">
          <Building2 className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">企業資料</h3>
          <p className="mt-2 text-base text-gray-500">
            完整的公司登記資料、董監事名單、分公司資訊
          </p>
        </div>
      </div>
      <div 
        onClick={() => handleFeatureClick('tender')}
        className={`bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4 ${onFeatureClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      >
        <div className="flex-shrink-0">
          <FileSpreadsheet className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">標案資訊</h3>
          <p className="mt-2 text-base text-gray-500">
            政府標案歷史、得標紀錄、招標公告
          </p>
        </div>
      </div>
      {/* <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">風險評估</h3>
          <p className="mt-2 text-base text-gray-500">
            訴訟紀錄、負面新聞、信用評等
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
        <div className="flex-shrink-0">
          <TrendingUp className="h-7 w-7 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">產業分析</h3>
          <p className="mt-2 text-base text-gray-500">
            市場趨勢、競爭對手、產業報告
          </p>
        </div>
      </div> */}
      <div 
        onClick={() => handleFeatureClick('tools')}
        className={`bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4 ${onFeatureClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      >
        <div className="flex-shrink-0">
          <Calculator className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">實用工具</h3>
          <p className="mt-2 text-base text-gray-500">
            SEO 優化、金融計算、製造業參數、電腦效能評估
          </p>
        </div>
      </div>
    </div>
  );
} 