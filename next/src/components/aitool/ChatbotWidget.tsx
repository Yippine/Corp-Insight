'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // 添加 useEffect 來監控狀態變化
  useEffect(() => {
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // 監控 iframe 的載入狀態
  const handleIframeLoad = () => {
  };

  const handleIframeError = (error: any) => {
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: '60px' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: isMinimized ? '60px' : '600px',
              width: isMinimized ? '300px' : '400px'
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* 標題列 */}
            <div className="flex h-[60px] items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
              <div className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-white" />
                <h3 className="text-lg font-medium text-white">快速查找適合的AI工具</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="rounded-full p-1 text-white hover:bg-blue-500 transition-colors"
                  title={isMinimized ? "展開視窗" : "縮小視窗"}
                >
                  {isMinimized ? <Maximize size={18} /> : <Minimize size={18} />}
                </button>
                <button
                  onClick={closeChat}
                  className="rounded-full p-1 text-white hover:bg-blue-500 transition-colors"
                  title="關閉聊天視窗"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div 
              className="relative w-full" 
              style={{ height: 'calc(100% - 60px)' }}
              ref={(el) => {
                if (el) {
                }
              }}
            >
              <iframe
                src="https://kmgpt.leopilot.com/chat/share?shared_id=0d6127e85d5a11f0a1450242ac130006&from=agent&auth=UwMjUzMzM2NTcxZTExZjBhMTIwMDI0Mm&visible_avatar=1&locale=zh-TRADITIONAL"
                className={`absolute inset-0 w-full h-full transition-all duration-300 ${
                  isMinimized 
                    ? 'invisible opacity-0 pointer-events-none' 
                    : 'visible opacity-100 pointer-events-auto'
                }`}
                frameBorder="0"
                title="聊天機器人"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'block'
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                ref={(iframe) => {
                  if (iframe) {

                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮動按鈕 */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default ChatbotWidget;
