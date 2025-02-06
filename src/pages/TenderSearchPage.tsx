import HeroSection from '../components/HeroSection';
import TenderSearch from '../components/tender/TenderSearch';
import FeatureSection from '../components/FeatureSection';
import { useNavigate } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function TenderSearchPage() {
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleTenderSelect = (tenderId: string) => {
    trackEvent('tender_select', {
      tender_id: tenderId,
      from_page: 'search'
    });
    navigate(`/tender/detail/${tenderId}`);
  };

  const handleFeatureClick = (feature: 'company' | 'tender' | 'tools') => {
    const paths = {
      company: '/company/search',
      tender: '/tender/search',
      tools: '/ai-assistant'
    };

    trackEvent('feature_click', {
      feature_name: feature,
      from_page: 'tender_search'
    });

    navigate(paths[feature]);
  };

  return (
    <div className="space-y-8">
      <HeroSection 
        title="快速查詢"
        highlightText="標案資訊"
        description="輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊"
        highlightColor="text-green-600"
      />

      <TenderSearch onTenderSelect={handleTenderSelect} />
      
      <FeatureSection onFeatureClick={handleFeatureClick} />
    </div>
  );
}