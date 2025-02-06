import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Wrench, FileText } from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleNavigation = (path: string, name: string) => {
    trackEvent('navigation_click', { 
      link_name: name,
      from_path: location.pathname 
    });
    navigate(path);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link 
            to="/"
            className="flex items-center"
            onClick={() => trackEvent('logo_click')}
          >
            <img src="/magnifier.ico" alt="企業放大鏡 Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              企業放大鏡™
              <span className="text-base ml-2 text-blue-600">βeta 版本</span>
            </h1>
          </Link>

          <nav className="flex space-x-8">
            <button
              onClick={() => handleNavigation('/ai-assistant', 'AI助理')}
              className={`${
                location.pathname.startsWith('/ai-assistant')
                  ? 'text-amber-500 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center`}
            >
              <Wrench className="mr-2 h-6 w-6" />
              試用您的 AI 助理
            </button>

            <button
              onClick={() => handleNavigation('/company/search', '企業搜尋')}
              className={`${
                location.pathname.startsWith('/company')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center`}
            >
              <Search className="mr-2 h-6 w-6" />
              企業搜尋
            </button>

            <button
              onClick={() => handleNavigation('/tender/search', '標案搜尋')}
              className={`${
                location.pathname.startsWith('/tender')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center`}
            >
              <FileText className="mr-2 h-6 w-6" />
              標案搜尋
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}