'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// 動態導入聊天機器人組件，避免在服務器端渲染
const ChatbotWidget = dynamic(() => import('./ChatbotWidget'), {
  ssr: false,
});

const ChatbotWrapper = () => {
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // 只在 AI 工具相關頁面顯示聊天機器人
    // 支援不同環境的路由格式：
    // - 開發環境: /aitool/search, /aitool/detail
    // - 正式環境: /search, /detail
    const isAiToolPage = pathname.startsWith('/aitool') || 
                        pathname.startsWith('/search') || 
                        pathname.startsWith('/detail');
    setShouldRender(isAiToolPage);
  }, [pathname]);

  if (!shouldRender) return null;

  return <ChatbotWidget />;
};

export default ChatbotWrapper;
