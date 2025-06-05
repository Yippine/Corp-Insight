import { Metadata } from 'next';
import { staticTitles } from '@/config/pageTitles';

export const metadata: Metadata = {
  title: staticTitles.privacy,
  description:
    '了解企業放大鏡的資料來源聲明與資料使用政策，確保您的數據安全與隱私。',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
