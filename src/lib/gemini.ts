import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function streamGenerateContent(
  prompt: string,
  onStream: (text: string) => void
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContentStream(prompt);
    
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