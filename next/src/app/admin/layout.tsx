import React from 'react';
import type { Metadata } from 'next';
import { staticTitles } from '@/config/pageTitles';

export const metadata: Metadata = {
  title: staticTitles.adminTemplate,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <main>{children}</main>
    </div>
  );
}