'use client';

import { useState, useCallback } from 'react';

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
export function useGeminiStream(options?: UseGeminiStreamOptions): GeminiStreamResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  const generate = useCallback(async (prompt: string) => {
    reset();
    setIsLoading(true);

    try {
      setIsLoading(true);
      setError(null);
      setResult(''); // <-- 1. 開始時立刻清空上次結果

      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: 'API 請求失敗，無法解析錯誤訊息。' }));
        throw new Error(errorData.error || 'API 請求失敗');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        // 2. 每收到一個片段，就立刻附加到現有結果上，觸發UI更新
        setResult(prevResult => prevResult + chunk);
      }

      options?.onSuccess?.(result || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '發生未知錯誤';
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      options?.onFinally?.();
    }
  }, [options, reset]);

  return { isLoading, error, result, generate, reset };
}