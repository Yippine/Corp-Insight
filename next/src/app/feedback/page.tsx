import { Suspense } from 'react';
import FeedbackForm from './FeedbackForm';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { Metadata } from 'next';
import { staticTitles } from '@/config/pageTitles';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: staticTitles.feedback,
  description: '提供您寶貴的意見回饋，無論是功能建議、系統問題、業務合作或資料勘誤，我們都非常重視。您的聲音是我們進步的動力。',
};

export default function FeedbackPage() {
  return (
    <Suspense fallback={<InlineLoading />}>
      <FeedbackForm />
    </Suspense>
  );
}
