import { useEffect, useCallback, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { tools } from '../../config/tools'
import { sortToolsByTags } from '../../utils/toolSorter'
import { ListFilter, Search } from 'lucide-react'
import { categoryThemes, fullTagThemes } from '../../config/theme'
import { useToolNavigation } from '../../hooks/useToolNavigation'
import FeatureSection from '../FeatureSection'

export default function ToolsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState(decodeURIComponent(searchParams.get('q') || ''))
  const [selectedTag, setSelectedTag] = useState(decodeURIComponent(searchParams.get('tag') || ''))
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  useToolNavigation()

  // 強化參數同步邏輯
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', encodeURIComponent(searchQuery))
    if (selectedTag) params.set('tag', encodeURIComponent(selectedTag))
    
    // 避免無限循環的關鍵判斷
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true })
    }
  }, [searchQuery, selectedTag, searchParams, setSearchParams])

  // 效能優化過濾邏輯
  const filteredTools = useCallback(() => {
    let filtered = [...tools]
    const query = searchQuery.toLowerCase()
    const tag = selectedTag

    if (query) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      )
    }

    if (tag && tag !== '全部') {
      filtered = filtered.filter(t => t.tags.includes(tag))
    }

    return sortToolsByTags(filtered)
  }, [searchQuery, selectedTag])

  // 強化標籤切換邏輯
  const handleTagSelect = (tag: string) => {
    setSelectedTag(prevTag => tag === '全部' || prevTag === tag ? '' : tag)
  }

  // 強化導航邏輯
  const handleToolClick = (toolId: string) => {
    sessionStorage.setItem('toolListScroll', window.scrollY.toString())
    sessionStorage.setItem('toolListSearch', searchParams.toString())
    navigate(`/ai-assistant/${toolId}`)
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
              const toolThemes = tool.tags
                .map(t => fullTagThemes[t] || fullTagThemes.ai)
                .filter(Boolean)
              const primaryTheme = toolThemes[0] || fullTagThemes.ai

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
                      <div className={`p-3 rounded-lg ${
                        hoveredTool === tool.id ? primaryTheme.primary : primaryTheme.secondary
                      }`}>
                        <tool.icon className={`h-6 w-6 ${
                          hoveredTool === tool.id ? 'text-white' : primaryTheme.icon
                        }`} />
                      </div>
                      <h3 className={`text-xl font-semibold ml-4 ${
                        hoveredTool === tool.id ? primaryTheme.text : 'text-gray-900'
                      }`}>
                        {tool.name}
                      </h3>
                    </div>
                    <p className={`${
                      hoveredTool === tool.id ? primaryTheme.text : 'text-gray-600'
                    }`}>
                      {tool.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tool.tags.map((tag, idx) => {
                        const tagTheme = toolThemes[idx] || fullTagThemes.ai
                        return (
                          <span
                            key={tag}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              hoveredTool === tool.id 
                                ? `${tagTheme.primary} text-white` 
                                : `${tagTheme.secondary} ${tagTheme.text}`
                            }`}
                          >
                            {tagTheme.name}
                          </span>
                        )
                      })}
                    </div>
                  </button>
                </motion.div>
              )
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

      <FeatureSection />
    </div>
  )
}