import { Metadata } from 'next';
import { staticTitles } from '@/config/pageTitles';

export const metadata: Metadata = {
  title: staticTitles.feedback,
  description: '提供您的寶貴意見和建議，幫助我們改進企業放大鏡平台的服務品質。',
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
