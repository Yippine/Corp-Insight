'use client';

import type { Tools } from '@/lib/aitool/types';
import { usePromptEngine } from '@/hooks/usePromptEngine';

// 引入新拆分的元件
import PromptInputForm from './PromptInputForm';
import PromptStudio from './PromptStudio';
import GenerationResultViewer from './GenerationResultViewer';

interface PromptToolTemplateProps {
  config: Tools;
}

export default function PromptToolTemplate({
  config,
}: PromptToolTemplateProps) {
  // 呼叫自定義 Hook，獲取所有邏輯和狀態
  // 直接將 config 中的 systemPromptTemplate 傳遞給 Hook
  const {
    // 狀態
    prompt,
    isGenerating,
    isOptimizing,
    isAwaitingFirstToken,
    // 比較模式相關
    isComparisonMode,
    comparisonResult,
    // Prompt Studio 相關
    editedConfig,
    editedSystemPrompt,
    isToolDirty,
    isSystemPromptDirty,
    isDirty,
    isFollowUpMode,
    // 顯示邏輯相關
    displayedItem,
    frozenResult,
    history,
    currentIndex,
    // 優化器相關
    isOptimizingPrompt,
    promptBeforeOptimization,

    // Refs
    promptInputRef,
    resultRef,

    // 處理函式
    setPrompt,
    handleKeyDown,
    handleDynamicSubmit,
    handleReset,
    handleNavigate,
    // Studio 操作
    setEditedConfig,
    setEditedSystemPrompt,
    handleSaveToolPrompt,
    handleSaveSystemPrompt,
    handleDiscardChanges,
    // 優化器函式
    handleOptimizePrompt,
    handleUndoOptimization,
  } = usePromptEngine({
    config,
    commonSystemPrompt: (config as any).systemPromptTemplate || '',
  });

  const isAnyLoading = isGenerating || isOptimizingPrompt;

  return (
    <div className="w-full space-y-6">
      <PromptInputForm
        prompt={prompt}
        isGenerating={isAnyLoading}
        isOptimizing={isOptimizing}
        isFollowUpMode={isFollowUpMode}
        isDirty={isDirty}
        placeholder={config.placeholder || ''}
        promptInputRef={promptInputRef}
        setPrompt={setPrompt}
        handleKeyDown={handleKeyDown}
        handleDynamicSubmit={handleDynamicSubmit}
        handleReset={handleReset}
        handleDiscardChanges={handleDiscardChanges}
      />

      {process.env.NODE_ENV === 'development' && (
        <PromptStudio
          editedConfig={editedConfig}
          onConfigChange={setEditedConfig}
          isToolDirty={isToolDirty}
          onSaveToolPrompt={handleSaveToolPrompt}
          editedSystemPrompt={editedSystemPrompt}
          onSystemPromptChange={setEditedSystemPrompt}
          isSystemPromptDirty={isSystemPromptDirty}
          onSaveSystemPrompt={handleSaveSystemPrompt}
          isGenerating={isAnyLoading}
          // 傳遞優化器 props
          isOptimizing={isOptimizingPrompt}
          onOptimize={handleOptimizePrompt}
          // 傳遞復原功能 props (新增)
          promptBeforeOptimization={promptBeforeOptimization}
          handleUndoOptimization={handleUndoOptimization}
        />
      )}

      <GenerationResultViewer
        displayedItem={displayedItem}
        isComparisonMode={isComparisonMode}
        comparisonResult={comparisonResult}
        frozenResult={frozenResult}
        history={history}
        currentIndex={currentIndex}
        isGenerating={isAnyLoading}
        isAwaitingFirstToken={isAwaitingFirstToken}
        resultRef={resultRef}
        handleNavigate={handleNavigate}
      />
    </div>
  );
}
