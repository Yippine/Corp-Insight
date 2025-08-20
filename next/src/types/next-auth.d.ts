/**
 * NextAuth.js TypeScript 型別擴展
 * 
 * 為了支援自訂的 session 和 JWT 屬性
 */
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    provider?: string;
    providerAccountId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    providerAccountId?: string;
  }
}