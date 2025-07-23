import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Wand2, Plus, RotateCcw } from 'lucide-react';

// Props 的型別定義，讓 TypeScript 知道這個元件會接收哪些資料和函式
interface PromptInputFormProps {
  prompt: string;
  isGenerating: boolean;
  isOptimizing: boolean;
  isFollowUpMode: boolean;
  isDirty: boolean; // 用於判斷提示詞是否被修改
  placeholder: string;
  promptInputRef: React.RefObject<HTMLTextAreaElement>;
  setPrompt: (value: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleDynamicSubmit: () => void;
  handleReset: () => void;
  handleDiscardChanges: () => void; // 處理捨棄修改的函式
}

const PromptInputForm: React.FC<PromptInputFormProps> = ({
  prompt,
  isGenerating,
  isOptimizing,
  isFollowUpMode,
  isDirty, // 新增
  placeholder,
  promptInputRef,
  setPrompt,
  handleKeyDown,
  handleDynamicSubmit,
  handleReset,
  handleDiscardChanges, // 新增
}) => {
  // 根據情境動態產生 placeholder 和按鈕提示
  const basePlaceholder = isFollowUpMode
    ? '根據結果繼續追問...'
    : placeholder || '請輸入您的需求...'; // 使用傳入的 placeholder
  const shortcutHint = '（Enter 換行，Ctrl + Enter 送出）';
  const dynamicPlaceholder = `${basePlaceholder} ${shortcutHint}`;

  // --- 按鈕內容渲染邏輯 ---
  const renderSubmitButtonContent = () => {
    if (isGenerating) {
      return (
        <motion.span
          key="generating"
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{isOptimizing ? '追問中...' : '生成中...'}</span>
        </motion.span>
      );
    }

    if (isDirty) {
      return (
        <motion.span
          key="compare"
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="h-5 w-5" />
          <span>生成對比結果</span>
        </motion.span>
      );
    }

    if (isFollowUpMode) {
      return (
        <motion.span
          key="followup"
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Wand2 className="h-5 w-5" />
          <span>根據結果追問</span>
        </motion.span>
      );
    }

    return (
      <motion.span
        key="new"
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <Sparkles className="h-5 w-5" />
        <span>開啟新對話</span>
      </motion.span>
    );
  };

  const buttonTitle = isDirty
    ? '提示：以修改後的提示詞進行生成，並與原始版本對比'
    : isFollowUpMode
    ? '提示：基於目前的對話結果繼續提問'
    : '提示：開始一個全新的對話';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-2 block text-base font-medium text-gray-700">
            需求描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={promptInputRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            className="block w-full rounded-lg border-gray-200 bg-white p-4 text-base text-gray-800 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={dynamicPlaceholder}
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <motion.button
          onClick={handleDynamicSubmit}
          disabled={isGenerating || !prompt.trim()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          title={buttonTitle}
          className="inline-flex flex-grow items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AnimatePresence mode="wait">{renderSubmitButtonContent()}</AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isFollowUpMode || isDirty ? (
            <motion.button
              onClick={isDirty ? handleDiscardChanges : handleReset}
              disabled={isGenerating} // 新增禁用邏輯
              title={isDirty ? '捨棄修改' : '開啟全新對話'}
              initial={{ opacity: 0, scale: 0.5, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.5, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={`flex-shrink-0 rounded-lg border p-3 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDirty
                  ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 focus:ring-amber-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-indigo-500'
              }`}
              aria-label={isDirty ? 'Discard Changes' : 'New Conversation'}
            >
              {isDirty ? (
                <RotateCcw className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PromptInputForm;
