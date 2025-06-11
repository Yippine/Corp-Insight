'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 pt-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.7,
          ease: 'backOut',
          delay: 0.2,
        }}
        className="relative mb-4 flex items-center justify-center"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
        ></div>
        <h1 className="relative bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-[7rem] font-extrabold tracking-tighter text-transparent leading-none">
          404
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-2xl"
      >
        <HeroSection
          title="噢噢！"
          highlightText="頁面迷路了"
          description="您想找的頁面似乎不在這裡，別擔心，讓我們帶您回到正軌。"
          highlightColor="text-indigo-600"
          customPadding="py-4"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8"
      >
        <Link href="/" legacyBehavior>
          <a className="group inline-flex transform items-center justify-center rounded-xl bg-gray-900 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
            <ArrowLeft className="mr-3 h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
            返回首頁
          </a>
        </Link>
      </motion.div>
    </div>
  );
}