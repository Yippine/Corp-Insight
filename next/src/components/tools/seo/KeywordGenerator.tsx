'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SendHorizonal, Download, Copy } from 'lucide-react';

export default function KeywordGenerator() {
  const [mainKeyword, setMainKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [intent, setIntent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<{ keyword: string; difficulty: number; volume: number; }[]>([]);

  const industryOptions = [
    '電子商務', '科技', '健康醫療', '教育', '金融', '房地產', 
    '旅遊', '食品餐飲', '美容時尚', '家居園藝', '藝術娛樂', '運動健身'
  ];
  
  const intentOptions = [
    '信息查詢', '購買意圖', '比較研究', '問題解決'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!mainKeyword) {
      alert('請輸入主要關鍵詞');
      return;
    }

    setIsLoading(true);
    setKeywords([]);
    
    try {
      // 模擬API調用
      setTimeout(() => {
        // 生成關鍵詞
        const generatedKeywords = [
          {
            keyword: `最佳${mainKeyword}`,
            difficulty: Math.floor(Math.random() * 40) + 20,
            volume: Math.floor(Math.random() * 5000) + 1000,
          },
          {
            keyword: `${mainKeyword}推薦`,
            difficulty: Math.floor(Math.random() * 40) + 10,
            volume: Math.floor(Math.random() * 3000) + 500,
          },
          {
            keyword: `${mainKeyword}${intent === '購買意圖' ? '價格' : '教學'}`,
            difficulty: Math.floor(Math.random() * 30) + 10,
            volume: Math.floor(Math.random() * 2000) + 300,
          },
          {
            keyword: `${industry || '台灣'}${mainKeyword}`,
            difficulty: Math.floor(Math.random() * 20) + 5,
            volume: Math.floor(Math.random() * 1000) + 100,
          },
          {
            keyword: `${mainKeyword}${intent === '問題解決' ? '方法' : '比較'}`,
            difficulty: Math.floor(Math.random() * 30) + 15,
            volume: Math.floor(Math.random() * 1500) + 200,
          },
          {
            keyword: `免費${mainKeyword}`,
            difficulty: Math.floor(Math.random() * 50) + 20,
            volume: Math.floor(Math.random() * 4000) + 1000,
          },
          {
            keyword: `${mainKeyword}${intent === '比較研究' ? '排名' : '指南'}`,
            difficulty: Math.floor(Math.random() * 25) + 15,
            volume: Math.floor(Math.random() * 1200) + 300,
          },
          {
            keyword: `${mainKeyword}${industry ? `適合${industry}` : '入門'}`,
            difficulty: Math.floor(Math.random() * 15) + 5,
            volume: Math.floor(Math.random() * 800) + 50,
          }
        ];
        
        // 按搜索量排序
        generatedKeywords.sort((a, b) => b.volume - a.volume);
        
        setKeywords(generatedKeywords);
        setIsLoading(false);
      }, 1800);
    } catch (error) {
      console.error('生成關鍵詞時出錯:', error);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼板');
  };

  const exportToCSV = () => {
    if (keywords.length === 0) return;
    
    const csvContent = 
      "關鍵詞,競爭難度,月搜索量\n" + 
      keywords.map(k => `"${k.keyword}",${k.difficulty},${k.volume}`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${mainKeyword}-關鍵詞.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 根據競爭難度返回顏色
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 20) return 'text-green-600 bg-green-50';
    if (difficulty < 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          長尾關鍵詞生成器
        </h3>
        <p className="text-gray-600">
          發掘高轉化率的長尾關鍵詞，降低競爭難度，提高排名機會。
          長尾關鍵詞雖有較少搜索量，但往往具有更高的轉化率。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主要關鍵詞 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：瑜伽墊、程式語言、股票投資"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                行業領域
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">請選擇行業領域（可選）</option>
                {industryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索意圖
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              >
                <option value="">請選擇搜索意圖（可選）</option>
                {intentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
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
                <span>生成關鍵詞</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Search className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-lg font-medium text-blue-800">長尾關鍵詞建議</h4>
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-1.5 bg-white border border-blue-300 rounded-md text-blue-600 text-sm hover:bg-blue-50"
            >
              <Download size={16} className="mr-1" />
              導出CSV
            </button>
          </div>

          <div className="bg-white rounded-lg border border-blue-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    關鍵詞
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    競爭難度
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    月搜索量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keywords.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.keyword}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.volume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => copyToClipboard(item.keyword)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Copy size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-blue-700">
            <p className="font-medium">提示：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>競爭難度越低（綠色），排名機會越高</li>
              <li>關注月搜索量在100-1000之間的關鍵詞，它們往往是最佳的長尾關鍵詞</li>
              <li>將這些關鍵詞自然地融入您的內容，尤其是在標題、小標題和首段</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}