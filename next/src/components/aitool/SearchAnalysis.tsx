'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown } from 'lucide-react';

interface MatchDetail {
  field: string;
  keyword: string;
  content: string;
  score: number;
}

interface SearchAnalysisProps {
  tool: any;
  keywords: string[];
}

// Helper function to highlight keywords in a string
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="font-bold" style={{ boxShadow: 'inset 0 -0.5em 0 0 rgba(255, 215, 0, 0.4)' }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const ScoreDetailItem: React.FC<{ detail: MatchDetail; isExpanded: boolean; onClick: () => void }> = ({ detail, isExpanded, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <button onClick={onClick} className="w-full text-left p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-0.5">✔️</span>
            <div>
              <span className="font-semibold text-gray-700">{detail.field}</span>
              <p className="font-mono bg-gray-100 p-1.5 mt-1 rounded text-xs text-gray-800 break-words">
                "{detail.keyword}"
              </p>
            </div>
          </div>

          <div className="flex items-center pl-2 flex-shrink-0">
            <span className="text-blue-500 font-semibold">
              + {detail.score} 分
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2"
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3"
          >
            <div className="ml-7 pl-3 border-l-2 border-yellow-400 bg-gray-50 p-2 rounded-r-md">
                <p className="text-gray-700 text-sm break-all">
                <HighlightedText text={detail.content} highlight={detail.keyword} />
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchAnalysis: React.FC<SearchAnalysisProps> = ({ tool, keywords }) => {
  if (!tool || !tool.matchDetails) {
    return null;
  }

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const {
    matchDetails = [],
    baseScore = 0,
    matchedKeywordCount = 0,
    totalKeywords = 0,
    multiplier = 1,
    score: finalScore = 0,
  } = tool;

  const perfectMatchBonus = tool.matchDetails.find((d: any) => d.field === '完美匹配');

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-4 p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
        <span className="text-yellow-600">📊</span> 計分儀表板
      </h3>
      
      {/* Section 1: Base Score Calculation */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">1. 基礎分累加 (Base Score)</h4>
        <div className="space-y-2">
          {matchDetails.map((detail: any, index: number) => (
            <ScoreDetailItem 
              key={index}
              detail={detail}
              isExpanded={expandedIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
        <div className="text-right mt-2 font-bold text-lg text-gray-700">
          基礎分: {baseScore}
        </div>
      </div>

      {/* Section 2: Keyword Coverage Multiplier */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">2. 關鍵字覆蓋率加權 (Keyword Coverage Multiplier)</h4>
        <div className="bg-white p-3 rounded-md shadow-sm text-center">
          <p className="text-gray-600">
            成功匹配 <span className="font-bold text-blue-600">{matchedKeywordCount}</span> 個獨立關鍵字 (共 <span className="font-bold">{totalKeywords}</span> 個)
          </p>
          <p className="text-2xl font-bold text-purple-600 my-1">
            x {multiplier.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">(匹配越多，加權倍率越高)</p>
        </div>
      </div>

      {/* Section 3: Final Score Calculation */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">3. 最終總分 (Final Score)</h4>
        <div className="bg-gradient-to-r from-yellow-100 to-amber-200 p-4 rounded-lg text-center shadow-inner">
           <p className="text-gray-600 font-mono text-base">
            (基礎分 <span className="font-bold">{baseScore}</span> x 加權倍率 <span className="font-bold">{multiplier.toFixed(1)}</span>)
            {perfectMatchBonus ? ` + 完美匹配 ${perfectMatchBonus.score}` : ''}
          </p>
          <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500 mt-1">
            = {Math.round(finalScore)}
          </p>
          <div className="flex justify-center items-center mt-2 text-yellow-600">
            <span className="text-2xl">⭐</span>
            <span className="text-3xl mx-2">⭐</span>
            <span className="text-2xl">⭐</span>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default SearchAnalysis;