import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type SearchType = 'company' | 'tender';

export function useSearchState(searchType: SearchType) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 從 sessionStorage 讀取導航狀態
  const getNavigationState = () => {
    return sessionStorage.getItem(`search_${searchType}_navigation`);
  };

  // 處理頁面進入邏輯
  useEffect(() => {
    const navState = getNavigationState();
    
    if (location.state?.fromDetail) {
      sessionStorage.removeItem(`search_${searchType}_navigation`);
      setIsInitialLoad(false);
    } else if (navState === 'from_search') {
      setIsInitialLoad(false);
    } else {
      sessionStorage.setItem(`search_${searchType}_navigation`, 'initial');
      setIsInitialLoad(true);
    }
  }, [location.key]);

  // 處理導航到明細頁
  const navigateToDetail = (path: string) => {
    sessionStorage.setItem(`search_${searchType}_navigation`, 'from_search');
    navigate(path, { state: { fromSearch: true } });
  };

  const handleBackNavigation = () => {
    sessionStorage.setItem(`search_${searchType}_navigation`, 'from_detail');
    navigate(-1);
  };

  return { isInitialLoad, navigateToDetail, handleBackNavigation };
}