import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '常見問題 - Business Magnifier',
  description: '關於 Business Magnifier 企業搜尋、標案查詢、AI 工具等功能的常見問題解答。免費使用，無次數限制，資料來源可靠。',
  keywords: ['常見問題', 'FAQ', '企業搜尋', '標案查詢', 'AI工具', '使用說明', '免費服務'],
  openGraph: {
    title: '常見問題 - Business Magnifier',
    description: '關於 Business Magnifier 企業搜尋、標案查詢、AI 工具等功能的常見問題解答',
    type: 'website',
  },
};

export default function FAQPage() {
  return <FAQContent />;
}
