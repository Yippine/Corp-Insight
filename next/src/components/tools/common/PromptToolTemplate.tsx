'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Tools } from '@/lib/aitool/types';
import { useGeminiStream } from '@/hooks/useGeminiStream';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

interface PromptToolTemplateProps {
  config: Tools;
}

export default function PromptToolTemplate({
  config,
}: PromptToolTemplateProps) {
  const [prompt, setPrompt] = useState('');
  const { 
    isLoading: isGenerating, 
    error: generationError, 
    result: generationResult, 
    generate 
  } = useGeminiStream();
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // 當有結果出現時，滾動到結果部分
  useEffect(() => {
    if (generationResult && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [generationResult]);

  const generatePrompt = (isOptimizingPrompt: boolean) => {
    if (isOptimizingPrompt && !generationResult) return '';

    const prefix = config.promptTemplate?.prefix || '';
    const suffix = config.promptTemplate?.suffix || '';

    const basePrompt = `${prefix}
${
  isOptimizingPrompt
    ? '請基於以下現有指令進行優化：\\n' + generationResult + '\\n\\n以及參考以下資訊：\\n'
    : ''
}
使用者的輸入：
"""${prompt}"""

${suffix}

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

${
  config.id !== 'english-writer'
    ? '請以下列語言輸出：\\n請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。'
    : ''
}`;

    return basePrompt;
  };

  const handleGenerate = async (isOptimizingReq: boolean = false) => {
    if (!prompt.trim() || isGenerating) return;

    setIsOptimizing(isOptimizingReq);
    
    const promptText = generatePrompt(isOptimizingReq);
    await generate(promptText);
  };

  const hasContent = generationResult !== null && generationResult !== '';
  const showResultArea = hasContent || !!generationError;
  const contentToDisplay = generationResult || (generationError ? `生成失敗：${generationError}` : '');

  // 主要渲染
  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              需求描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={6}
              className="block w-full rounded-lg border-gray-200 bg-white p-4 text-base text-gray-800 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={config.placeholder}
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
          <motion.button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || !prompt.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating && !isOptimizing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>開始新對話</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !hasContent || !prompt.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-600 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:opacity-70"
          >
            {isGenerating && isOptimizing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>優化中...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>延續對話並優化</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {showResultArea && (
        <motion.div
          ref={resultRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-soft backdrop-blur-lg"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">對話結果</h3>
          <div className="prose max-w-none prose-p:my-2 prose-h1:my-4 prose-h2:my-3 prose-h3:my-2 min-h-[200px] flex flex-col justify-center">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contentToDisplay}
            </ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
