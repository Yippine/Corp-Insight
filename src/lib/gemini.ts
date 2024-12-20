import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

async function logTokenUsage(result: any) {
  const response = await result.response;

  const tokenUsage = {
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    totalTokens: response.usageMetadata?.totalTokenCount || 0
  };
  
  console.log(`Gemini API Token Usage: ${JSON.stringify(tokenUsage, null, 2)}`);
}

export async function streamGenerateContent(
  prompt: string,
  onStream: (text: string) => void,
  maxTokens: number = 512,
  shouldLogTokens: boolean = false
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: maxTokens
      }
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