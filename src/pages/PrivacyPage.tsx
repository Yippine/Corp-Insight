import { motion } from 'framer-motion';
import { Globe, Database, Shield } from 'lucide-react';

const dataSources = [
  {
    id: 'company',
    name: '台灣公司資料',
    url: 'https://company.g0v.ronny.tw/',
    description: '整合經濟部商業司及財政部營業稅籍資料，提供便捷的台灣公司資訊查詢管道，協助使用者輕鬆了解企業基本資訊。',
    icon: Database,
    color: 'blue'
  },
  {
    id: 'twincn',
    name: '台灣上市上櫃公司',
    url: 'https://p.twincn.com/',
    description: '提供上市、上櫃、興櫃及公開發行公司之股票代號、公司基本資訊，協助使用者快速查詢企業基本資料。',
    icon: Globe,
    color: 'green'
  },
  {
    id: 'tender',
    name: '標案瀏覽',
    url: 'https://pcc.g0v.ronny.tw/',
    description: '彙整中華民國政府電子採購網公開資訊，提供標案查詢與資料分析服務，遵循政府資料開放原則。',
    icon: Shield,
    color: 'purple'
  }
];

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
    hover: 'hover:border-blue-300 hover:bg-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
    hover: 'hover:border-green-300 hover:bg-green-100'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-500',
    hover: 'hover:border-purple-300 hover:bg-purple-100'
  }
};

export default function PrivacyPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          資料來源聲明
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          我們致力於提供準確、透明的資訊，以下是我們的資料來源及相關聲明。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-16">
        {dataSources.map((source, index) => {
          const colors = colorVariants[source.color as keyof typeof colorVariants];
          
          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200`}
            >
              <div className="p-8">
                <div className="flex items-center space-x-6">
                  <div className={`flex-shrink-0 p-4 rounded-xl bg-white shadow-sm ${colors.text}`}>
                    <source.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>
                      {source.name}
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">
                      {source.description}
                    </p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-lg font-medium ${colors.text} hover:underline`}
                    >
                      查看資料來源
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          資料使用聲明
        </h2>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="leading-relaxed mb-4">
            本平台提供的所有資訊均來自政府公開資料，我們致力於資料的即時更新，但由於資料來源的更新頻率不同，可能存在時間差異。因此：
          </p>
          <ul className="space-y-3 list-disc pl-6 marker:text-gray-400">
            <li className="pl-2">
              <span className="font-medium text-gray-700">本平台僅提供資料檢索服務</span>，不保證資訊的即時性與完整性。
            </li>
            <li className="pl-2">
              <span className="font-medium text-gray-700">使用者應自行核實資料的準確性</span>，並承擔使用資料的相關風險。
            </li>
            <li className="pl-2">
              如發現資料有誤，歡迎透過
              <span className="font-medium text-gray-700">「資料勘誤」功能</span>
              回報。
            </li>
          </ul>
        </div>
      </div>

      {/* <div className="bg-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          資料更新頻率
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">企業資料</h3>
            <p className="text-gray-600">每日更新一次</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">標案資料</h3>
            <p className="text-gray-600">每小時更新一次</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">財報資料</h3>
            <p className="text-gray-600">依公開資訊觀測站更新頻率</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}