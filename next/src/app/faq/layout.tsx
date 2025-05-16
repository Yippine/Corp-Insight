import { Metadata } from 'next';
import { staticTitles } from '@/config/pageTitles';

export const metadata: Metadata = {
  title: staticTitles.faq,
  description: '查看關於企業放大鏡的常見問題與解答，了解如何更有效地使用我們的平台。',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}