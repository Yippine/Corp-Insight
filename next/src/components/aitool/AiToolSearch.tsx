'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ListFilter, Search } from 'lucide-react';
import { Tools, categoryThemes, fullTagThemes, getToolsData, iconMap } from '@/lib/aitool/tools';
import { sortToolsBySelectedTag } from '@/lib/aitool/toolSorter';
import NoSearchResults from '@/components/common/NoSearchResults';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';

interface AiToolSearchProps {
  initialQuery: string;
  initialTag: string;
}

export default function AiToolSearch({ initialQuery, initialTag }: AiToolSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || initialQuery);
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get('tag') || initialTag);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [tools, setTools] = useState<Tools[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const toolsData = getToolsData();
    setTools(toolsData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    if (selectedTag) {
      params.set('tag', selectedTag);
    } else {
      params.delete('tag');
    }
    
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    
    if (newUrl !== `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`) {
      router.replace(newUrl, { scroll: false });
    }

  }, [searchQuery, selectedTag, router, pathname, searchParams]);

  const filteredTools = useCallback(() => {
    if (!tools.length) return [];
    
    let filtered = [...tools];
    const currentQueryFromUrl = (searchParams.get('q') || '').toLowerCase();
    const currentTagFromUrl = searchParams.get('tag') || '';

    if (currentQueryFromUrl) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(currentQueryFromUrl) || 
        t.description.toLowerCase().includes(currentQueryFromUrl)
      );
    }

    if (currentTagFromUrl && currentTagFromUrl !== '全部') {
      filtered = filtered.filter(t => t.tags.includes(currentTagFromUrl));
    }
    
    return sortToolsBySelectedTag(filtered, currentTagFromUrl);
  }, [searchParams, tools]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = searchParams.get('q') || '';
      const tag = searchParams.get('tag') || '';
      const hasResults = filteredTools().length > 0 || (!query && !tag);

      if (!hasResults) {
        document.title = dynamicTitles.aiToolSearchNoResult(query, tag);
      } else if (query && tag) {
        document.title = dynamicTitles.aiToolSearchWithQueryAndTag(query, tag);
      } else if (query) {
        document.title = dynamicTitles.aiToolSearchWithQuery(query);
      } else if (tag) {
        document.title = dynamicTitles.aiToolSearchWithTag(tag);
      } else {
        document.title = staticTitles.aiToolSearch;
      }
    }
  }, [searchParams, filteredTools]);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(prevTag => {
      const newTag = tag === '全部' || prevTag === tag ? '' : tag;
      return newTag;
    });
  };

  const handleToolClick = (toolId: string) => {
    sessionStorage.setItem('toolSearchParams', searchParams.toString());
    sessionStorage.setItem('toolSearchScroll', window.scrollY.toString());
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

      {isLoading ? (
        <div className="py-12">
          <InlineLoading />
        </div>
      ) : (
        <>
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
                primaryTheme = primaryTheme || categoryThemes.default;

                const IconComponent = iconMap[tool.iconName] || iconMap.Zap;

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
                      <p className={`transition-colors duration-200 ${
                        hoveredTool === tool.id ? primaryTheme.text : 'text-gray-600'
                      }`}>
                        {tool.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tool.tags.map((tag) => {
                          const themeFromCategory = categoryThemes[tag];
                          const themeFromFull = fullTagThemes[tag];
                          const tagTheme = themeFromCategory || themeFromFull || categoryThemes.default;
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

          {filteredTools().length === 0 && !isLoading && (
            <NoSearchResults 
              message="很抱歉，我們找不到符合您搜尋條件的工具。" 
              searchTerm={searchParams.get('q') || ''}
              onReset={() => {
                setSearchQuery('');
                setSelectedTag('');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}