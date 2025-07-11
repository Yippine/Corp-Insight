'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tools } from '@/lib/aitool/types';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';

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
  const isStreaming = isGenerating && generationResult === '';
  const showResultArea = isGenerating || hasContent || generationError;
  const contentToDisplay = generationResult || (generationError ? `生成失敗：${generationError}` : '');

  // 主要渲染
  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              需求描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={config.placeholder}
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && !isOptimizing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-6 w-6" />
                生成中...
              </span>
            ) : (
              '開始新對話'
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !generationResult || !prompt.trim()}
            className={`flex-1 border py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              generationResult
                ? 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {isGenerating && isOptimizing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-6 w-6" />
                優化中...
              </span>
            ) : (
              '延續對話並優化'
            )}
          </button>
        </div>
      </div>

      {showResultArea && (
        <motion.div
          ref={resultRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-6"
        >
          <h3 className="text-xl font-medium text-gray-900 mb-4">對話結果</h3>
          <div className="space-y-4 whitespace-pre-wrap font-mono text-base min-h-[200px] flex flex-col justify-center">
            {isStreaming ? (
              <InlineLoading />
            ) : (
              contentToDisplay
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
