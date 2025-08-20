import { Suspense } from 'react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

/**
 * 登入頁面
 * 
 * 根據故事 1.1 要求：
 * - 顯示 Google 登入按鈕
 * - 處理登入流程
 * - 提供使用者友善的介面
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 標題區塊 */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {/* Corp-Insight Logo */}
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登入 Corp-Insight
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用您的 Google 帳號快速登入
          </p>
        </div>

        {/* 登入表單區塊 */}
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            {/* Google 登入按鈕 */}
            <Suspense fallback={
              <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse" />
            }>
              <GoogleSignInButton
                fullWidth
                size="lg"
                text="使用 Google 帳號登入"
                callbackUrl="/"
              />
            </Suspense>
          </div>

          {/* 說明文字 */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              登入即表示您同意我們的
              <a href="/privacy" className="text-blue-600 hover:text-blue-500 mx-1">
                隱私權政策
              </a>
              和
              <a href="/terms" className="text-blue-600 hover:text-blue-500 mx-1">
                使用條款
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}