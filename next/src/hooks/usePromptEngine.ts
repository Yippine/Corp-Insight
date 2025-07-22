import { useState, useRef, useEffect, useCallback } from 'react';
import type { Tools } from '@/lib/aitool/types';
import { useGeminiStream } from '@/hooks/useGeminiStream';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface HistoryItem {
  id: string;
  prompt: string;
  result: string;
  type: 'new' | 'follow-up';
}

export interface ComparisonResult {
  original: string;
  modified: string;
}

// 新增：用於凍結UI的狀態類型
type FrozenResult = HistoryItem | ComparisonResult | null;

export interface PromptConfig {
  prefix: string;
  suffix: string;
}

interface UsePromptEngineProps {
  config: Tools;
  commonSystemPrompt: string;
}

// ============================================================================
// Custom Hook: usePromptEngine
// ============================================================================

export const usePromptEngine = ({
  config,
  commonSystemPrompt,
}: UsePromptEngineProps) => {
  // --- 核心狀態管理 ---
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayedItem, setDisplayedItem] = useState<HistoryItem | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAwaitingFirstToken, setIsAwaitingFirstToken] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult>({
    original: '',
    modified: '',
  });
  // 新增：用於在等待新串流時凍結舊畫面的狀態
  const [frozenResult, setFrozenResult] = useState<FrozenResult>(null);

  // --- 優化器相關狀態 (新增) ---
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [promptBeforeOptimization, setPromptBeforeOptimization] = useState<{
    tool?: PromptConfig;
    system?: string;
  } | null>(null);

  // --- Gemini API 串流 Hook ---
  const {
    isLoading: isGeneratingOriginal,
    error: originalError,
    result: originalResult,
    generate: generateOriginal,
  } = useGeminiStream();

  const {
    isLoading: isGeneratingModified,
    error: modifiedError,
    result: modifiedResult,
    generate: generateModified,
  } = useGeminiStream();

  const isGenerating = isGeneratingOriginal || isGeneratingModified;

  // --- Prompt Studio 相關狀態 ---
  const [originalConfig, setOriginalConfig] = useState<PromptConfig>({
    prefix: config.promptTemplate?.prefix || '',
    suffix: config.promptTemplate?.suffix || '',
  });
  const [editedConfig, setEditedConfig] = useState<PromptConfig>({
    ...originalConfig,
  });

  const initialSystemPrompt =
    commonSystemPrompt || (config as any).systemPromptTemplate;

  const [originalSystemPrompt, setOriginalSystemPrompt] =
    useState(initialSystemPrompt);
  const [editedSystemPrompt, setEditedSystemPrompt] =
    useState(initialSystemPrompt);

  // --- Refs ---
  const resultRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  // --- 衍生狀態 (Derived State) ---
  const isToolDirty =
    originalConfig.prefix !== editedConfig.prefix ||
    originalConfig.suffix !== editedConfig.suffix;
  const isSystemPromptDirty = originalSystemPrompt !== editedSystemPrompt;
  const isDirty = isToolDirty || isSystemPromptDirty; // 組合後的 Dirty 狀態
  const lastValidResultItem = [...history]
    .reverse()
    .find(h => h.result && !h.result.startsWith('生成失敗'));
  // isFollowUpMode 現在還需要考慮 isDirty 狀態
  const isFollowUpMode = !!lastValidResultItem && !isDirty;

  // --- 核心功能函式 ---

  const generatePromptText = useCallback(
    (
      isOptimizingPrompt: boolean,
      promptConfig: PromptConfig,
      systemPrompt: string
    ) => {
      const lastItem = history.length > 0 ? history[history.length - 1] : null;
      const previousResultForPrompt = lastItem?.result;

      if (
        isOptimizingPrompt &&
        (!previousResultForPrompt ||
          previousResultForPrompt.startsWith('生成失敗'))
      ) {
        return null;
      }

      const systemTemplate = systemPrompt;
      const replacements: { [key: string]: string } = {
        prefix: promptConfig.prefix.trim(),
        suffix: promptConfig.suffix.trim(),
        userInput: prompt,
        followUpContext: isOptimizingPrompt
          ? `\n\n這是前一次的生成結果：\n"""${previousResultForPrompt}"""\n\n請根據這個結果，回應使用者的新輸入：`
          : '',
        languageConstraint:
          config.id !== 'english-writer'
            ? '請以下列語言輸出：\n請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。'
            : '',
      };

      let finalPrompt = systemTemplate;
      for (const key in replacements) {
        finalPrompt = finalPrompt.replace(`\${${key}}`, replacements[key]);
      }

      console.log('🚀 --- 最終生成提示詞 --- 🚀');
      console.log(finalPrompt);
      console.log('------------------------------------');

      return finalPrompt;
    },
    [history, config.id, prompt] // 依賴項優化
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    // 判斷是否為追問模式（僅在非dirty狀態下有效）
    const isOptimizingReq = !!lastValidResultItem && !isDirty;

    // 1. 凍結當前畫面，這是解決閃爍和空白問題的關鍵
    if (isComparisonMode) {
      setFrozenResult(comparisonResult);
    } else {
      setFrozenResult(displayedItem);
    }

    // 2. 設定狀態
    const shouldCompare = isDirty;
    setIsComparisonMode(shouldCompare);
    setIsAwaitingFirstToken(true);
    setIsOptimizing(isOptimizingReq);

    // 3. 發起請求
    if (shouldCompare) {
      const originalPromptText = generatePromptText(
        false, // 對比模式永遠不是追問
        originalConfig,
        originalSystemPrompt
      );
      const modifiedPromptText = generatePromptText(
        false, // 對比模式永遠不是追問
        editedConfig,
        editedSystemPrompt
      );

      if (originalPromptText && modifiedPromptText) {
        await Promise.all([
          generateOriginal(originalPromptText),
          generateModified(modifiedPromptText),
        ]);
      }
    } else {
      const promptText = generatePromptText(
        isOptimizingReq,
        editedConfig,
        editedSystemPrompt
      );
      if (!promptText) return;
      await generateOriginal(promptText);
    }
  }, [
    prompt,
    isGenerating,
    isDirty,
    isComparisonMode,
    comparisonResult,
    displayedItem,
    lastValidResultItem,
    generatePromptText,
    originalConfig,
    originalSystemPrompt,
    editedConfig,
    editedSystemPrompt,
    generateOriginal,
    generateModified,
  ]);

  const handleDynamicSubmit = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (!isGenerating && prompt.trim()) {
          handleDynamicSubmit();
        }
      }
    },
    [isGenerating, prompt, handleDynamicSubmit]
  );

  const handleReset = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    setDisplayedItem(null);
    setIsOptimizing(false);
    setIsComparisonMode(false);
    setComparisonResult({ original: '', modified: '' });
    setFrozenResult(null); // 清理凍結畫面
    promptInputRef.current?.focus();
    // 保留 prompt 內容不清空
  }, []);

  const handleDiscardChanges = useCallback(() => {
    setEditedConfig(originalConfig);
    setEditedSystemPrompt(originalSystemPrompt);
    // 捨棄修改後，如果沒有歷史紀錄，就回到完全初始狀態
    if (history.length === 0) {
      handleReset();
    }
  }, [originalConfig, originalSystemPrompt, history, handleReset]);

  // --- 優化器處理函式 (新增) ---
  const handleOptimizePrompt = useCallback(
    async (
      type: 'prefix' | 'suffix' | 'system',
      philosophy: string,
      framework: string
    ) => {
      setIsOptimizingPrompt(true);

      // 1. 在呼叫 API 前，先備份當前的狀態
      if (type === 'system') {
        setPromptBeforeOptimization({ system: editedSystemPrompt });
      } else {
        setPromptBeforeOptimization({ tool: { ...editedConfig } });
      }

      try {
        // 2. 準備請求內容
        let currentPromptData;
        if (type === 'system') {
          currentPromptData = { currentContent: editedSystemPrompt };
        } else {
          currentPromptData = {
            prefix: editedConfig.prefix,
            suffix: editedConfig.suffix,
            target: type, // 告訴後端這次是針對 prefix 還是 suffix
          };
        }

        const response = await fetch('/api/prompt/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            currentPromptData,
            philosophy,
            framework,
            toolId: config.id, // 將工具 ID 也傳遞過去
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API 請求失敗');
        }

        const optimizedText = await response.text();

        // 3. 成功後更新對應的 state
        if (type === 'system') {
          setEditedSystemPrompt(optimizedText);
        } else {
          setEditedConfig(prev => ({
            ...prev,
            [type]: optimizedText, // 動態更新 prefix 或 suffix
          }));
        }
      } catch (error) {
        console.error('Failed to optimize prompt:', error);
        // 如果出錯，復原剛才的備份
        if (promptBeforeOptimization) {
          if (promptBeforeOptimization.system !== undefined) {
            setEditedSystemPrompt(promptBeforeOptimization.system);
          }
          if (promptBeforeOptimization.tool) {
            setEditedConfig(promptBeforeOptimization.tool);
          }
        }
        // 清除復原狀態，因為操作失敗了
        setPromptBeforeOptimization(null);
      } finally {
        setIsOptimizingPrompt(false);
      }
    },
    [editedConfig, editedSystemPrompt, config.id]
  );

  const handleUndoOptimization = useCallback(() => {
    if (!promptBeforeOptimization) return;

    console.log('[Prompt Optimizer] Undoing optimization...');

    if (promptBeforeOptimization.system !== undefined) {
      setEditedSystemPrompt(promptBeforeOptimization.system);
    }
    if (promptBeforeOptimization.tool) {
      setEditedConfig(promptBeforeOptimization.tool);
    }

    setPromptBeforeOptimization(null); // 清除復原狀態
  }, [promptBeforeOptimization]);

  const handleNavigate = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < history.length) {
        setCurrentIndex(newIndex);
        setDisplayedItem(history[newIndex]);
        setPrompt(history[newIndex].prompt);
      }
    },
    [history]
  );

  // --- Prompt Studio API 處理函式 ---

  const handleSavePrompt = useCallback(
    async (type: 'tool' | 'system') => {
      if (
        (type === 'tool' && !isToolDirty) ||
        (type === 'system' && !isSystemPromptDirty)
      ) {
        return;
      }

      let response;
      try {
        if (type === 'tool') {
          const cleanedConfig: PromptConfig = {
            prefix: editedConfig.prefix.trim(),
            suffix: editedConfig.suffix.trim(),
          };
          response = await fetch('/api/aitool/update-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toolId: config.id,
              ...cleanedConfig,
            }),
          });
          if (response.ok) setOriginalConfig(cleanedConfig);
        } else {
          // type === 'system'
          response = await fetch('/api/settings/update-system-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template: editedSystemPrompt }),
          });
          if (response.ok) setOriginalSystemPrompt(editedSystemPrompt);
        }

        if (!response.ok) {
          throw new Error(`伺服器回應錯誤：${response.statusText}`);
        }

        console.log(
          `✅ ${type === 'tool' ? '個性化提示' : '系統提示詞'}儲存成功！`
        );
        // 儲存成功後，清空對話結果，UI聚焦回輸入框
        handleReset();
      } catch (error) {
        console.error(
          `❌ 儲存${type === 'tool' ? '個性化提示' : '系統提示詞'}失敗：`,
          error
        );
      }
    },
    [
      isToolDirty,
      isSystemPromptDirty,
      editedConfig,
      editedSystemPrompt,
      config.id,
      handleReset,
    ]
  );

  const handleSaveToolPrompt = useCallback(
    () => handleSavePrompt('tool'),
    [handleSavePrompt]
  );
  const handleSaveSystemPrompt = useCallback(
    () => handleSavePrompt('system'),
    [handleSavePrompt]
  );

  // --- Effects ---

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [displayedItem]);

  // 處理串流結果的 Effect
  useEffect(() => {
    const originalContent =
      originalResult || (originalError ? `生成失敗：${originalError}` : null);
    const modifiedContent =
      modifiedResult || (modifiedError ? `生成失敗：${modifiedError}` : null);

    // 只要任一串流有新內容，就認為是有效的更新
    if (!originalContent && !modifiedContent) return;

    // 當第一個字元到達時
    if (isAwaitingFirstToken) {
      setIsAwaitingFirstToken(false);
      setFrozenResult(null); // 解除畫面凍結

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt,
        result: isComparisonMode
          ? `左：${originalContent || ''}\n右：${modifiedContent || ''}` // 將雙欄結果合併以存儲
          : originalContent || '',
        type: isOptimizing ? 'follow-up' : 'new',
      };

      // 如果不是追問（即新對話或模式切換），則替換歷史紀錄
      const newHistory = isOptimizing ? [...history, newItem] : [newItem];

      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }

    // 更新當前顯示
    if (isComparisonMode) {
      setComparisonResult({
        original: originalContent || '',
        modified: modifiedContent || '',
      });
    } else if (originalContent) {
      // 在單欄模式下，持續更新 displayedItem
      setHistory(prev =>
        prev.map((item, index) =>
          index === currentIndex ? { ...item, result: originalContent } : item
        )
      );
    }
  }, [originalResult, originalError, modifiedResult, modifiedError]);

  // 當歷史紀錄或當前索引變化時，更新 displayedItem
  useEffect(() => {
    if (currentIndex >= 0 && history[currentIndex]) {
      setDisplayedItem(history[currentIndex]);
    } else {
      setDisplayedItem(null);
    }
  }, [history, currentIndex]);

  // --- 回傳給元件使用的狀態與函式 ---
  return {
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
    frozenResult, // 傳出凍結的結果
    history,
    currentIndex,
    // 優化器相關 (新增)
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
    // 優化器函式 (新增)
    handleOptimizePrompt,
    handleUndoOptimization,
  };
};
