'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { getIconForTool, getIconForTag } from '@/lib/aitool/tagIconMap';
import type { Tools, ColorTheme } from '@/lib/aitool/types';
import SearchAnalysis from './SearchAnalysis';
import { useState, useRef, useLayoutEffect } from 'react';

interface ToolCardProps {
  tool: Tools;
  index: number;
  isExpanded: boolean;
  primaryTheme: ColorTheme;
  fullTagThemes: Record<string, ColorTheme>;
  showDebugInfo: boolean;
  searchQuery: string;
  onNavigate: () => void;
  onToggleExpand: () => void;
}

export default function ToolCard({
  tool,
  index,
  isExpanded,
  primaryTheme,
  fullTagThemes,
  showDebugInfo,
  searchQuery,
  onNavigate,
  onToggleExpand,
}: ToolCardProps) {
  const IconComponent = getIconForTool(tool.tags);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useLayoutEffect(() => {
    function checkClamp() {
      if (descriptionRef.current) {
        setIsClamped(
          descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
        );
      }
    }
    checkClamp();
    window.addEventListener('resize', checkClamp);
    return () => window.removeEventListener('resize', checkClamp);
  }, []);

  const toolThemes = tool.tags
    .map(t => fullTagThemes[t] || fullTagThemes.ai)
    .filter(Boolean);

  const showChevron = showDebugInfo || isClamped;
  const showActiveStyles = isHovered;

  return (
    <motion.div
      key={tool.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.05 },
      }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full"
    >
      <motion.button
        onClick={onNavigate}
        className={`relative flex h-full w-full flex-col rounded-xl p-6 text-left transition-shadow duration-300 ${
          showActiveStyles
            ? `shadow-lg ${primaryTheme.shadow} border-2 ${primaryTheme.text}`
            : 'border border-gray-100 shadow'
        }`}
        initial={{ minHeight: "250px" }}
        animate={{ minHeight: isExpanded ? "auto" : "250px" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {showChevron && (
          <motion.div
            className="absolute bottom-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            <ChevronDown size={20} />
          </motion.div>
        )}

        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={onNavigate}
        >
          <div className="mb-4 flex items-center">
            <div
              className={`rounded-lg p-3 transition-all duration-300 ${
                showActiveStyles
                  ? primaryTheme.primary
                  : primaryTheme.secondary
              }`}
            >
              <IconComponent
                className={`h-6 w-6 transition-all duration-300 ${
                  showActiveStyles ? 'text-white' : primaryTheme.text
                }`}
              />
            </div>
            <h3
              className={`ml-4 text-xl font-semibold transition-colors duration-300 ${
                showActiveStyles ? primaryTheme.text : 'text-gray-900'
              }`}
            >
              {tool.name}
            </h3>
          </div>
        </div>

        <div
          className={`flex-grow ${showChevron ? 'cursor-pointer' : ''}`}
          onClick={e => {
            if (showChevron) {
              e.stopPropagation();
              onToggleExpand();
            }
          }}
        >
          <p
            ref={descriptionRef}
            className={`transition-colors duration-300 ${
              isExpanded ? 'line-clamp-none' : 'line-clamp-3'
            } ${showActiveStyles ? primaryTheme.text : 'text-gray-600'}`}
          >
            {tool.description}
          </p>
        </div>

        <div
          className={`mt-auto flex-shrink-0 pt-4 ${
            showChevron ? 'cursor-pointer' : ''
          }`}
          onClick={e => {
            if (showChevron) {
              e.stopPropagation();
              onToggleExpand();
            }
          }}
        >
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag, idx) => {
              const tagTheme = toolThemes[idx] || fullTagThemes.ai;
              const TagIcon = getIconForTag(tag);
              return (
                <div
                  key={tag}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    showActiveStyles
                      ? `${tagTheme.primary} text-white`
                      : `${tagTheme.secondary} ${tagTheme.text}`
                  }`}
                >
                  <TagIcon className="h-4 w-4" />
                  <span>{tag}</span>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {showDebugInfo && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <SearchAnalysis
                  tool={tool}
                  keywords={searchQuery.split(' ').filter(Boolean)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </motion.div>
  );
}