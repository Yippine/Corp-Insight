import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize'; // 導入自動調整大小的 textarea
import { PromptOptimizer } from '@/components/common/prompt/PromptOptimizer';
import { RotateCcw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// 定義提示詞設定的型別
interface PromptConfig {
  prefix: string;
  suffix: string;
}

interface PromptStudioProps {
  editedConfig: PromptConfig;
  onConfigChange: (value: PromptConfig) => void;
  isToolDirty: boolean;
  onSaveToolPrompt: () => Promise<void>;
  editedSystemPrompt: string;
  onSystemPromptChange: (newTemplate: string) => void;
  isSystemPromptDirty: boolean;
  onSaveSystemPrompt: () => Promise<void>;
  isGenerating: boolean; // 用於禁用按鈕

  // 新增用於優化器的屬性
  isOptimizing: boolean;
  onOptimize: (
    type: 'prefix' | 'suffix' | 'system',
    philosophy: string,
    framework: string
  ) => void;
  // 新增用於復原功能的屬性
  promptBeforeOptimization: { tool?: PromptConfig; system?: string } | null;
  handleUndoOptimization: () => void;
}

interface SaveButtonProps {
  isDirty: boolean;
  onSave: () => Promise<void>;
  isLoading: boolean;
  isDisabled: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  isDirty,
  onSave,
  isLoading,
  isDisabled,
}) => {
  const handleClick = async () => {
    if (!isDisabled) {
      await onSave();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={!isDirty || isLoading || isDisabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDirty
          ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
          : 'bg-gray-400'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isLoading ? '儲存中...' : '儲存'}
    </motion.button>
  );
};

const PromptStudio: React.FC<PromptStudioProps> = ({
  editedConfig,
  onConfigChange,
  isToolDirty,
  onSaveToolPrompt,
  editedSystemPrompt,
  onSystemPromptChange,
  isSystemPromptDirty,
  onSaveSystemPrompt,
  isGenerating,
  isOptimizing,
  onOptimize,
  promptBeforeOptimization,
  handleUndoOptimization,
}) => {
  const [activeTab, setActiveTab] = useState<'tool' | 'system'>('tool');
  const [isLoadingTool, setIsLoadingTool] = useState(false);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);

  const handleSaveDecorator = async (
    saveFn: () => Promise<void>,
    setter: (loading: boolean) => void
  ) => {
    setter(true);
    try {
      await saveFn();
    } finally {
      setter(false);
    }
  };

  return (
    <div className="shadow-soft-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-1 backdrop-blur-lg">
      <div className="flex border-b border-slate-200">
        <TabButton
          label="個性化提示"
          isActive={activeTab === 'tool'}
          onClick={() => setActiveTab('tool')}
        />
        <TabButton
          label="系統提示詞"
          isActive={activeTab === 'system'}
          onClick={() => setActiveTab('system')}
        />
      </div>
      <div className="p-4">
        {activeTab === 'tool' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* 關鍵修改：改為垂直堆疊，並使用新的 TextareaWithLabel */}
            <div className="grid grid-cols-1 gap-6">
              <TextareaWithLabel
                id="prefix"
                label="角色身分（Prefix）"
                value={editedConfig.prefix}
                onChange={e =>
                  onConfigChange({ ...editedConfig, prefix: e.target.value })
                }
                disabled={isGenerating || isOptimizing}
                placeholder="請輸入工具專屬的前綴提示詞..."
                minRows={3}
                onOptimize={(p, f) => onOptimize('prefix', p, f)}
                isOptimizing={isOptimizing}
                promptBeforeOptimization={promptBeforeOptimization}
                handleUndoOptimization={handleUndoOptimization}
              />
              <TextareaWithLabel
                id="suffix"
                label="執行準則（Suffix）"
                value={editedConfig.suffix}
                onChange={e =>
                  onConfigChange({ ...editedConfig, suffix: e.target.value })
                }
                disabled={isGenerating || isOptimizing}
                placeholder="請輸入工具專屬的後綴提示詞..."
                minRows={3}
                onOptimize={(p, f) => onOptimize('suffix', p, f)}
                isOptimizing={isOptimizing}
                promptBeforeOptimization={promptBeforeOptimization}
                handleUndoOptimization={handleUndoOptimization}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <SaveButton
                isDirty={isToolDirty}
                onSave={() =>
                  handleSaveDecorator(onSaveToolPrompt, setIsLoadingTool)
                }
                isLoading={isLoadingTool}
                isDisabled={isGenerating}
              />
            </div>
          </motion.div>
        )}
        {activeTab === 'system' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TextareaWithLabel
              id="system-prompt"
              label="通用範本（Template）"
              value={editedSystemPrompt}
              onChange={e => onSystemPromptChange(e.target.value)}
              minRows={8} // 增加通用範本的最小行數
              disabled={isGenerating || isOptimizing}
              placeholder="請輸入通用的系統範本..."
              onOptimize={(p, f) => onOptimize('system', p, f)}
              isOptimizing={isOptimizing}
              promptBeforeOptimization={promptBeforeOptimization}
              handleUndoOptimization={handleUndoOptimization}
            />
            <div className="mt-4 flex justify-end">
              <SaveButton
                isDirty={isSystemPromptDirty}
                onSave={() =>
                  handleSaveDecorator(onSaveSystemPrompt, setIsLoadingSystem)
                }
                isLoading={isLoadingSystem}
                isDisabled={isGenerating}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-1/2 px-4 py-2.5 text-center font-medium transition-colors duration-200 focus:outline-none ${
      isActive
        ? 'border-b-2 border-indigo-500 text-indigo-600'
        : 'text-slate-500 hover:bg-slate-100/80'
    }`}
  >
    {label}
  </button>
);

const TextareaWithLabel: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minRows?: number;
  disabled?: boolean;
  placeholder?: string;
  // 新增優化器相關的可選屬性
  onOptimize?: (philosophy: string, framework: string) => void;
  isOptimizing?: boolean;
  // 新增復原功能相關的可選屬性
  promptBeforeOptimization?: { tool?: PromptConfig; system?: string } | null;
  handleUndoOptimization?: () => void;
}> = ({
  id,
  label,
  value,
  onChange,
  minRows = 4,
  disabled = false,
  placeholder = '',
  onOptimize,
  isOptimizing,
  promptBeforeOptimization,
  handleUndoOptimization,
}) => {
  // 判斷當前的 undo 狀態是否與此 Textarea 相關
  const isUndoable =
    promptBeforeOptimization &&
    ((id.includes('system') && promptBeforeOptimization.system !== undefined) ||
      (!id.includes('system') && promptBeforeOptimization.tool !== undefined));

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="mb-2 block text-base font-medium text-slate-700"
        >
          {label}
        </label>
        {onOptimize && typeof isOptimizing === 'boolean' && (
          <PromptOptimizer
            onOptimize={onOptimize}
            isOptimizing={isOptimizing}
            className="-mt-2" // 向上微調以對齊標題
          />
        )}
      </div>
      {/* 關鍵修改：使用 TextareaAutosize 並更新樣式 */}
      <TextareaAutosize
        id={id}
        value={value}
        onChange={onChange}
        minRows={minRows}
        className="w-full rounded-xl border-none bg-slate-100/80 p-4 text-base text-slate-800 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        disabled={disabled}
        placeholder={placeholder}
      />
      <AnimatePresence>
        {isUndoable && handleUndoOptimization && (
          <motion.button
            onClick={handleUndoOptimization}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 hover:bg-amber-200"
          >
            <RotateCcw className="h-4 w-4" />
            復原
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptStudio;
