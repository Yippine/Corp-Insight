import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '';

if (!apiKey) {
  console.warn('Google AI API key is missing. AI features will be disabled.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const isGeminiAvailable = () => !!genAI;

async function logTokenUsage(result: any) {
  const response = await result.response;

  const tokenUsage = {
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    totalTokens: response.usageMetadata?.totalTokenCount || 0,
  };

  console.log(`Gemini API Token Usage: ${JSON.stringify(tokenUsage, null, 2)}`);
}

export async function streamGenerateContent(
  prompt: string,
  onStream: (text: string) => void,
  // maxTokens: number = 512,
  shouldLogTokens: boolean = false
) {
  try {
    if (!isGeminiAvailable() || !genAI) {
      console.error('Gemini API is not available. Check API Key.');
      return;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      // generationConfig: {
      //   maxOutputTokens: maxTokens
      // }
    });

    const result = await model.generateContentStream(prompt);

    if (shouldLogTokens) await logTokenUsage(result);

    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onStream(fullText);
    }

    return fullText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
