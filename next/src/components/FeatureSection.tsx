import { FileSearch, Database, Clock, Zap } from 'lucide-react';

export default function FeatureSection() {
  const features = [
    {
      icon: <FileSearch className="h-8 w-8 text-blue-600" />,
      title: '快速企業查詢',
      description: '輸入關鍵詞立即找到相關企業資訊，支援公司名稱、統編和負責人多種搜尋方式。',
    },
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: '完整資料庫',
      description: '提供完整的企業基本資料、資本額、設立日期等重要資訊，幫您掌握企業全貌。',
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: '即時資訊更新',
      description: '定期從官方來源同步更新，確保您獲取的企業資訊為最新狀態。',
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: '進階分析功能',
      description: '標案查詢整合，一鍵了解企業的政府標案參與情況及中標紀錄。',
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            功能特點
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            提供全方位企業資訊查詢與分析，助您做出更明智的商業決策
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, idx) => (
              <div key={idx} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}