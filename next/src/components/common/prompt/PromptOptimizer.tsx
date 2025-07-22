import React, { useState, useMemo } from 'react';
import { Sparkles, BrainCircuit, Users, Lightbulb, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PromptOptimizerProps {
  onOptimize: (philosophy: string, framework: string) => void;
  isOptimizing: boolean;
  className?: string;
}

const philosophies = [
  { id: 'professional', name: '專業顧問', Icon: BrainCircuit },
  { id: 'empathetic', name: '共情夥伴', Icon: Users },
  { id: 'creative', name: '創意激發', Icon: Lightbulb },
];

const frameworks = [
  {
    id: 'auto',
    name: 'AI 自動推薦',
    elements: ['智慧判斷'],
    description: '由 AI 根據工具特性，自動選擇或融合最適合的框架。',
  },
  {
    id: 'icio',
    name: 'ICIO',
    elements: ['任務', '背景', '輸入', '輸出'],
    description: '適用於資料處理、技術文件等目標明確的任務。',
  },
  {
    id: 'crispe',
    name: 'CRISPE',
    elements: ['角色', '背景', '任務', '風格', '實驗'],
    description: '適用於角色扮演、教育輔導與創意寫作。',
  },
  {
    id: 'broke',
    name: 'BROKE',
    elements: ['背景', '角色', '目標', '關鍵結果', '改進'],
    description: '適用於專案管理、產品開發與流程優化。',
  },
  {
    id: 'roses',
    name: 'ROSES',
    elements: ['角色', '目標', '場景', '解決方案', '步驟'],
    description: '適用於策略規劃、問題解決與顧問報告。',
  },
  {
    id: 'ape',
    name: 'APE',
    elements: ['行動', '目的', '期望'],
    description: '適用於需要快速、直接、具體指令的簡單任務。',
  },
  {
    id: 'co-star',
    name: 'CO-STAR',
    elements: ['情境', '目標', '風格', '語調', '受眾'],
    description: '適用於廣告文案、社群媒體與市場行銷內容。',
  },
];

export const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
  onOptimize,
  isOptimizing,
  className,
}) => {
  const [philosophy, setPhilosophy] = useState('professional');
  const [framework, setFramework] = useState('auto');
  const [isOpen, setIsOpen] = useState(false);

  const selectedFramework = useMemo(
    () => frameworks.find(f => f.id === framework),
    [framework]
  );

  const handleOptimizeClick = () => {
    onOptimize(philosophy, framework);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          disabled={isOptimizing}
          className={cn(
            'group rounded-full text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl',
            'bg-gradient-to-br from-indigo-600 to-purple-600', // Apply gradient
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="sr-only">優化提示詞</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-primary/20 bg-background/95 w-96 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="grid gap-6">
          <div className="space-y-2 text-center">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">
              AI 提示詞優化精靈
            </h3>
            <p className="text-muted-foreground text-sm">
              選擇心法與框架，讓 AI 為您強化提示詞
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-3">
              <Label className="text-foreground/90 font-semibold">
                心法（Philosophy）
              </Label>
              <RadioGroup
                value={philosophy}
                onValueChange={setPhilosophy}
                className="grid grid-cols-3 gap-2"
              >
                {philosophies.map(({ id, name, Icon }) => (
                  <Label
                    key={id}
                    htmlFor={`philosophy-${id}`}
                    className={cn(
                      'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border p-3 transition-all duration-200 ease-in-out',
                      // Default state for unselected items
                      'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50',
                      // Styles for the selected item
                      {
                        'border-transparent bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg ring-2 ring-indigo-500/50 ring-offset-2':
                          philosophy === id,
                      }
                    )}
                  >
                    <RadioGroupItem
                      value={id}
                      id={`philosophy-${id}`}
                      className="sr-only"
                    />
                    <Icon
                      className={cn(
                        'mb-1.5 h-6 w-6 transition-transform duration-200',
                        {
                          'scale-110 text-white': philosophy === id,
                          'text-slate-500': philosophy !== id,
                        }
                      )}
                    />
                    <span className="text-xs font-semibold">{name}</span>
                    {philosophy === id && (
                      <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                    )}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="framework"
                className="text-foreground/90 font-semibold"
              >
                框架（Framework）
              </Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger
                  id="framework"
                  className="focus:ring-primary/50 w-full rounded-lg focus:ring-2"
                >
                  <SelectValue placeholder="選擇一個框架..." />
                </SelectTrigger>
                <SelectContent className="bg-background/80 rounded-lg backdrop-blur-xl">
                  {frameworks.map(({ id, name }) => (
                    <SelectItem
                      key={id}
                      value={id}
                      className="focus:bg-primary/10 cursor-pointer"
                    >
                      <span>{name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFramework && (
                <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-left">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedFramework.elements.map(element => (
                      <span
                        key={element}
                        className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-semibold text-indigo-800"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    {selectedFramework.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleOptimizeClick}
            disabled={isOptimizing}
            className="w-full rounded-lg font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
          >
            {isOptimizing ? '優化中...' : '開始優化'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
