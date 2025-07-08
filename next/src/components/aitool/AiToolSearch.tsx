'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ListFilter, Search, TestTube2 } from 'lucide-react';
import {
  searchToolsFromAPI,
  getTagStatistics,
} from '@/lib/aitool/apiHelpers';
import { initializeTagColorMap, getTagColor } from '@/lib/aitool/tagColorMap';
import { getIconForTag } from '@/lib/aitool/tagIconMap';
import type { Tools } from '@/lib/aitool/types';
import NoSearchResults from '@/components/common/NoSearchResults';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';
import { useLoading } from '@/components/common/loading/LoadingProvider';
import { trackBusinessEvents } from '../GoogleAnalytics';
import LineBotBanner from './LineBotBanner';
import FeatureSection from '@/components/FeatureSection';
import SearchAnalysis from './SearchAnalysis';
import ToolCard from './ToolCard';

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
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [tagsForFilter, setTagsForFilter] = useState<string[]>([]);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 統一的資料獲取函式
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

  // 首次掛載時，獲取初始工具和完整的標籤列表
  useEffect(() => {
    // 獲取初始搜尋結果
    fetchTools(initialQuery, initialTag);

    // 獲取所有標籤用於篩選器，並初始化顏色
    const initializeTags = async () => {
      try {
        const allToolsData = await searchToolsFromAPI('', '');
        const stats = getTagStatistics(allToolsData);
        const topTags = stats.mergedTags.map((t: { tag: string }) => t.tag);
        setTagsForFilter(topTags);
        initializeTagColorMap(topTags);
      } catch (error) {
        console.error('Error initializing tags:', error);
      }
    };
    initializeTags();
  }, [initialQuery, initialTag, fetchTools]);

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

    setIsLoading(true); // 立即顯示載入狀態
    debounceTimeout.current = setTimeout(() => {
      fetchTools(searchQuery, selectedTag);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery, selectedTag, fetchTools, pathname, router]);

  // 當搜尋關鍵字為空時，自動隱藏搜尋分析模式
  useEffect(() => {
    if (!searchQuery) {
      setShowDebugInfo(false);
    }
  }, [searchQuery]);

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

  const handleToggleExpand = (toolId: string) => {
    const newExpandedToolId = expandedToolId === toolId ? null : toolId;
    setExpandedToolId(newExpandedToolId);

    if (newExpandedToolId && showDebugInfo) {
      setTimeout(() => {
        const toolIndex = tools.findIndex(t => t.id === newExpandedToolId);
        const cardElement = cardRefs.current[toolIndex];

        if (cardElement) {
          const targetPosition =
            window.scrollY + cardElement.getBoundingClientRect().top - 22;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }
      }, 450);
    }
  };

  const currentTag = searchParams.get('tag') || '';
  const isDebugButtonDisabled = !searchQuery || (!isLoading && tools.length === 0);

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

          {process.env.NODE_ENV === 'development' && (
            <motion.button
              onClick={() => setShowDebugInfo(prev => !prev)}
              disabled={isDebugButtonDisabled}
              whileHover={isDebugButtonDisabled ? {} : { filter: 'brightness(90%)' }}
              whileTap={{ filter: 'brightness(80%)' }}
              className={`ml-4 flex items-center rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                isDebugButtonDisabled
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <TestTube2 className="mr-2 h-5 w-5" />
              <span>{showDebugInfo ? '隱藏搜尋分析' : '顯示搜尋分析'}</span>
            </motion.button>
          )}

          <div className="ml-4 flex items-center rounded-lg bg-gray-50 px-4 py-2">
            <ListFilter className="mr-2 h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-600">
              {isLoading ? '...' : `${tools.length} 個工具`}
            </span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tagsForFilter.length > 0 ? (
            <>
              {tagsForFilter
                .slice(0, 12)
                .map(tag => {
                  const theme = getTagColor(tag);
                  const TagIcon = getIconForTag(tag);
                  return (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagSelect(tag)}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-all duration-300 ${
                        currentTag === tag || (!currentTag && tag === '全部')
                          ? `bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} text-white ${theme.shadow}`
                          : `${theme.secondary} ${theme.text} ${theme.hover}`
                      }`}
                    >
                      <TagIcon className="h-4 w-4" />
                      <span>{tag}</span>
                    </motion.button>
                  );
                })}
              <AnimatePresence>
                {isTagsExpanded &&
                  tagsForFilter
                    .slice(12)
                    .map(tag => {
                      const theme = getTagColor(tag);
                      const TagIcon = getIconForTag(tag);
                      return (
                        <motion.button
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTagSelect(tag)}
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-all duration-300 ${
                            currentTag === tag
                              ? `bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} text-white ${theme.shadow}`
                              : `${theme.secondary} ${theme.text} ${theme.hover}`
                          }`}
                        >
                          <TagIcon className="h-4 w-4" />
                          <span>{tag}</span>
                        </motion.button>
                      );
                    })}
              </AnimatePresence>
              {tagsForFilter.length > 12 && (
                <motion.button
                  onClick={() => setIsTagsExpanded(prev => !prev)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-600"
                >
                  {isTagsExpanded ? '收合部分標籤' : `+ ${tagsForFilter.length - 12} 個其他標籤`}
                </motion.button>
              )}
            </>
          ) : (
            <div className="h-10" /> // Placeholder for tag buttons loading
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[250px] animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : tools.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {tools.map((tool, index) => (
              <div
                key={tool.id}
                ref={el => {
                  cardRefs.current[index] = el;
                }}
              >
                <ToolCard
                  tool={tool}
                  index={index}
                  isExpanded={expandedToolId === tool.id}
                  showDebugInfo={showDebugInfo}
                  searchQuery={searchQuery}
                  onNavigate={() => handleToolClick(tool.id)}
                  onToggleExpand={() => handleToggleExpand(tool.id)}
                  onTagClick={handleTagSelect}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <NoSearchResults
            query={searchQuery}
            onClear={() => {
              setSearchQuery('');
              setSelectedTag('');
            }}
          />
        )}
      </div>
      <FeatureSection />
    </div>
  );
}
