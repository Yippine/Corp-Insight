'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const REDIRECT_DELAY_SECONDS = 10;

export default function FeedbackSuccessPage() {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      router.replace('/'); // 使用 replace 避免返回此頁面
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(secondsRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer); 
  }, [secondsRemaining, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-lg w-full border border-white/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto mb-6 flex items-center justify-center h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30"
        >
          <CheckCircle className="h-12 w-12 text-green-500" />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-4">
          反饋已成功提交！
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          感謝您的寶貴意見。我們將會儘快處理您的反饋，並在需要時與您聯繫。
        </p>
        <p className="text-gray-500 text-sm mb-8">
          本頁面將在 <span className="font-semibold text-blue-600">{secondsRemaining}</span> 秒後自動跳轉至首頁。
        </p>
        
        <div className="space-y-4">
          <Link href="/" legacyBehavior>
            <a className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 duration-150">
              返回首頁
            </a>
          </Link>
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 duration-150"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回上一頁
          </button>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          若長時間未收到回覆，請檢查您的垃圾郵件匣或直接與我們聯繫。
        </p>
      </motion.div>
    </div>
  );
} 