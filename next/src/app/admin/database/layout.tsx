import React from 'react';
import type { Metadata } from 'next';
import { DATABASE_ADMIN_TITLE } from '@/config/pageTitles';

export const metadata: Metadata = {
  title: DATABASE_ADMIN_TITLE,
};

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}