import { motion } from 'framer-motion';
import { Building2, FileText, Users } from 'lucide-react';
import { Section } from '../../../hooks/useTenderDetail';

// 定義頁籤圖標映射
export const tabIcons = {
  '機關資料': Building2,
  '已公告資料': FileText,
  '投標廠商': Users,
  '決標品項': FileText,
  '決標資料': FileText,
  '採購資料': FileText,
  '招標資料': FileText,
  '領投開標': FileText,
  '其他': FileText,
  '無法決標公告': FileText,
  '標案內容': FileText,
  '最有利標': Users
} as const;

interface TenderTabNavigationProps {
  sections: Section[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TenderTabNavigation({ 
  sections, 
  activeTab, 
  onTabChange 
}: TenderTabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-gradient-to-r from-blue-50 to-gray-50 p-1 rounded-xl shadow-inner">
      {sections.map((section) => {
        const Icon = tabIcons[section.title as keyof typeof tabIcons] || FileText;
        return (
          <motion.button
            key={section.title}
            onClick={() => onTabChange(section.title)}
            className={`${
              activeTab === section.title
                ? 'bg-white shadow-lg text-blue-600'
                : 'text-gray-500 hover:bg-white/80'
            } flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className={`h-5 w-5 mr-2 ${
              activeTab === section.title ? 'text-blue-500' : 'text-gray-400'
            }`} />
            {section.title}
          </motion.button>
        );
      })}
    </div>
  );
}