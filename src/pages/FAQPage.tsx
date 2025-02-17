import { motion } from 'framer-motion';
import { HelpCircle, Search, FileText, Users, Wrench, AlertCircle } from 'lucide-react';

const faqs = [
  {
    id: 'data-source',
    question: '這個網站的資料是從哪裡來的？資料可靠嗎？',
    answer: '我們的資料來自政府公開資訊平台，包含企業登記資料、政府標案資料等公開資訊。雖然我們會定期更新，但由於資料來源的更新頻率不同，可能會有時間差，因此我們主要提供資料檢索服務，不保證資訊的即時性與完整性。',
    icon: HelpCircle
  },
  {
    id: 'service-free',
    question: '使用這個網站需要付費嗎？有使用次數限制嗎？',
    answer: '完全免費！包括企業查詢、標案查詢，甚至是 AI 助理等所有功能都是免費的，而且沒有使用次數限制。我們希望讓每個人都能輕鬆獲取和分析企業資訊。',
    icon: AlertCircle
  },
  {
    id: 'company-search',
    question: '如何使用企業搜尋功能？可以查到哪些資訊？',
    answer: '企業搜尋超級簡單！你可以用公司名稱、統編、負責人姓名，甚至關鍵字來搜尋。搜尋結果會顯示基本資料、財務概況、核心成員和相關標案等資訊，全部分成四個頁籤，讓你一目了然。',
    icon: Search
  },
  {
    id: 'tender-search',
    question: '標案搜尋怎麼用？有什麼特別功能？',
    answer: '標案搜尋有兩種模式：用公司名稱／統編找特定公司的得標紀錄，或用標案名稱/關鍵字搜尋特定標案。每個標案都有詳細資訊，包括基本資料、投標廠商、履約進度等五個分類，方便你快速了解標案內容。',
    icon: FileText
  },
  {
    id: 'tool-search',
    question: 'AI 工具怎麼使用？有哪些功能？',
    answer: '我們的 AI 工具超好用！你可以直接在搜尋框輸入關鍵字，或用標籤篩選找到需要的工具。每個工具都有兩個按鈕：左邊可以直接根據你的問題生成內容，右邊則可以基於現有回答繼續優化或追問，就像跟 AI 助理對話一樣！',
    icon: Wrench
  },
  {
    id: 'data-accuracy',
    question: '發現資料有誤怎麼辦？',
    answer: '如果發現任何資料不準確，請點擊頁尾的「資料勘誤」按鈕回報。我們會認真核實每一筆回報，並盡快更新資料。你的回饋對我們來說非常重要，幫助我們提供更準確的資訊！',
    icon: Users
  }
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          常見問題
        </h1>
        <p className="text-xl text-gray-600">
          有任何疑問？我們在這裡為你解答！
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <faq.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">
          還有其他問題嗎？
          <a href="/feedback" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
            請聯絡我們！
          </a>
        </p>
      </div>
    </div>
  );
}