'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Google 登入按鈕元件
 * 
 * 根據故事 1.1 要求：
 * - 基本的 Google 登入按鈕顯示
 * - 含載入狀態與視覺回饋
 * - 整合 NextAuth signIn 功能
 * - 登入成功後的導向邏輯
 */
interface GoogleSignInButtonProps {
  /** 登入成功後的導向 URL，預設為首頁 */
  callbackUrl?: string;
  /** 按鈕文字，預設為「使用 Google 帳號登入」 */
  text?: string;
  /** 按鈕樣式變體 */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** 按鈕大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** 是否為全寬度按鈕 */
  fullWidth?: boolean;
}

export default function GoogleSignInButton({
  callbackUrl = '/',
  text = '使用 Google 帳號登入',
  variant = 'outline',
  size = 'default',
  fullWidth = false,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // 發起 Google OAuth 登入
      await signIn('google', {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Google 登入失敗:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`
        flex items-center justify-center gap-3
        ${fullWidth ? 'w-full' : ''}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Google 圖示 */}
      {!isLoading ? (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      )}
      
      {/* 按鈕文字 */}
      <span className="font-medium">
        {isLoading ? '登入中...' : text}
      </span>
    </Button>
  );
}