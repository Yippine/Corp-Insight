import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CopyButton from '@/components/common/CopyButton';
import type {
  HistoryItem,
  ComparisonResult,
} from '@/hooks/usePromptEngine';
import { Sparkles } from 'lucide-react';

// 新增：FrozenResult 的類型需要從 usePromptEngine 導入
interface FrozenResultProps {
  frozenResult: HistoryItem | ComparisonResult | null;
}

// Props 的型別定義
interface GenerationResultViewerProps extends FrozenResultProps {
  displayedItem: HistoryItem | null;
  isComparisonMode: boolean;
  comparisonResult: ComparisonResult;
  history: HistoryItem[];
  currentIndex: number;
  isGenerating: boolean;
  isAwaitingFirstToken: boolean;
  resultRef: React.RefObject<HTMLDivElement>;
  handleNavigate: (index: number) => void;
}

// 單一結果顯示元件
const SingleResultView: React.FC<{ item: HistoryItem }> = ({ item }) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="mt-6"
  >
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-soft-xl backdrop-blur-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-800">對話結果</h3>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-all duration-300 ${
            item.type === 'follow-up'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-sky-100 text-sky-800'
          }`}
        >
          <span>{item.type === 'follow-up' ? '已追問' : '新對話'}</span>
        </div>
      </div>

      <div className="group relative mb-4 p-4 rounded-xl bg-slate-500/5 text-base text-slate-700 border border-slate-200/50">
        <p className="font-semibold text-slate-800">你的輸入：</p>
        <p className="whitespace-pre-wrap mt-1">{item.prompt}</p>
        <CopyButton textToCopy={item.prompt} />
      </div>

      <div className="group relative prose max-w-none prose-p:my-2 prose-h1:my-4 prose-h2:my-3 prose-h3:my-2 min-h-[200px] flex flex-col justify-center">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {item.result}
        </ReactMarkdown>
        <CopyButton
          textToCopy={item.result}
          className="prose-copy-button"
        />
      </div>
    </div>
  </motion.div>
);

// 雙欄對比的內部元件
const ComparisonView: React.FC<{ result: ComparisonResult }> = ({ result }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="mt-6"
  >
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 shadow-soft-xl backdrop-blur-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          雙欄結果對比
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-slate-700">原始版本</h4>
              {/* 關鍵修改：應用統一的標籤樣式 */}
              <div
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-800 transition-all duration-300"
              >
                <span>Original</span>
              </div>
            </div>
            <div className="group relative prose max-w-none prose-p:my-2 min-h-[150px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.original}
              </ReactMarkdown>
              <CopyButton
                textToCopy={result.original}
                className="prose-copy-button"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-emerald-800">修改後版本</h4>
              {/* 關鍵修改：應用統一的標籤樣式 */}
              <div
                className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 font-medium text-emerald-800 transition-all duration-300"
              >
                <span>Modified</span>
              </div>
            </div>
            <div className="group relative prose max-w-none prose-p:my-2 min-h-[150px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.modified}
              </ReactMarkdown>
              <CopyButton
                textToCopy={result.modified}
                className="prose-copy-button"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// 用於渲染凍結畫面的元件
const FrozenResultView: React.FC<FrozenResultProps> = ({ frozenResult }) => {
  if (!frozenResult) return null;
  // 判斷凍結的結果是單欄還是雙欄
  if ('original' in frozenResult) {
    return <ComparisonView result={frozenResult} />;
  }
  return <SingleResultView item={frozenResult} />;
};


const GenerationResultViewer: React.FC<GenerationResultViewerProps> = ({
  displayedItem,
  isComparisonMode,
  comparisonResult,
  frozenResult,
  history,
  currentIndex,
  isGenerating,
  isAwaitingFirstToken,
  resultRef,
  handleNavigate,
}) => {
  const renderContent = () => {
    if (isAwaitingFirstToken) {
      return <FrozenResultView frozenResult={frozenResult} />;
    }
    if (isComparisonMode) {
      return <ComparisonView result={comparisonResult} />;
    }
    if (displayedItem) {
      return <SingleResultView item={displayedItem} />;
    }
    return (
      // 新增：在初始狀態下顯示一個提示區塊
      <div className="mt-6 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
        <Sparkles className="h-10 w-10 text-slate-400" />
        <h3 className="mt-2 text-lg font-medium text-slate-600">
          準備就緒
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          您的 AI 生成結果將會顯示在這裡。
        </p>
      </div>
    );
  };

  return (
    // 關鍵修正：給最外層容器一個固定的 key，防止它在模式切換時重新觸發動畫
    <div className="relative group" ref={resultRef}>
      <AnimatePresence mode="wait">
        <motion.div
          key="result-container" // 使用固定 key
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {history.length > 0 && !isAwaitingFirstToken && !isComparisonMode && (
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
                    currentIndex === index
                      ? 'w-5 bg-indigo-500'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to result ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenerationResultViewer;
