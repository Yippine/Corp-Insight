import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from './components/Layout';
import CompanySearchPage from './pages/CompanySearchPage';
import CompanyDetail from './components/company/CompanyDetail';
import TenderSearchPage from './pages/TenderSearchPage';
import TenderDetail from './components/tender/TenderDetail';
import ToolsList from './components/tools/ToolsList';
import ToolDetail from './components/tools/ToolDetail';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';
import { siteConfig } from './config/site';

function App() {
  const location = useLocation();
  const { trackPageView } = useGoogleAnalytics();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location, trackPageView]);

  const getPageTitle = () => {
    const matchedPath = Object.entries(siteConfig.titles).find(([path]) => 
      location.pathname.startsWith(path)
    );
    return `${siteConfig.title} - ${matchedPath?.[1] || siteConfig.defaultTitle}`;
  };

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
          <Route path="ai-assistant">
            <Route index element={<ToolsList />} />
            <Route path=":toolId" element={<ToolDetail />} />
          </Route>

          {/* 404 路由 */}
          <Route path="*" element={<Navigate to="/company/search" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;