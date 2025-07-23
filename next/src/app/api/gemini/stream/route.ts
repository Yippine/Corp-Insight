import { streamGenerateContent } from '@/lib/gemini.server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // 確保這個路由在 Node.js 環境運行

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse(JSON.stringify({ error: '請求中缺少 Prompt 參數' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 在後端印出最終收到的提示詞，方便除錯 ---
    console.log('🚀 --- [AI Tool Generation] 最終發送的完整提示詞 --- 🚀');
    console.log(prompt);
    console.log('----------------------------------------------------');
    // --- 結束 ---

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 定義 onStream 回調，將收到的數據塊以 Server-Sent Events (SSE) 格式推入流中
          const onStream = (text: string) => {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          };

          // 呼叫伺服器端的 streamGenerateContent
          await streamGenerateContent(prompt, onStream, true);

          // 當內容生成完畢，發送一個結束信號，告知前端可以關閉連接
          controller.enqueue(`data: ${JSON.stringify({ event: 'close' })}\n\n`);
          controller.close();
        } catch (error) {
          console.error('[API 路由] 內容生成時發生錯誤：', error);
          const encoder = new TextEncoder();
          const errorMessage = error instanceof Error ? error.message : '處理請求時發生未知錯誤。';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[API 路由] 無效的請求：', error);
    return new NextResponse(JSON.stringify({ error: '無效的請求內容' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
