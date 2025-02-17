import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Wrench, FileText } from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useEffect, useState } from 'react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackFeatureNavigation } = useGoogleAnalytics();
  const [showTryText, setShowTryText] = useState(true);

  const handleNavigation = (path: string) => {
    trackFeatureNavigation('header');
    navigate(path);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTryText(prev => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center"
          >
            <img src="/magnifier.ico" alt="企業放大鏡 Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              企業放大鏡™
              <span className="text-base ml-2 text-blue-600">βeta 版本</span>
            </h1>
          </button>

          <nav className="flex space-x-8">
            <button
              onClick={() => handleNavigation('/aitool/search')}
              className={`${
                location.pathname.startsWith('/aitool')
                  ? 'text-amber-500 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-amber-600'
              } pb-4 -mb-4 px-1 font-medium text-base flex items-center group relative`}
            >
              <Wrench className="mr-2 h-6 w-6" />
              <span className="relative h-full flex items-center min-w-[95px] justify-center">
                <span 
                  className={`absolute left-0 right-0 transition-opacity duration-500 ${
                    showTryText ? 'opacity-100' : 'opacity-0 invisible'
                  } bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent animate-pulse flex justify-center items-center h-full`}
                >
                  立即試用 Try
                </span>
                <span 
                  className={`transition-opacity duration-500 absolute left-0 right-0 ${
                    showTryText ? 'opacity-0 invisible' : 'opacity-100'
                  } flex justify-center items-center h-full`}
                >
                  您的 AI 助理
                </span>
              </span>
            </button>

            <button
              onClick={() => handleNavigation('/company/search')}
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
              onClick={() => handleNavigation('/tender/search')}
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