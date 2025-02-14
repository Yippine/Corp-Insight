import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import CompanySearch from '../components/company/CompanySearch';
import FeatureSection from '../components/FeatureSection';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function CompanySearchPage() {
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const [isSearchLoaded, setIsSearchLoaded] = useState(false);
  
  useEffect(() => {
    if (isSearchLoaded) {
      const scrollPosition = sessionStorage.getItem('companySearchScroll');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem(`companySearchScroll`)
      }
    }
  }, [isSearchLoaded]);

  const handleCompanySelect = (taxId: string) => {
    trackEvent('company_detail_click', {
      tax_id: taxId
    })

    navigate(`/company/detail/${encodeURIComponent(taxId)}`);
  };

  return (
    <div className="space-y-8">
      <HeroSection 
        title="快速查詢"
        highlightText="企業資訊"
        description="輸入公司名稱、統編、負責人或關鍵字，立即獲取完整企業資訊"
        highlightColor="text-blue-600"
      />

      <CompanySearch 
        onCompanySelect={handleCompanySelect}
        onSearchComplete={() => setIsSearchLoaded(true)}
      />
      
      <FeatureSection />
    </div>
  );
}