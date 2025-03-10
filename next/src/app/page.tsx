import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '企業資訊搜尋平台 | Business Magnifier',
  description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
  keywords: ['企業查詢', '標案資訊', '企業資料', '商業情報'],
  openGraph: {
    title: '企業資訊搜尋平台 | Business Magnifier',
    description: '專業的企業資訊查詢平台，提供最新、最全面的台灣企業和標案資料',
    type: 'website',
    url: 'https://yourdomain.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function Home() {
  return (
    <main>
      <h1>Business Magnifier - 企業資訊搜尋平台</h1>
      <section>
        <h2>最新企業資訊</h2>
        <p>快速、準確地查詢台灣企業資料</p>
      </section>
      <section>
        <h2>標案查詢</h2>
        <p>即時掌握最新標案資訊</p>
      </section>
      <section>
        <h2>AI 智能助理</h2>
        <p>智能推薦，精準分析</p>
      </section>
    </main>
  );
}