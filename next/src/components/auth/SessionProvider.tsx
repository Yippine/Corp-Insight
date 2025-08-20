'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

/**
 * NextAuth.js Session Provider 包裝器
 * 
 * 為整個應用程式提供 NextAuth.js session 上下文
 */
interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function SessionProvider({
  children,
  session,
}: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}