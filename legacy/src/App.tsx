import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from './components/Layout';
import CompanySearchPage from './pages/CompanySearchPage';
import CompanyDetail from './components/company/CompanyDetail';
import TenderSearchPage from './pages/TenderSearchPage';
import TenderDetail from './components/tender/TenderDetail';
import ToolSearch from './components/tools/ToolSearch';
import ToolDetail from './components/tools/ToolDetail';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import FeedbackPage from './pages/FeedbackPage';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';
import { siteConfig } from './config/site';

function App() {
  const location = useLocation();
  const { trackPageView, trackUrlError } = useGoogleAnalytics();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      trackPageView(location.pathname);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname, trackPageView]);

  const getPageTitle = () => {
    const matchedPath = Object.entries(siteConfig.titles).find(([path]) => 
      location.pathname.startsWith(path)
    );
    return `${siteConfig.title} - ${matchedPath?.[1] || siteConfig.defaultTitle}`;
  };

  const Redirect = () => {
    useEffect(() => {
      trackUrlError(location.pathname);
    }, [location.pathname]);
  
    return <Navigate to="/company/search" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={siteConfig.description} />
      </Helmet>

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 主頁路由 */}
          <Route index element={<Navigate to="/company/search" replace />} />
          
          {/* 企業查詢路由 */}
          <Route path="company">
            <Route index element={<Navigate to="search" replace />} />
            <Route path="search" element={<CompanySearchPage />} />
            <Route path="detail/:taxId" element={<CompanyDetail />} />
          </Route>

          {/* 標案查詢路由 */}
          <Route path="tender">
            <Route index element={<Navigate to="search" replace />} />
            <Route path="search" element={<TenderSearchPage />} />
            <Route path="detail/:tenderId" element={<TenderDetail />} />
          </Route>

          {/* AI 助理路由 */}
          <Route path="aitool">
            <Route path="search" element={<ToolSearch />} />
            <Route path="detail/:toolId" element={<ToolDetail />} />
          </Route>

          {/* 網站地圖路由 */}
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="feedback" element={<FeedbackPage />} />

          {/* 404 路由 */}
          <Route path="*" element={<Redirect />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;