'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

/**
 * NextAuth.js 整合測試頁面
 * 
 * 用於驗證：
 * 1. NextAuth 配置是否正確
 * 2. Google OAuth 流程是否正常
 * 3. Session 管理是否運作
 * 4. 登入登出功能
 */
export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runBasicTests = () => {
    addTestResult('開始基本測試...');
    
    // 測試環境變數
    const hasClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                        (typeof window !== 'undefined' && window.location.origin === 'http://localhost:3000');
    addTestResult(`Google Client ID 配置: ${hasClientId ? '✅ 正常' : '❌ 缺少'}`);
    
    // 測試 NextAuth URL
    const nextAuthUrl = process.env.NEXTAUTH_URL || 
                        (typeof window !== 'undefined' && window.location.origin);
    addTestResult(`NextAuth URL: ${nextAuthUrl}`);
    
    // 測試 Session Provider
    addTestResult(`Session Provider: ${status !== undefined ? '✅ 正常載入' : '❌ 未載入'}`);
    
    // 測試 Session 狀態
    addTestResult(`Session 狀態: ${status}`);
    
    if (session) {
      addTestResult(`使用者資訊: ${session.user?.name} (${session.user?.email})`);
      addTestResult(`Provider: ${session.provider || 'N/A'}`);
    }
    
    addTestResult('基本測試完成');
  };

  const testSignOut = async () => {
    try {
      addTestResult('開始登出測試...');
      await signOut({ redirect: false });
      addTestResult('✅ 登出成功');
    } catch (error) {
      addTestResult(`❌ 登出失敗: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            NextAuth.js 整合測試
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Story 1.1: Google OAuth 基礎設定與 NextAuth.js 整合驗證
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：當前狀態 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">目前登入狀態</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">狀態：</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs rounded-full ${
                  status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'authenticated' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status === 'loading' ? '載入中...' :
                   status === 'authenticated' ? '已登入' : '未登入'}
                </span>
              </div>

              {session && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-700">使用者：</span>
                    <span className="ml-2 text-sm text-gray-900">{session.user?.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email：</span>
                    <span className="ml-2 text-sm text-gray-900">{session.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Provider：</span>
                    <span className="ml-2 text-sm text-gray-900">{session.provider || 'Google'}</span>
                  </div>
                  {session.user?.image && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">頭像：</span>
                      <img 
                        src={session.user.image} 
                        alt="User Avatar" 
                        className="ml-2 inline-block w-8 h-8 rounded-full"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 操作按鈕 */}
            <div className="mt-6 space-y-3">
              {status === 'authenticated' ? (
                <Button 
                  onClick={testSignOut}
                  variant="destructive" 
                  className="w-full"
                >
                  登出
                </Button>
              ) : (
                <GoogleSignInButton 
                  fullWidth 
                  text="Google 登入測試"
                  callbackUrl="/auth/test"
                />
              )}
              
              <Button 
                onClick={runBasicTests}
                variant="outline" 
                className="w-full"
              >
                執行基本測試
              </Button>
            </div>
          </div>

          {/* 右側：測試結果 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">測試結果</h2>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">點選「執行基本測試」開始驗證...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
            
            {testResults.length > 0 && (
              <Button 
                onClick={() => setTestResults([])}
                variant="outline" 
                size="sm"
                className="mt-4"
              >
                清除結果
              </Button>
            )}
          </div>
        </div>

        {/* 底部說明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">測試說明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 點選「Google 登入測試」來測試 OAuth 流程</li>
            <li>• 登入成功後會顯示使用者資訊</li>
            <li>• 點選「執行基本測試」檢查配置狀態</li>
            <li>• 點選「登出」測試登出功能</li>
          </ul>
        </div>
      </div>
    </div>
  );
}