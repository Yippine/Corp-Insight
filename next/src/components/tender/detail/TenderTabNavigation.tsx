'use client';

import {
  Building2,
  FileText,
  Users,
  ShoppingCart,
  CheckCircle,
  Calendar,
  ClipboardList,
  Award,
  AlertCircle,
  FileSearch,
  Trophy,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Section } from '../../../hooks/useTenderDetail';
import { motion } from 'framer-motion';

// 定義頁籤圖標映射
export const tabIcons: Record<string, React.ElementType> = {
  機關資料: Building2,
  已公告資料: FileText,
  投標廠商: Users,
  決標品項: ShoppingCart,
  決標資料: CheckCircle,
  採購資料: ClipboardList,
  招標資料: Calendar,
  領投開標: Award,
  其他: FileSearch,
  無法決標公告: AlertCircle,
  標案內容: FileText,
  最有利標: Trophy,
};

interface TenderTabNavigationProps {
  sections: Section[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TenderTabNavigation({
  sections,
  activeTab,
  onTabChange,
}: TenderTabNavigationProps) {
  // 在客戶端時獲取路由寬度
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setAvailableWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // 計算每個標籤佔用的平均寬度（粗略估算，包含圖標）
  const avgTabWidth = 140; // 平均每個標籤寬度（像素）
  const maxTabs = Math.floor((availableWidth * 0.9) / avgTabWidth);

  // 若標籤數量超過可見區域，則顯示下拉選單
  const shouldUseDropdown = sections.length > maxTabs;

  // 下拉選單模式
  if (shouldUseDropdown) {
    return (
      <div className="relative z-10 rounded-lg bg-white p-3 shadow">
        <select
          value={activeTab}
          onChange={e => onTabChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {sections.map(section => (
            <option key={section.title} value={section.title}>
              {section.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 標籤模式 - 完全比照 Legacy 設計
  return (
    <div className="flex space-x-1 bg-gradient-to-r from-blue-50 to-gray-50 p-1 rounded-xl shadow-inner">
      {sections.map(section => {
        const Icon = tabIcons[section.title] || FileText;
        const isActive = activeTab === section.title;

        return (
          <motion.button
            key={section.title}
            onClick={() => onTabChange(section.title)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              ${
                isActive
                  ? 'bg-white shadow-lg text-blue-600'
                  : 'text-gray-500 hover:bg-white/80'
              } flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all
            `}
          >
            <Icon className={`h-5 w-5 mr-2 ${
              isActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            {section.title}
          </motion.button>
        );
      })}
    </div>
  );
}
