import { NextResponse } from 'next/server';
import { streamGenerateContent } from '@/lib/gemini.server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt = '你好' } = body;

    let usedKeyIdentifier: string | null = null;
    let fullResponse = '';
    let streamError: any = null;

    // 我們需要一種方法從 streamGenerateContent 中獲取最終使用的 keyIdentifier。
    // 這裡我們建立一個 Promise，並將其 resolver 傳遞給一個自定義的 onStream 處理器。
    const keyCapturePromise = new Promise<void>((resolve) => {
      const onStream = (text: string) => {
        // 我們將 keyIdentifier 作為串流的第一個特殊訊息來傳遞
        if (text.startsWith('KEY_USED:')) {
          usedKeyIdentifier = text.replace('KEY_USED:', '');
        } else {
          // 正常累積最終的回應文本
          fullResponse = text;
        }
      };

      // 執行 streamGenerateContent，並在完成時 resolve promise
      streamGenerateContent(prompt, onStream, false)
        .then(() => resolve())
        .catch(e => {
            streamError = e;
            console.error("Test API - streamGenerateContent Error:", e);
            resolve(); // 即使串流過程出錯，也要 resolve promise 以繼續流程
        });
    });

    // 等待串流處理完成
    await keyCapturePromise;

    if (streamError) {
      return NextResponse.json(
        { success: false, error: `Stream execution failed: ${streamError.message}` },
        { status: 500 }
      );
    }
    
    if (!usedKeyIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Failed to determine used key. The stream may have failed before a key was selected.', fullResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, usedKey: usedKeyIdentifier });

  } catch (error: any) {
    console.error('[API_TEST_GEMINI_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}