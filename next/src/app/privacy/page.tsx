import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';
import { staticTitles } from '@/config/pageTitles';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: staticTitles.privacy,
  description: 'Business Magnifier 資料來源聲明，包含台灣公司資料、政府電子採購網、標案瀏覽等公開資訊來源說明。',
  keywords: ['資料來源', '隱私政策', '資料聲明', '政府公開資料', '企業資料', '標案資料'],
  openGraph: {
    title: '資料來源聲明 - Business Magnifier',
    description: 'Business Magnifier 資料來源聲明，包含台灣公司資料、政府電子採購網、標案瀏覽等公開資訊來源說明',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
