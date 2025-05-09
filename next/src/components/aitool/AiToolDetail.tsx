'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tools, categoryThemes } from '@/lib/aitool/tools';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// 導入提示詞工具配置
import { getPromptTools } from '@/lib/aitool/promptTools';

interface AiToolDetailProps {
  tool: Tools;
}

export default function AiToolDetail({ tool }: AiToolDetailProps) {
  const router = useRouter();
  const [ToolComponent, setToolComponent] = useState<React.ComponentType<any> | null>(null);

  // 根據工具的 component 屬性加載對應的組件
  useEffect(() => {
    if (tool.component) {
      setToolComponent(tool.component);
    } else {
      // 如果找不到任何對應的組件，顯示默認提示
      setToolComponent(() => () => (
        <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-xl font-semibold text-amber-800 mb-4">工具開發中</h3>
          <p className="text-amber-700">
            此工具正在開發中，敬請期待！請嘗試其他已完成的工具。
          </p>
        </div>
      ));
    }
  }, [tool.id, tool.component]);

  useEffect(() => {
    // 在頁面加載時回到頂部
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    const savedSearch = sessionStorage.getItem('toolSearchParams');
    router.push(`/aitool/search${savedSearch ? `?${savedSearch}` : ''}`);
  };

  // 選擇標籤的主題
  const primaryTag = tool.tags[0] || 'AI';
  const primaryTheme = categoryThemes[primaryTag] || categoryThemes.ai;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button
        onClick={handleBackClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        返回工具列表
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg ${primaryTheme.primary}`}>
            <tool.icon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold ml-4 text-gray-900">{tool.name}</h2>
        </div>

        <p className="text-lg text-gray-700 mb-8">{tool.description}</p>

        <div className="mb-8">
          {ToolComponent ? <ToolComponent /> : (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-blue-800">載入工具中...</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag) => {
            const theme = categoryThemes[tag] || categoryThemes.ai;
            return (
              <span
                key={tag}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme.secondary} ${theme.text}`}
              >
                {theme.name}
              </span>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}