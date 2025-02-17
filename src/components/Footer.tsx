import { useNavigate } from 'react-router-dom';
import {  } from 'react-router-dom';
import SimpleFooter from './SimpleFooter';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function Footer() {
  const { trackEvent } = useGoogleAnalytics();
  const navigate = useNavigate();

  const handleNavigation = (e: React.MouseEvent, category: string, path: string, isExternal = false) => {
    e.preventDefault();
    trackEvent('footer_navigation', {
      event_category: category,
      link_url: path,
      link_type: isExternal ? 'external' : 'internal'
    });

    if (isExternal) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              產品服務
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <span
                  onClick={(e) => handleNavigation(e, 'product_services', '/aitool/search')}
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  試用您的 AI 助理
                </span>
              </li>
              <li>
                <span
                  onClick={(e) => handleNavigation(e, 'product_services', '/company/search')}
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  企業搜尋
                </span>
              </li>
              <li>
                <span
                  onClick={(e) => handleNavigation(e, 'product_services', '/tender/search')}
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  標案搜尋
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              資料聲明
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <span
                  onClick={(e) => handleNavigation(e, 'data_declaration', '/faq')}
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  常見問題
                </span>
              </li>
              <li>
                <span
                  onClick={(e) => handleNavigation(e, 'data_declaration', '/feedback?type=data_correction')}
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  資料勘誤
                </span>
              </li>
              <li>
                <span
                  onClick={(e) => handleNavigation(e, 'data_declaration', '/privacy')}
                  className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  資料來源聲明
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
                合作洽詢
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <span
                    onClick={(e) => handleNavigation(e, 'cooperation', '/feedback?type=business_cooperation')}
                    className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    業務合作
                  </span>
                </li>
                <li>
                  <span
                    onClick={(e) => handleNavigation(e, 'cooperation', '/feedback')}
                    className="text-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    意見回饋
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <SimpleFooter />
      </div>
    </footer>
  );
}