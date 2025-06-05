'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GAEvent {
  timestamp: string;
  type: string;
  data: any;
}

export default function GoogleAnalyticsDebug() {
  const [events, setEvents] = useState<GAEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 只在開發環境顯示
    if (process.env.NODE_ENV !== 'development') return;

    // 監聽 GA 事件
    const originalGtag = window.gtag;
    if (originalGtag) {
      window.gtag = function(...args: any[]) {
        // 記錄事件
        const event: GAEvent = {
          timestamp: new Date().toLocaleTimeString(),
          type: args[0],
          data: args.slice(1)
        };
        
        setEvents(prev => [event, ...prev.slice(0, 9)]); // 保留最新10個事件
        
        // 調用原始 gtag
        return originalGtag.apply(window, args);
      };
    }

    return () => {
      if (originalGtag) {
        window.gtag = originalGtag;
      }
    };
  }, []);

  // 只在開發環境顯示
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-700"
      >
        GA Debug ({events.length})
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 overflow-y-auto rounded-lg bg-white border shadow-xl">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg">
            <h3 className="font-semibold">Google Analytics 事件追蹤</h3>
            <p className="text-sm opacity-90">當前頁面: {pathname}</p>
          </div>
          
          <div className="p-3 space-y-2">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">尚無 GA 事件</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="border-l-4 border-blue-400 pl-3 py-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{event.type}</span>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={() => setEvents([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              清除記錄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}