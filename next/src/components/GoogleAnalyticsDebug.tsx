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
      window.gtag = function (...args: any[]) {
        // 記錄事件
        const event: GAEvent = {
          timestamp: new Date().toLocaleTimeString(),
          type: args[0],
          data: args.slice(1),
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
        <div className="absolute bottom-12 right-0 max-h-96 w-96 overflow-y-auto rounded-lg border bg-white shadow-xl">
          <div className="rounded-t-lg bg-blue-600 p-3 text-white">
            <h3 className="font-semibold">Google Analytics 事件追蹤</h3>
            <p className="text-sm opacity-90">當前頁面: {pathname}</p>
          </div>

          <div className="space-y-2 p-3">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">尚無 GA 事件</p>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="rounded border-l-4 border-blue-400 bg-gray-50 py-2 pl-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">{event.type}</span>
                    <span className="text-xs text-gray-500">
                      {event.timestamp}
                    </span>
                  </div>
                  <pre className="mt-1 overflow-x-auto text-xs text-gray-600">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>

          <div className="rounded-b-lg border-t bg-gray-50 p-3">
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
