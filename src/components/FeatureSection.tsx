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
            完整的公司基本資料、董監事名單、分公司資訊、工廠登記、商標、判決書、政府標案、稅籍資料等企業完整資訊
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
            完整政府標案資訊，包含標案名稱、金額、得標廠商、機關單位等詳細內容，並可依標案、廠商、機關等多維度查詢分析
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
          <h3 className="text-xl font-medium text-gray-900">試用您的 AI 助理</h3>
          <p className="mt-2 text-base text-gray-500">
            立即體驗多款免費的生成式 AI 助理！從寫作、SEO、職涯規劃到提示詞優化，為您打造高效且專業的智能助理
          </p>
        </div>
      </div>
    </div>
  );
} 