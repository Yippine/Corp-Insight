'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { generateUrl } from '@/config/site';

export const dynamic = 'force-dynamic';

const REDIRECT_DELAY_SECONDS = 10;

export default function FeedbackSuccessPage() {
  const router = useRouter();
  const [currentHost, setCurrentHost] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState(
    REDIRECT_DELAY_SECONDS
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.host);
    }
  }, []);

  // 決定首頁 URL
  const homeUrl = currentHost.includes('aitools') 
    ? generateUrl('aitools', '/search', currentHost)
    : generateUrl('company', '/company/search', currentHost);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      router.replace(homeUrl);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(secondsRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining, router, homeUrl]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-8 text-center shadow-xl backdrop-blur-lg md:p-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10"
        >
          <CheckCircle className="h-12 w-12 text-green-500" />
        </motion.div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-800 md:text-4xl">
          反饋已成功提交！
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          感謝您的寶貴意見。我們將會儘快處理您的反饋，並在需要時與您聯繫。
        </p>
        <p className="mb-8 text-sm text-gray-500">
          本頁面將在{' '}
          <span className="font-semibold text-blue-600">
            {secondsRemaining}
          </span>{' '}
          秒後自動跳轉至首頁。
        </p>

        <div className="space-y-4">
          <Link href={homeUrl} legacyBehavior>
            <a className="inline-flex w-full transform items-center justify-center rounded-xl border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-md transition-transform duration-150 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              返回首頁
            </a>
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex w-full transform items-center justify-center rounded-xl border border-gray-300 bg-transparent px-8 py-3 text-base font-medium text-gray-700 shadow-sm transition-transform duration-150 hover:scale-105 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
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
