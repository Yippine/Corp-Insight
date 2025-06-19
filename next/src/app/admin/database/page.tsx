'use client';

import React from 'react';
import DatabaseConsole from '@/components/admin/DatabaseConsole';
import { Suspense } from 'react';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

export default function DatabaseOperationsPage() {
  return (
    <Suspense fallback={<InlineLoading />}>
      <DatabaseConsole />
    </Suspense>
  );
}