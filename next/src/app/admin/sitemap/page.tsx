'use client';

import SitemapConsole from '@/components/admin/SitemapConsole';
import { Suspense } from 'react';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

export default function SitemapPage() {
  return (
    <Suspense fallback={<InlineLoading />}>
      <SitemapConsole />
    </Suspense>
  );
}