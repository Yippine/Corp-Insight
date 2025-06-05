'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromptToolConfig {
  id: string;
  name: string;
  description: string;
  instructions: {
    what: string;
    why: string;
    how: string;
  };
  placeholder: string;
  promptTemplate: {
    prefix: string;
    suffix: string;
  };
}

interface PromptToolTemplateProps {
  config: PromptToolConfig;
}

export default function PromptToolTemplate({
  config,
}: PromptToolTemplateProps) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 自動調整文本區域高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  }, [userInput]);

  // 當有結果出現時，滾動到結果部分
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [result]);

  // 處理提交
  const handleSubmit = async () => {
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setResult('');

    try {
      // 在實際應用中，這裡會調用AI API
      // 這裡只是模擬API調用
      setTimeout(() => {
        const simulatedResponse = `這是針對 "${userInput}" 的AI回應，使用了 ${config.name} 提示詞模板。\n\n您可以在這裡替換為實際的API調用結果。
        
${config.name} 處理了您的請求，結果如下：

1. 分析結果...
2. 詳細建議...
3. 進一步行動步驟...

希望這對您有所幫助！`;

        setResult(simulatedResponse);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('提示詞處理出錯:', error);
      setResult('處理您的請求時出現錯誤，請稍後再試。');
      setIsLoading(false);
    }
  };

  // 標題部分
  const renderHeader = () => (
    <div className="mb-6">
      <div className="mb-2 flex items-center">
        <h3 className="text-xl font-semibold text-gray-800">
          {config.instructions.what}
        </h3>
      </div>
      <p className="text-gray-600">{config.instructions.why}</p>
    </div>
  );

  // 輸入部分
  const renderInput = () => (
    <div className="space-y-4">
      <textarea
        ref={textareaRef}
        className="min-h-[120px] w-full rounded-lg border border-gray-300 p-4 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
        placeholder={config.placeholder}
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-all ${
            isLoading
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg'
          }`}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>處理中...</span>
            </>
          ) : (
            <>
              <SendHorizonal size={18} />
              <span>生成</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

  // 結果部分
  const renderResult = () => {
    if (!result && !isLoading) return null;

    return (
      <motion.div
        ref={resultRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
      >
        <div className="mb-4 flex items-center">
          <Wand2 className="mr-2 h-5 w-5 text-blue-500" />
          <h4 className="text-lg font-medium text-blue-800">AI 助理結果</h4>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="border-3 h-8 w-8 animate-spin rounded-full border-blue-500 border-t-transparent"></div>
            <span className="ml-3 text-blue-800">AI 思考中...</span>
          </div>
        ) : (
          <div className="prose prose-blue max-w-none">
            {result.split('\n').map((line, i) => (
              <p key={i} className={line.trim() === '' ? 'my-4' : ''}>
                {line}
              </p>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // 主要渲染
  return (
    <div className="w-full">
      {renderHeader()}
      {renderInput()}
      {renderResult()}
    </div>
  );
}
