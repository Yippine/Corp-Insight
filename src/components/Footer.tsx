import { Link } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function Footer() {
  const { trackEvent } = useGoogleAnalytics();

  const handleFooterLinkClick = (linkName: string) => {
    trackEvent('footer_link_click', { link_name: linkName });
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              關於我們
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  to="/about"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('公司介紹')}
                >
                  公司介紹
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('使用條款')}
                >
                  使用條款
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('隱私政策')}
                >
                  隱私政策
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              產品服務
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  to="/company/search"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('企業搜尋')}
                >
                  企業搜尋
                </Link>
              </li>
              <li>
                <Link
                  to="/tender/search"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('標案查詢')}
                >
                  標案查詢
                </Link>
              </li>
              <li>
                <Link
                  to="/aitool/search"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('AI助理')}
                >
                  試用您的 AI 助理
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              資源中心
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  to="/tutorial"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('使用教學')}
                >
                  使用教學
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('常見問題')}
                >
                  常見問題
                </Link>
              </li>
              <li>
                <Link
                  to="/api"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('API文件')}
                >
                  API 文件
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-400 tracking-wider uppercase">
              聯絡我們
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  to="/contact"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('客服中心')}
                >
                  客服中心
                </Link>
              </li>
              <li>
                <Link
                  to="/partnership"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('合作提案')}
                >
                  合作提案
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="text-lg text-gray-500 hover:text-gray-900"
                  onClick={() => handleFooterLinkClick('意見回饋')}
                >
                  意見回饋
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-lg text-gray-400 text-center">
            © {new Date().getFullYear()} 企業放大鏡. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}