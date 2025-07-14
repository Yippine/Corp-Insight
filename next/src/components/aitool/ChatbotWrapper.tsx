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
    const isAiToolPage = pathname.startsWith('/aitool');
    setShouldRender(isAiToolPage);
  }, [pathname]);

  if (!shouldRender) return null;

  return <ChatbotWidget />;
};

export default ChatbotWrapper;
