import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Users,
  Lightbulb,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
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
  { id: 'auto', name: 'AI 自動推薦' },
  { id: 'icio', name: 'ICIO' },
  { id: 'crispe', name: 'CRISPE' },
  { id: 'broke', name: 'BROKE' },
  { id: 'roses', name: 'ROSES' },
  { id: 'ape', name: 'APE' },
  { id: 'co-star', name: 'CO-STAR' },
];

export const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
  onOptimize,
  isOptimizing,
  className,
}) => {
  const [philosophy, setPhilosophy] = useState('professional');
  const [framework, setFramework] = useState('auto');
  const [isOpen, setIsOpen] = useState(false);

  const handleOptimizeClick = () => {
    onOptimize(philosophy, framework);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isOptimizing} // 新增禁用邏輯
          className={cn(
            'hover:bg-primary/10 text-primary/80 hover:text-primary rounded-full transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg',
            'disabled:cursor-not-allowed disabled:opacity-50', // 新增禁用時的樣式
            className
          )}
        >
          <Sparkles className="h-5 w-5" />
          <span className="sr-only">優化提示詞</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-primary/20 bg-background/95 w-80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
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
                      'border-muted bg-popover hover:bg-accent hover:text-accent-foreground flex cursor-pointer flex-col items-center justify-center rounded-md border-2 p-3 transition-all duration-200 ease-in-out',
                      { 'border-primary shadow-md': philosophy === id }
                    )}
                  >
                    <RadioGroupItem
                      value={id}
                      id={`philosophy-${id}`}
                      className="sr-only"
                    />
                    <Icon
                      className={cn(
                        'mb-2 h-6 w-6 transition-transform duration-200',
                        { 'scale-110': philosophy === id }
                      )}
                    />
                    <span className="text-xs font-medium">{name}</span>
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
