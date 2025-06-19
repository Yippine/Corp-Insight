import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '資料庫維運',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}