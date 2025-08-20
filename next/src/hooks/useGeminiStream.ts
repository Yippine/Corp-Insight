'use client';

import { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { SITE_CONFIG } from '@/config/site';

interface UseGeminiStreamOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

interface GeminiStreamResult {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  generate: (prompt: string) => Promise<void>;
  reset: () => void;
}

/**
 * 用於與後端 Gemini 串流 API 互動的 React Hook。
 * 封裝了請求、串流處理、狀態管理 (載入中、錯誤、結果) 的所有邏輯。
 *
 * @param {UseGeminiStreamOptions} options - 可選的回調函式。
 * @returns {GeminiStreamResult} - 包含狀態和控制函式的物件。
 *
 * @example
 * const { isLoading, error, result, generate } = useGeminiStream();
 * // ...
 * <button onClick={() => generate('你好嗎？')} disabled={isLoading}>
 *   {isLoading ? '生成中...' : '開始生成'}
 * </button>
 * {error && <p>錯誤：{error}</p>}
 * {result && <pre>{result}</pre>}
 */
export function useGeminiStream(
  options?: UseGeminiStreamOptions
): GeminiStreamResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  const generate = useCallback(
    async (prompt: string) => {
      reset();
      setIsLoading(true);

      try {
        setResult(''); // 從一個空字串開始

        // 檢查是否為本地測試環境
        const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true';

        // 檢查當前是否在 aitools 域名下（非本地測試時）
        const apiUrl =
          !isLocalProd &&
          typeof window !== 'undefined' &&
          window.location.host.includes('aitools.leopilot.com')
            ? `${SITE_CONFIG.main.domain}/api/gemini/stream`
            : '/api/gemini/stream';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok || !response.body) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'API 請求失敗，無法解析錯誤訊息。' }));
          throw new Error(errorData.error || 'API 請求失敗');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // 在串流結束時處理緩衝區中剩餘的任何數據
            if (buffer) {
              console.error('串流意外終止，剩餘緩衝區內容：', buffer);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          // 一個 SSE 訊息以兩個換行符結尾
          const lines = buffer.split('\n\n');

          // 保留最後一個可能不完整的訊息在緩衝區中
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonString = line.substring(5).trim();
              if (!jsonString) continue;

              try {
                const data = JSON.parse(jsonString);

                if (data.text) {
                  // 強制同步更新，打破 React 18 的自動批次處理
                  flushSync(() => {
                    setResult(prev => (prev || '') + data.text);
                  });
                } else if (data.event === 'close') {
                  console.log('[SSE] 收到關閉事件，串流結束。');
                  // 這裡可以選擇性地觸發一些 UI 行為
                } else if (data.error) {
                  console.error('[SSE] 收到錯誤事件', data.error);
                  setError(prev =>
                    prev ? `${prev}\n${data.error}` : data.error
                  );
                }
              } catch (e) {
                console.error('無法解析收到的 SSE 數據塊：', jsonString, e);
              }
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '發生未知錯誤';
        setError(errorMessage);
        options?.onError?.(errorMessage);
      } finally {
        setIsLoading(false);
        options?.onFinally?.();
      }
    },
    [options, reset]
  );

  return { isLoading, error, result, generate, reset };
}
