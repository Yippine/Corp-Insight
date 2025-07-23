import { NextResponse } from 'next/server';
import { generateOptimizedPrompt } from '@/lib/gemini.server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      currentPromptData,
      philosophy,
      framework,
      toolId
    } = body;

    // 將所有業務邏輯委託給 gemini.server 模組
    const optimizedText = await generateOptimizedPrompt(
      type,
      currentPromptData,
      philosophy,
      framework,
      toolId
    );

    // --- 在後端印出最終生成的優化提示詞，方便除錯 ---
    console.log('🚀 --- [Prompt Optimizer] 最終生成的優化提示詞 --- 🚀');
    console.log(optimizedText);
    console.log('----------------------------------------------------');
    // --- 結束 ---

    // 返回純文字結果
    return new Response(optimizedText.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('[/api/prompt/optimize] Error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to optimize prompt', details: errorMessage }, { status: 500 });
  }
}
