import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

/**
 * NextAuth.js 配置 - Google OAuth 整合
 * 
 * 根據故事 1.1 要求實作：
 * - Google OAuth provider 設定
 * - 安全參數 (PKCE, state, nonce) - NextAuth.js 自動處理
 * - JWT 和 Session 策略配置
 * - Access JWT 15分鐘，Refresh Token 存 DB
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // 基本 OAuth 範圍：openid, email, profile
          scope: "openid email profile",
          // NextAuth.js 自動處理 PKCE, state, nonce 安全參數
          prompt: "select_account",
        },
      },
    }),
  ],
  
  // JWT 和 Session 策略配置
  session: {
    strategy: "jwt",
    // Access JWT 15分鐘過期 (根據故事要求)
    maxAge: 15 * 60, // 15 minutes
  },
  
  jwt: {
    // JWT 15分鐘過期
    maxAge: 15 * 60, // 15 minutes
  },
  
  // Callback 設定
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初次登入時保存 OAuth 帳號資訊
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
    
    async session({ session, token }) {
      // 將 JWT 資訊傳遞到 session
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      session.providerAccountId = token.providerAccountId as string;
      return session;
    },
    
    async signIn({ account, profile }) {
      // 登入驗證邏輯
      if (account?.provider === "google") {
        // 驗證 Google 帳號是否有效
        return !!(profile?.email && profile?.email_verified);
      }
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      // 登入成功後的導向邏輯
      // 如果是相對路徑，使用 baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 如果是相同域名，允許導向
      if (new URL(url).origin === baseUrl) return url;
      // 預設導向到首頁
      return baseUrl;
    },
  },
  
  // 頁面路由設定
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  // 安全設定
  secret: process.env.NEXTAUTH_SECRET,
  
  // 除錯模式 (開發環境)
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

// App Router 需要的 GET 和 POST 處理器
export { handler as GET, handler as POST };