import HeroSection from '../components/HeroSection';
import CompanySearch from '../components/company/CompanySearch';
import FeatureSection from '../components/FeatureSection';
import { useNavigate } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function CompanySearchPage() {
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleCompanySelect = (companyTaxId: string) => {
    trackEvent('company_select', {
      company_id: companyTaxId,
      from_page: 'search'
    });
    navigate(`/company/detail/${companyTaxId}`);
  };

  const handleFeatureClick = (feature: 'company' | 'tender' | 'tools') => {
    const paths = {
      company: '/company/search',
      tender: '/tender/search',
      tools: '/ai-assistant'
    };

    trackEvent('feature_click', {
      feature_name: feature,
      from_page: 'company_search'
    });

    navigate(paths[feature]);
  };

  return (
    <div className="space-y-8">
      <HeroSection 
        title="快速查詢"
        highlightText="企業資訊"
        description="輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊"
        highlightColor="text-blue-600"
      />

      <CompanySearch onCompanySelect={handleCompanySelect} />
      
      <FeatureSection onFeatureClick={handleFeatureClick} />
    </div>
  );
}