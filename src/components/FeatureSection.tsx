import { Building2, FileSpreadsheet, /* AlertTriangle, TrendingUp, */ Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function FeatureSection() {
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleFeatureClick = (feature: 'company' | 'tender' | 'tools') => {
    const paths = {
      company: '/company/search',
      tender: '/tender/search',
      tools: '/aitool/search'
    };

    trackEvent('feature_click', {
      feature_name: feature,
      from_page: window.location.pathname.split('/')[1] // 自動獲取當前頁面
    });

    navigate(paths[feature]);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-12">
      <div 
        onClick={() => handleFeatureClick('tools')}
        className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex-shrink-0">
          <Calculator className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">試用您的 AI 助理</h3>
          <p className="mt-2 text-base text-gray-500">
            立即解鎖 AI 智能助理！16 個領域輕鬆提升效率，從寫作到職涯，一鍵客製化您的專屬智能夥伴！
          </p>
        </div>
      </div>
      <div
        onClick={() => handleFeatureClick('company')}
        className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex-shrink-0">
          <Building2 className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">企業資料</h3>
          <p className="mt-2 text-base text-gray-500">
            一鍵解析企業全貌：董監事、分公司、商標、判決、標案、稅務等 6 大面向的企業智能總覽！
          </p>
        </div>
      </div>
      <div 
        onClick={() => handleFeatureClick('tender')}
        className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex-shrink-0">
          <FileSpreadsheet className="h-7 w-7 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-900">標案資訊</h3>
          <p className="mt-2 text-base text-gray-500">
            全面政府標案情報：一鍵解析標案名稱、金額、得標廠商，多元智能查詢，讓您精準抓住關鍵商機！
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
    </div>
  );
} 