import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// 提醒：請將 line-qr-code.png 圖片檔放在對應專案的 public 目錄下
// Next.js: /public/images/line-qr-code.png
// Legacy:  /public/line-qr-code.png

const LineBotBanner = () => {
  const lineBotUrl = 'https://line.me/R/ti/p/@818hpqgh';
  const qrCodeImageUrl = 'https://qr-official.line.me/gs/M_818hpqgh_GW.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#47d279] to-teal-600 p-6 text-white shadow-2xl md:p-8"
    >
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        {/* 左側：文案與按鈕 */}
        <div className="flex-1 text-center md:text-left">
          <div className="mb-2 flex items-center justify-center md:justify-start">
            <MessageCircle className="mr-2 h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
              AI 保險法規即時問
            </h2>
          </div>
          <p className="mb-4 text-green-100 md:text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            您的 24 小時隨身法規顧問，由 Claude 3.5 Sonnet 強力驅動。
          </p>
          <ul className="mb-6 list-inside list-disc space-y-1 text-left text-base text-green-100 sm:mx-auto sm:w-fit md:mx-0 md:w-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            <li>RAG 技術整合，資訊最新最準確</li>
            <li>無需註冊，打開 LINE 立即可用</li>
            <li>24/7 全天候服務，隨時解答您的疑問</li>
          </ul>
          <motion.a
            href={lineBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-green-600 shadow-lg transition-transform"
          >
            立即加入 LINE 好友
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.a>
        </div>

        {/* 右側：QR Code */}
        <div className="flex-shrink-0 text-center">
          <div className="rounded-lg bg-white p-3 shadow-md">
            <img 
              src={qrCodeImageUrl} 
              alt="保險法規諮詢 Line Bot QR Code" 
              className="h-36 w-36 md:h-40 md:w-40"
            />
          </div>
          <p className="mt-2 text-sm font-medium text-green-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
            掃描 QR Code 開始諮詢
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LineBotBanner;