'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ListFilter, Search } from 'lucide-react';
import Link from 'next/link';
import { Tools, categoryThemes, fullTagThemes, getToolsData, iconMap } from '@/lib/aitool/tools';
import { sortToolsByTags, sortToolsBySelectedTag } from '@/lib/aitool/toolSorter';

interface AiToolSearchProps {
  initialQuery: string;
  initialTag: string;
}

export default function AiToolSearch({ initialQuery, initialTag }: AiToolSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [tools, setTools] = useState<Tools[]>([]);

  useEffect(() => {
    // 獲取工具數據
    const toolsData = getToolsData();
    setTools(toolsData);
  }, []);

  // 參數同步邏輯
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', encodeURIComponent(searchQuery));
    if (selectedTag) params.set('tag', encodeURIComponent(selectedTag));
    
    // 構建新的 URL
    const newUrl = `/aitool/search${params.toString() ? `?${params.toString()}` : ''}`;
    
    // 使用 window.history 更新 URL 而不重新加載頁面
    window.history.pushState({}, '', newUrl);
  }, [searchQuery, selectedTag, router]);

  // 工具過濾邏輯
  const filteredTools = useCallback(() => {
    if (!tools.length) return [];
    
    let filtered = [...tools];
    const query = searchQuery.toLowerCase();
    const tag = selectedTag;

    if (query) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }

    if (tag && tag !== '全部') {
      filtered = filtered.filter(t => t.tags.includes(tag));
    }

    // 先使用標籤排序邏輯對工具進行排序，再根據選中的標籤進行二次排序
    return sortToolsBySelectedTag(filtered, tag);
  }, [searchQuery, selectedTag, tools]);

  // 標籤切換邏輯
  const handleTagSelect = (tag: string) => {
    setSelectedTag(prevTag => tag === '全部' || prevTag === tag ? '' : tag);
  };

  // 導航邏輯
  const handleToolClick = (toolId: string) => {
    // 保存搜索參數到 sessionStorage
    sessionStorage.setItem('toolSearchParams', new URLSearchParams(searchParams.toString()).toString());
    sessionStorage.setItem('toolSearchScroll', window.scrollY.toString());

    // 跳轉到工具詳情頁
    router.push(`/aitool/detail/${toolId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="搜尋工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center ml-4 px-4 py-2 bg-gray-50 rounded-lg">
          <ListFilter className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-600 font-medium">
            {filteredTools().length} 個工具
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(categoryThemes).map(([tag, theme]) => (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTagSelect(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedTag === tag || (!selectedTag && tag === '全部') 
                ? `bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} text-white ${theme.shadow}` 
                : `${theme.secondary} ${theme.text} ${theme.hover}`
            }`}
          >
            {theme.name}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredTools().map((tool, index) => {
            let primaryTheme = fullTagThemes.ai || categoryThemes.default; 
            const firstTagInCategories = tool.tags.find(tag => categoryThemes[tag]);
            if (firstTagInCategories && categoryThemes[firstTagInCategories]) {
              primaryTheme = categoryThemes[firstTagInCategories];
            } else {
              const toolThemesFromFull = tool.tags.map(t => fullTagThemes[t]).filter(Boolean);
              if (toolThemesFromFull.length > 0 && toolThemesFromFull[0]) {
                primaryTheme = toolThemesFromFull[0];
              }
            }
            primaryTheme = primaryTheme || categoryThemes.default; // Ensure primaryTheme is always defined

            const IconComponent = iconMap[tool.iconName] || iconMap.Zap; // 使用 iconMap

            return (
              <motion.div
                key={`${tool.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <button
                  onClick={() => handleToolClick(tool.id)}
                  className={`relative w-full bg-white p-6 rounded-xl text-left ${
                    hoveredTool === tool.id 
                      ? `shadow-lg ${primaryTheme.shadow} border-2 ${primaryTheme.text}` 
                      : 'shadow border border-gray-100'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg transition-colors duration-200 ${
                      hoveredTool === tool.id ? primaryTheme.primary : primaryTheme.secondary
                    }`}>
                      <IconComponent className={`h-6 w-6 transition-colors duration-200 ${
                        hoveredTool === tool.id ? 'text-white' : primaryTheme.icon
                      }`} />
                    </div>
                    <h3 className={`text-xl font-semibold ml-4 transition-colors duration-200 ${
                      hoveredTool === tool.id ? primaryTheme.text : 'text-gray-900'
                    }`}>
                      {tool.name}
                    </h3>
                  </div>
                  <p className={`text-sm transition-colors duration-200 ${
                    hoveredTool === tool.id ? primaryTheme.text : 'text-gray-600'
                  }`}>
                    {tool.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.tags.map((tag) => {
                      const themeFromCategory = categoryThemes[tag];
                      const themeFromFull = fullTagThemes[tag];
                      const tagTheme = themeFromCategory || themeFromFull || categoryThemes.default; // Ensure tagTheme is defined
                      return (
                        <span
                          key={tag}
                          className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                            hoveredTool === tool.id 
                              ? `${tagTheme.primary} text-white` 
                              : `${tagTheme.secondary} ${tagTheme.text}`
                          }`}
                        >
                          {tagTheme.name}
                        </span>
                      );
                    })}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTools().length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            找不到相關工具
          </h3>
          <p className="text-gray-600">
            請嘗試使用不同的搜尋關鍵字或篩選條件
          </p>
        </motion.div>
      )}
    </div>
  );
}