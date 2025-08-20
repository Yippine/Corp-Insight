'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * OAuth 錯誤處理頁面
 * 
 * 根據故事 1.1 要求：
 * - OAuth 錯誤處理機制正常運作
 * - 處理網路錯誤、認證失敗等情況
 * - 提供使用者友善的錯誤訊息
 */

// 錯誤類型對應的訊息
const ERROR_MESSAGES = {
  Configuration: '伺服器配置錯誤，請聯絡管理員',
  AccessDenied: '存取被拒絕，您沒有權限登入此應用程式',
  Verification: '驗證失敗，請稍後再試',
  Default: '登入過程中發生未知錯誤，請稍後再試',
  OAuthSignin: '啟動 OAuth 登入時發生錯誤',
  OAuthCallback: 'OAuth 回調處理失敗',
  OAuthCreateAccount: '建立帳號時發生錯誤',
  EmailCreateAccount: '建立電子郵件帳號時發生錯誤',
  Callback: '回調處理失敗',
  OAuthAccountNotLinked: '此電子郵件已經與其他帳號連結',
  EmailSignin: '無法發送登入電子郵件',
  CredentialsSignin: '憑證登入失敗，請檢查您的登入資訊',
  SessionRequired: '需要登入才能存取此頁面',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as keyof typeof ERROR_MESSAGES;
  
  const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 錯誤圖示 */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登入失敗
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>

        {/* 錯誤詳情 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">
              <strong>錯誤代碼:</strong> {error}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="mt-8 space-y-4">
          <Link href="/auth/signin">
            <Button variant="default" size="lg" className="w-full">
              重新登入
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              回到首頁
            </Button>
          </Link>
        </div>

        {/* 說明文字 */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            如果問題持續發生，請聯絡
            <a 
              href={`mailto:${process.env.NEXT_PUBLIC_DEVELOPER_EMAIL}`}
              className="text-blue-600 hover:text-blue-500 mx-1"
            >
              技術支援
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">載入中...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}