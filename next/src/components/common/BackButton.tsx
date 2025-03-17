'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface BackButtonProps {
  buttonText?: string;
  sessionKey?: string;
  returnPath: string;
  className?: string;
}

export default function BackButton({
  returnPath,
  sessionKey,
  buttonText = '返回搜尋結果',
  className = "inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
}: BackButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleBack = () => {
    if (sessionKey) {
      // 如果提供了sessionKey，嘗試從sessionStorage中獲取搜索參數
      try {
        const savedSearch = sessionStorage.getItem(sessionKey);
        
        // 使用Next.js的路由導航到指定路徑並帶上查詢參數
        router.push(`${returnPath}${savedSearch ? `?${savedSearch}` : ''}`);
        
        // 可以在這裡添加分析跟踪代碼
        // trackBackButtonClick(window.location.pathname);
      } catch (error) {
        console.error('無法訪問sessionStorage:', error);
        router.push(returnPath);
      }
    } else {
      // 如果沒有提供sessionKey，直接導航到returnPath
      router.push(returnPath);
    }
  };

  // 如果使用Link元件，適合靜態導航或SEO更友好的場景
  if (!sessionKey) {
    return (
      <Link href={returnPath} className={className}>
        <X className="w-5 h-5 mr-2" />
        {buttonText}
      </Link>
    );
  }

  // 使用button元件，適合需要保存狀態的場景
  return (
    <button onClick={handleBack} className={className}>
      <X className="w-5 h-5 mr-2" />
      {buttonText}
    </button>
  );
} 