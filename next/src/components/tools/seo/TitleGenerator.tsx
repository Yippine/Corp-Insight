'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, SendHorizonal } from 'lucide-react';

export default function TitleGenerator() {
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [length, setLength] = useState('中等');
  const [emotion, setEmotion] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const industryOptions = [
    '電子商務',
    '科技',
    '健康醫療',
    '教育',
    '金融',
    '房地產',
    '旅遊',
    '食品餐飲',
    '美容時尚',
    '家居園藝',
    '藝術娛樂',
    '運動健身',
  ];

  const audienceOptions = [
    '專業人士',
    '學生',
    '父母',
    '年輕人',
    '銀髮族',
    '企業決策者',
    '技術愛好者',
    '健康意識高的人',
    '購物愛好者',
    '投資者',
  ];

  const lengthOptions = ['簡短', '中等', '詳細'];

  const emotionOptions = [
    '好奇',
    '驚訝',
    '信任',
    '喜悅',
    '急迫',
    '恐懼',
    '憂慮',
    '安心',
    '成就感',
    '獨特',
    '專業',
    '親切',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!keyword) {
      alert('請輸入關鍵詞');
      return;
    }

    setIsLoading(true);

    try {
      // 模擬API調用
      setTimeout(() => {
        // 生成10個標題
        const generatedTitles = [
          `${emotion || '專業'}指南：掌握${keyword}的${audience || '專業人士'}必知技巧`,
          `${length === '簡短' ? '' : `${industry || '行業'}`}${keyword}：${audience || '用戶'}不可錯過的${Math.floor(Math.random() * 7) + 3}個關鍵點`,
          `如何在${industry || '您的領域'}中有效運用${keyword}${length === '詳細' ? '並獲得顯著成果' : ''}`,
          `${length === '簡短' ? '' : '2023年'}${keyword}最佳實踐：為${audience || '您'}帶來${emotion || '卓越'}體驗`,
          `揭秘：${industry || '頂尖'}專家的${keyword}祕訣${length === '簡短' ? '' : '與策略'}`,
          `${keyword}完全攻略：從入門到精通的${length === '簡短' ? '指南' : '全面解析'}`,
          `為什麼${audience || '大多數人'}在${keyword}上失敗？避開這些常見錯誤`,
          `${emotion || '驚人'}的${keyword}：改變${audience || '您'}${industry || '工作'}方式的創新方法`,
          `${length === '簡短' ? '' : '深度分析：'}${keyword}如何革新${industry || '您的行業'}${length === '詳細' ? '並創造新價值' : ''}`,
          `${emotion || '實用'}的${keyword}秘訣：${audience || '專業人士'}的必備工具箱`,
        ];

        setTitles(generatedTitles);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('生成標題時出錯:', error);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼板');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          SEO 標題生成器
        </h3>
        <p className="text-gray-600">
          輸入您的關鍵詞和內容信息，生成高效吸引人的 SEO 優化標題。
          好的標題能提高點擊率並改善搜索排名。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              主要關鍵詞 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="例如：SEO優化、社群行銷、內容創作"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                行業領域
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
              >
                <option value="">請選擇行業領域</option>
                {industryOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                目標受眾
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                value={audience}
                onChange={e => setAudience(e.target.value)}
              >
                <option value="">請選擇目標受眾</option>
                {audienceOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                標題長度
              </label>
              <div className="flex space-x-2">
                {lengthOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    className={`flex-1 rounded-md border px-4 py-2 ${
                      length === option
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setLength(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                情感觸發
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                value={emotion}
                onChange={e => setEmotion(e.target.value)}
              >
                <option value="">請選擇情感觸發</option>
                {emotionOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-all ${
              isLoading
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <SendHorizonal size={18} />
                <span>生成標題</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {titles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
        >
          <div className="mb-4 flex items-center">
            <Type className="mr-2 h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-medium text-blue-800">標題建議</h4>
          </div>

          <div className="space-y-3">
            {titles.map((title, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-3 transition-all hover:shadow-sm"
              >
                <p className="flex-1 text-gray-800">{title}</p>
                <button
                  onClick={() => copyToClipboard(title)}
                  className="ml-2 rounded-md p-2 text-blue-600 hover:bg-blue-50"
                >
                  複製
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-blue-700">
            提示：這些標題已針對搜尋引擎和使用者體驗優化，包含您的關鍵詞和情感觸發因素。
          </div>
        </motion.div>
      )}
    </div>
  );
}
