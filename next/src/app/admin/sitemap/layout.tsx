import React from 'react';
import type { Metadata } from 'next';
import { SITEMAP_ADMIN_TITLE } from '@/config/pageTitles';

export const metadata: Metadata = {
  title: SITEMAP_ADMIN_TITLE,
};

export default function SitemapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 