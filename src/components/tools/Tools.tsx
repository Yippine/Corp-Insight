import { useState, useMemo, useEffect } from 'react';
import { Tool, tools } from '../../config/tools';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ListFilter } from 'lucide-react';
import { categoryThemes, fullTagThemes } from '../../config/theme';
import { sortToolsByTags } from '../../utils/toolSorter';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';

export default function Tools() {
  const { toolId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));
  const [searchQuery, setSearchQuery] = useState(decodeURIComponent(searchParams.get('q') || ''));
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  useEffect(() => {
    const tool = tools.find(t => t.id === toolId) || null;
    if (tool) {
      setSelectedTool(tool);
      window.scrollTo(0, 0);
    } else if (toolId) {
      navigate('/ai-assistant', { replace: true });
    }
  }, [toolId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', encodeURIComponent(searchQuery));
    if (selectedTag) params.set('tag', encodeURIComponent(selectedTag));
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedTag]);

  useEffect(() => {
    const initialTag = searchParams.get('tag');
    const initialQuery = decodeURIComponent(searchParams.get('q') || '');
    setSelectedTag(initialTag);
    setSearchQuery(initialQuery);
  }, []);

  const handleTagSelect = (tag: string | null) => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', encodeURIComponent(searchQuery));
    if (tag) newParams.set('tag', encodeURIComponent(tag));
    setSearchParams(newParams);
    setSelectedTag(tag);
    setFilterKey(prev => prev + 1);
  };

  const handleSearchChange = (query: string) => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', encodeURIComponent(query));
    if (selectedTag) newParams.set('tag', selectedTag);
    setSearchParams(newParams);
    setSearchQuery(query);
    setFilterKey(prev => prev + 1);
  };

  const filteredTools = useMemo(() => {
    let filtered = [...tools];
    
    // 如果有搜索查詢，先進行過濾
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) || 
        tool.description.toLowerCase().includes(query)
      );
    }

    // 根據選中的標籤進行過濾
    if (selectedTag && selectedTag !== '全部') {
      filtered = filtered.filter(tool => tool.tags.includes(selectedTag));
    }

    return sortToolsByTags(filtered);
  }, [selectedTag, searchQuery, filterKey]);

  if (selectedTool) {
    const ToolComponent = selectedTool.component;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <button
          onClick={() => {
            const state = sessionStorage.getItem('previousToolSearchState');
            const { searchParams, scrollPosition } = state ? JSON.parse(state) : {};
            navigate(`/ai-assistant${searchParams ? `?${searchParams}` : ''}`, {
              state: { scrollPosition }
            });
          }}
          className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <X className="w-5 h-5 mr-2" />
          返回工具列表
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{selectedTool.name}</h2>
          <ToolComponent />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="搜尋工具..."
            />
          </div>
          <div className="flex items-center ml-4 px-4 py-2 bg-gray-50 rounded-lg">
            <ListFilter className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-600 font-medium">
              {filteredTools.length} 個工具
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryThemes).map(([tag, theme]) => {
            const isSelected = selectedTag === tag || (!selectedTag && tag === '全部');
            
            return (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagSelect(tag === '全部' ? null : tag)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isSelected 
                    ? `bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} text-white ${theme.shadow}` 
                    : `${theme.secondary} ${theme.text} ${theme.hover}`
                  }
                `}
              >
                {theme.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait" key={filterKey}>
          {filteredTools.map((tool, index) => {
            // 使用完整版的標籤主題，並確保顏色按照彩虹順序排列
            const toolThemes = tool.tags
              .map(tag => fullTagThemes[tag] || fullTagThemes.ai)
              .filter(Boolean);
            
            const primaryTheme = toolThemes[0] || fullTagThemes.ai;
            
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
                  onClick={() => {
                    const currentParams = new URLSearchParams(window.location.search);
                    const scrollPosition = window.scrollY;
                    sessionStorage.setItem('previousToolSearchState', JSON.stringify({
                      searchParams: currentParams.toString(),
                      scrollPosition
                    }));
                    navigate(`/ai-assistant/${tool.id}`);
                  }}
                  className={`
                    relative w-full bg-white p-6 rounded-xl text-left
                    ${hoveredTool === tool.id 
                      ? `shadow-lg ${primaryTheme.shadow} border-2 ${primaryTheme.text}` 
                      : 'shadow border border-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center mb-4">
                    <div className={`
                      p-3 rounded-lg
                      ${hoveredTool === tool.id ? primaryTheme.primary : primaryTheme.secondary}
                    `}>
                      <tool.icon className={`
                        h-6 w-6
                        ${hoveredTool === tool.id ? 'text-white' : primaryTheme.icon}
                      `} />
                    </div>
                    <h3 className={`
                      text-xl font-semibold ml-4
                      ${hoveredTool === tool.id ? primaryTheme.text : 'text-gray-900'}
                    `}>
                      {tool.name}
                    </h3>
                  </div>
                  <p className={`
                    ${hoveredTool === tool.id ? primaryTheme.text : 'text-gray-600'}
                  `}>
                    {tool.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.tags.map((tag, index) => {
                      const tagTheme = toolThemes[index] || fullTagThemes.ai;
                      return (
                        <span
                          key={tag}
                          className={`
                            px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-300
                            ${hoveredTool === tool.id 
                              ? `${tagTheme.primary} text-white` 
                              : `${tagTheme.secondary} ${tagTheme.text}`
                            }
                          `}
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

      {filteredTools.length === 0 && (
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