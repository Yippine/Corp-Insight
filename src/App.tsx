import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from './components/Layout';
import CompanySearchPage from './pages/CompanySearchPage';
import CompanyDetail from './components/company/CompanyDetail';
import TenderSearchPage from './pages/TenderSearchPage';
import TenderDetail from './components/tender/TenderDetail';
import Tools from './components/tools/Tools';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';

function App() {
  const location = useLocation();
  const { trackPageView } = useGoogleAnalytics();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location, trackPageView]);

  return (
    <>
      <Helmet>
        <title>企業放大鏡™ - 企業資訊查詢平台</title>
        <meta name="description" content="快速查詢企業資訊、標案資料，一站式企業智能分析平台" />
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

          {/* AI助理路由 */}
          <Route path="ai-assistant">
            <Route index element={<Tools />} />
            <Route path=":toolId" element={<Tools />} />
          </Route>

          {/* 404 路由 */}
          <Route path="*" element={<Navigate to="/company/search" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;