'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, SendHorizonal } from 'lucide-react';

export default function DescriptionGenerator() {
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [pageType, setPageType] = useState('');
  const [uniqueSelling, setUniqueSelling] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const pageTypeOptions = [
    '首頁', '產品頁', '服務頁', '文章頁', '關於我們', '聯絡頁',
    '類別頁', '專題頁', '常見問題', '案例展示'
  ];
  
  const ctaOptions = [
    '了解更多', '立即購買', '免費試用', '預約諮詢',
    '立即下載', '聯絡我們', '註冊會員', '獲取優惠'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!keyword) {
      alert('請輸入主要關鍵詞');
      return;
    }

    setIsLoading(true);
    
    try {
      // 模擬API調用
      setTimeout(() => {
        // 生成多個描述
        const generatedDescriptions = [
          `探索${title || '我們的' + pageType || '網站'}，${uniqueSelling || `專業提供${keyword}相關服務`}。無論您是尋求${keyword}的入門指南還是進階技巧，我們都能滿足您的需求。${callToAction || '立即瀏覽'}，獲取專業${keyword}解決方案。`,
          
          `尋找高品質的${keyword}資源？${title || '我們的網站'}提供${uniqueSelling || '全面且實用的內容'}，幫助您解決${keyword}相關的各種挑戰。從基礎知識到專業技巧，一站式滿足您的需求。${callToAction || '即刻探索'}！`,
          
          `${title || pageType || '我們'}為您精心打造${keyword}專業指南，${uniqueSelling || '結合實用案例與專家建議'}。無論您是初學者還是資深用戶，都能在這裡找到有價值的資訊。${callToAction || '點擊查看'}，提升您的${keyword}技能。`,
          
          `想要掌握${keyword}的關鍵技巧？${title || '我們'}提供${uniqueSelling || '獨特見解和實用工具'}，幫助您在競爭中脫穎而出。我們的專家團隊持續更新最新${keyword}趨勢和最佳實踐。${callToAction || '立即行動'}！`
        ];
        
        setDescriptions(generatedDescriptions);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('生成描述時出錯:', error);
      setIsLoading(false);
    }
  };

  const handleDescriptionChange = (text: string) => {
    setCharacterCount(text.length);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼板');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          SEO 描述生成器
        </h3>
        <p className="text-gray-600">
          創建吸引人且優化的Meta描述，提高搜尋引擎顯示效果和點擊率。
          理想的Meta描述應在50-160個字符之間。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主要關鍵詞 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：減肥方法、程式設計、數位行銷"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              網頁標題
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如果您已有網頁標題，請輸入於此"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                頁面類型
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={pageType}
                onChange={(e) => setPageType(e.target.value)}
              >
                <option value="">請選擇頁面類型</option>
                {pageTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                行動呼籲
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
              >
                <option value="">請選擇行動呼籲</option>
                {ctaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              獨特賣點或價值主張
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：10年經驗、獨家方法、免費資源"
              value={uniqueSelling}
              onChange={(e) => setUniqueSelling(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <SendHorizonal size={18} />
                <span>生成描述</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {descriptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100"
        >
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-medium text-blue-800">描述建議</h4>
          </div>

          <div className="space-y-4">
            {descriptions.map((description, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-blue-100 p-4 hover:shadow-sm transition-all"
              >
                <p className="text-gray-800 mb-3">{description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    description.length > 160 ? 'text-red-500' : (description.length < 50 ? 'text-yellow-500' : 'text-green-600')
                  }`}>
                    {description.length} 字符 {description.length > 160 ? '(過長)' : (description.length < 50 ? '(過短)' : '(理想)')}
                  </span>
                  <button
                    onClick={() => copyToClipboard(description)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                  >
                    複製
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-blue-700 space-y-2">
            <p>提示：</p>
            <ul className="list-disc pl-5">
              <li>理想的meta描述應在50-160個字符之間</li>
              <li>包含您的主要關鍵詞，最好在描述的前半部分</li>
              <li>加入行動呼籲，鼓勵使用者點擊</li>
              <li>避免使用特殊字符，可能會在搜索結果中被截斷</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}