'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ListFilter, Search } from 'lucide-react';
import {
  getCategoryThemes,
  getFullTagThemes,
  searchToolsFromAPI,
} from '@/lib/aitool/apiHelpers';
import { iconMap } from '@/lib/aitool/iconMap';
import type { Tools, ColorTheme } from '@/lib/aitool/types';
import NoSearchResults from '@/components/common/NoSearchResults';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';
import { useLoading } from '@/components/common/loading/LoadingProvider';
import { trackBusinessEvents } from '../GoogleAnalytics';
import LineBotBanner from './LineBotBanner';
import FeatureSection from '@/components/FeatureSection';

interface AiToolSearchProps {
  initialQuery: string;
  initialTag: string;
}

export default function AiToolSearch({
  initialQuery,
  initialTag,
}: AiToolSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { startLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [tools, setTools] = useState<Tools[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [categoryThemes, setCategoryThemes] = useState<
    Record<string, ColorTheme>
  >({});
  const [fullTagThemes, setFullTagThemes] = useState<
    Record<string, ColorTheme>
  >({});
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 統一的資料獲取與狀態設定函式
  const fetchTools = useCallback(async (query: string, tag: string) => {
    setIsLoading(true);
    try {
      const toolsData = await searchToolsFromAPI(query, tag);
      setTools(toolsData);
    } catch (error) {
      console.error('Error loading tools data:', error);
      setTools([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 首次掛載時，獲取主題和初始工具列表
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [toolsData, categoryThemesData, fullTagThemesData] =
          await Promise.all([
            searchToolsFromAPI(initialQuery, initialTag),
            getCategoryThemes(),
            getFullTagThemes(),
          ]);
        setTools(toolsData);
        setCategoryThemes(categoryThemesData);
        setFullTagThemes(fullTagThemesData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setTools([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [initialQuery, initialTag]);

  // 監聽搜尋條件變化，並帶有防抖動機制 (非首次渲染)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTag) params.set('tag', selectedTag);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      fetchTools(searchQuery, selectedTag);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery, selectedTag, fetchTools, pathname, router]);


  // 更新頁面標題
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      const hasResults = tools.length > 0;
      if (!hasResults) {
        document.title = dynamicTitles.aiToolSearchNoResult(searchQuery, selectedTag);
      } else if (searchQuery && selectedTag) {
        document.title = dynamicTitles.aiToolSearchWithQueryAndTag(searchQuery, selectedTag);
      } else if (searchQuery) {
        document.title = dynamicTitles.aiToolSearchWithQuery(searchQuery);
      } else if (selectedTag) {
        document.title = dynamicTitles.aiToolSearchWithTag(selectedTag);
      } else {
        document.title = staticTitles.aiToolSearch;
      }
    }
  }, [searchQuery, selectedTag, tools, isLoading]);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(prevTag => {
      const newTag = tag === '全部' || prevTag === tag ? '' : tag;
      return newTag;
    });
  };
  
  // 當 selectedTag 改變時，觸發 GA 事件
  useEffect(() => {
    if (!isLoading && selectedTag) {
      trackBusinessEvents.aiToolSearch(selectedTag, tools.length);
    }
  }, [selectedTag, tools, isLoading]);


  const handleToolClick = (toolId: string) => {
    const clickedTool = tools.find(tool => tool.id === toolId);
    if (clickedTool) {
      trackBusinessEvents.aiToolUse(clickedTool.name, clickedTool.tags[0] || 'unknown');
    }

    sessionStorage.setItem('toolSearchParams', searchParams.toString());
    sessionStorage.setItem('toolSearchScroll', window.scrollY.toString());
    startLoading();
    router.push(`/aitool/detail/${toolId}`);
  };

  const currentTag = searchParams.get('tag') || '';

  return (
    <div className="space-y-8">
      <LineBotBanner />
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="搜尋工具..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-4 flex items-center rounded-lg bg-gray-50 px-4 py-2">
            <ListFilter className="mr-2 h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-600">
              {isLoading ? '...' : `${tools.length} 個工具`}
            </span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Object.keys(categoryThemes).length > 0 ? (
            Object.entries(categoryThemes).map(([tag, theme]) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagSelect(tag)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  currentTag === tag || (!currentTag && tag === '全部')
                    ? `bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} text-white ${theme.shadow}`
                    : `${theme.secondary} ${theme.text} ${theme.hover}`
                }`}
              >
                {theme.name}
              </motion.button>
            ))
          ) : (
            <div className="h-10 w-full" /> // Placeholder for loading state
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <InlineLoading />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTag + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid min-h-[300px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {tools.length > 0 ? (
                tools.map((tool, index) => {
                  const Icon = iconMap[tool.iconName] || iconMap.Zap;
                  const toolThemes = tool.tags
                    .map(t => fullTagThemes[t] || fullTagThemes.ai)
                    .filter(Boolean);
                  const primaryTheme = toolThemes[0] || fullTagThemes.ai;
                  const isHovered = hoveredTool === tool.id;

                  return (
                    <motion.div
                      key={`${tool.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.05 },
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      onMouseEnter={() => setHoveredTool(tool.id)}
                      onMouseLeave={() => setHoveredTool(null)}
                      className="h-full"
                    >
                      <button
                        onClick={() => handleToolClick(tool.id)}
                        className={`relative h-full w-full rounded-xl p-6 text-left transition-all duration-300 ${
                          isHovered
                            ? `shadow-lg ${primaryTheme.shadow} border-2 ${primaryTheme.text}`
                            : 'border border-gray-100 shadow'
                        }`}
                      >
                        <div className="mb-4 flex items-center">
                          <div
                            className={`rounded-lg p-3 transition-all duration-300 ${
                              isHovered
                                ? primaryTheme.primary
                                : primaryTheme.secondary
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6 transition-all duration-300 ${
                                isHovered ? 'text-white' : primaryTheme.icon
                              }`}
                            />
                          </div>
                          <h3
                            className={`ml-4 text-xl font-semibold transition-colors duration-300 ${
                              isHovered ? primaryTheme.text : 'text-gray-900'
                            }`}
                          >
                            {tool.name}
                          </h3>
                        </div>
                        <p
                          className={`transition-colors duration-300 ${
                            isHovered ? primaryTheme.text : 'text-gray-600'
                          }`}
                        >
                          {tool.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tool.tags.map((tag, idx) => {
                            const tagTheme =
                              toolThemes[idx] || fullTagThemes.ai;
                            return (
                              <span
                                key={tag}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300 ${
                                  isHovered
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
                })
              ) : (
                <div className="col-span-full">
                  <NoSearchResults />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <FeatureSection />
    </div>
  );
}
