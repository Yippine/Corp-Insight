import { useNavigate, useLocation } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import TenderSearch from '../components/tender/TenderSearch';
import FeatureSection from '../components/FeatureSection';
import { useEffect, useState } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function TenderSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackEvent } = useGoogleAnalytics();
  const [isSearchLoaded, setIsSearchLoaded] = useState(false);

  useEffect(() => {
    if (location.state?.fromDetail && 
        location.state?.scrollPosition && 
        isSearchLoaded) {
      requestAnimationFrame(() => {
        window.scrollTo(0, location.state.scrollPosition);
      });
    }
  }, [location.state, isSearchLoaded]);

  const handleTenderSelect = (tenderId: string) => {
    trackEvent('tender_detail_click', {
      tender_id: tenderId
    })

    navigate(`/tender/detail/${tenderId}`);
  };

  return (
    <div className="space-y-8">
      <HeroSection 
        title="快速查詢"
        highlightText="標案資訊"
        description="輸入標案名稱、公司名稱、統編或關鍵字，立即獲取完整標案資訊"
        highlightColor="text-green-600"
      />

      <TenderSearch 
        onTenderSelect={handleTenderSelect}
        onSearchComplete={() => setIsSearchLoaded(true)}
      />
      
      <FeatureSection />
    </div>
  );
}