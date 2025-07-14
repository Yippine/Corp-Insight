'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Tools } from '@/lib/aitool/types';
import { useGeminiStream } from '@/hooks/useGeminiStream';

interface HistoryItem {
  id: string;
  prompt: string;
  result: string;
  type: 'new' | 'follow-up';
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

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayedItem, setDisplayedItem] = useState<HistoryItem | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAwaitingFirstToken, setIsAwaitingFirstToken] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  
  const generatePromptText = (isOptimizingPrompt: boolean) => {
    const lastItem = history.length > 0 ? history[history.length - 1] : null;
    const previousResultForPrompt = lastItem?.result;

    if (isOptimizingPrompt && (!previousResultForPrompt || previousResultForPrompt.startsWith('生成失敗'))) {
      return null;
    }
    
    const prefix = config.promptTemplate?.prefix || '';
    const suffix = config.promptTemplate?.suffix || '';

    const basePrompt = `${prefix}
${
  isOptimizingPrompt
    ? '這是前一次的生成結果：\\n' + previousResultForPrompt + '\\n\\n請根據這個結果，回應使用者的新輸入：\\n'
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

    const promptText = generatePromptText(isOptimizingReq);
    if (!promptText) return;

    setIsAwaitingFirstToken(true);
    setIsOptimizing(isOptimizingReq);
    await generate(promptText);
  };

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [displayedItem]);

  useEffect(() => {
    const streamContent = generationResult || (generationError ? `生成失敗：${generationError}` : null);

    if (streamContent) {
      if (isAwaitingFirstToken) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          prompt,
          result: streamContent,
          type: isOptimizing ? 'follow-up' : 'new',
        };
        const newHistory = [...history, newItem].slice(-3);
        
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        setDisplayedItem(newItem);
        setIsAwaitingFirstToken(false);
      } else {
        const updatedHistory = history.map((item, index) => 
          index === currentIndex ? { ...item, result: streamContent } : item
        );
        setHistory(updatedHistory);
        if (updatedHistory[currentIndex]) {
          setDisplayedItem(updatedHistory[currentIndex]);
        }
      }
    }
  }, [generationResult, generationError]);
  
  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < history.length) {
      setCurrentIndex(newIndex);
      setDisplayedItem(history[newIndex]);
      setPrompt(history[newIndex].prompt);
    }
  };

  const lastValidResultItem = [...history].reverse().find(h => h.result && !h.result.startsWith('生成失敗'));
  
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
                <span>開啟新對話</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !lastValidResultItem || !prompt.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-600 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:opacity-70"
          >
            {isGenerating && isOptimizing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>追問中...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>根據結果追問</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      <div className="relative group">
        <AnimatePresence mode="wait">
          {displayedItem && (
            <motion.div
              key={displayedItem.id}
              ref={resultRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-6"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-soft-xl backdrop-blur-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-800">對話結果</h3>
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-all duration-300 ${
                    displayedItem.type === 'follow-up' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    <span>{displayedItem.type === 'follow-up' ? '已追問' : '新對話'}</span>
                  </div>
                </div>
                
                <div className="mb-4 p-4 rounded-xl bg-slate-500/5 text-base text-slate-700 border border-slate-200/50">
                  <p className="font-semibold text-slate-800">你的輸入：</p>
                  <p className="whitespace-pre-wrap mt-1">{displayedItem.prompt}</p>
                </div>
                
                <div className="prose max-w-none prose-p:my-2 prose-h1:my-4 prose-h2:my-3 prose-h3:my-2 min-h-[200px] flex flex-col justify-center">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {displayedItem.result}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && !isAwaitingFirstToken && (
          <>
            {currentIndex > 0 && (
              <motion.button
                onClick={() => handleNavigate(currentIndex - 1)}
                disabled={isGenerating}
                className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/70 text-slate-600 hover:bg-white/90 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Previous result"
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
            )}
            
            {currentIndex < history.length - 1 && (
              <motion.button
                onClick={() => handleNavigate(currentIndex + 1)}
                disabled={isGenerating}
                className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/70 text-slate-600 hover:bg-white/90 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Next result"
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            )}

            {history.length > 1 && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {history.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(index)}
                    disabled={isGenerating}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                      currentIndex === index ? 'w-5 bg-indigo-500' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to result ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
